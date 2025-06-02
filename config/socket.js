const { Server } = require("socket.io");
const { Op } = require("sequelize");
const {
  OnlineAgents,
  ChatMessages,
  ChatConversations,
  ChatQueue,
} = require("../models/index.js");
const { getAvailableAgent } = require("../utility/clientApi.js");

const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: [
        "https://api.baladiexpress.com",
        "https://baladiexpress.com",
        "https://vendor.baladiexpress.com",
        "https://qc.baladiexpress.com",
        "http://localhost:3000",
        "http://localhost:3001",
        "https://localhost:3000",
        "https://localhost:3001",
        "*",
      ],
      methods: ["GET", "POST"],
      transports: ["websocket", "polling"],
    },
  });

  console.log(
    "✅ Socket.IO server initialized on port",
    process.env.SOCKETPORT
  );

  io.on("connection", (socket) => {
    console.log("user connect" + socket.id);
    socket.on("register_agent", async ({ agentId, agentName }) => {
      try {
        const agent = await OnlineAgents.findOne({
          where: { agent_id: agentId },
        });
        // console.log(agent)
        if (agent) {
          await OnlineAgents.update(
            { socket_id: socket.id, last_ping: new Date(), is_available: true },
            { where: { agent_id: agentId } }
          );
          console.log(
            `Agent ${agentId} registered with socketId: ${socket.id}`
          );
          socket.emit("agent_registered", { msg: "تم تسجيل الوكيل بنجاح" });
        } else {
          const agent = await OnlineAgents.create({
            agent_name: agentName,
            socket_id: socket.id,
            agent_id: agentId,
            last_ping: new Date(),
            is_available: true,
          });
          console.log(
            `Agent ${agent.id} registered with socketId: ${socket.id}`
          );
        }
      } catch (error) {
        console.error("Error in register_agent:", error);
        socket.emit("error", { msg: "خطأ أثناء تسجيل الوكيل" });
      }
    });

    // إرسال رسالة ترحيب
    socket.emit("welcome", {
      message: "مرحباً! تم الاتصال بنجاح مع الباك إند",
      socketId: socket.id,
      time: new Date().toLocaleString("ar-EG"),
    });

    // إخبار باقي المستخدمين
    socket.broadcast.emit("user_joined", {
      message: `مستخدم جديد انضم (${socket.id})`,
      time: new Date().toLocaleString("ar-EG"),
    });

    // الانضمام إلى غرفة محادثة
    socket.on("join_chat", async ({ chat_id, userId, userType }) => {
      try {
        console.log({ chat_id, userId, userType });
        if (!userId || !userType || !chat_id) {
          socket.emit("error", {
            msg: "يجب إرسال userId و userType و chat_id",
          });
          return;
        }

        // التحقق من وجود المحادثة
        const conversation = await ChatConversations.findOne({
          where: {
            id: chat_id,
            // [userType === "customer" ? "customer_id" : "crm_agent_id"]: userId,
          },
        });

        if (!conversation) {
          socket.emit("error", { msg: "محادثة غير صالحة أو غير مصرح لك" });
          return;
        }

        // إضافة المستخدم إلى الـ room
        const roomId = `conversation_${chat_id}`;

        // for (const room of socket.rooms) {
        //   if (room !== socket.id) {
        //     socket.leave(room);
        //   }
        // }

        socket.join(roomId);
        const socketsInRoom = await io.in(roomId).allSockets();
        console.log("*".repeat(100));
        const count = socketsInRoom.size;
        console.log(count);
        console.log("*".repeat(100));
        socket.userId = userId;
        socket.userType = userType;
        socket.roomId = roomId;

        console.log(`User ${userId} (${userType}) joined room ${roomId}`);
        socket.to(roomId).emit("user_joined", {
          user_id: userId,
          user_type: userType,
        });

        // إذا كان وكيلاً، ينضم إلى غرفة الوكلاء
        if (userType === "agent") {
          socket.join("agents_room");
          await OnlineAgents.update(
            { last_ping: new Date(), is_available: true },
            { where: { agent_id: userId } }
          );
        }

        socket.emit("chat_joined", { chat_id, userId, userType });
      } catch (error) {
        console.error("Error in join_chat:", error);
        socket.emit("error", { msg: "خطأ في الانضمام للمحادثة" });
      }
    });

    // مغادرة غرفة محادثة
    socket.on("leave_chat", ({ chat_id }) => {
      const roomId = `conversation_${chat_id}`;
      socket.leave(roomId);
      console.log(`User ${socket.userId} left chat ${chat_id}`);
      socket.to(roomId).emit("user_left", {
        user_id: socket.userId,
        user_type: socket.userType,
      });
    });

    // إرسال رسالة في المحادثة
    socket.on(
      "send_chat_message",
      async (
        { chat_id, message, file_url, message_type = "text" },
        callback
      ) => {
        try {
          if (!socket.userId || !socket.userType) {
            socket.emit("error", { msg: "يجب تسجيل الدخول أولاً" });
            return callback && callback({ error: "يجب تسجيل الدخول أولاً" });
          }

          const conversation = await ChatConversations.findOne({
            where: {
              id: chat_id,
              status: { [Op.in]: ["waiting", "active"] },
              // [socket.userType === "customer" ? "customer_id" : "crm_agent_id"]:
              //   socket.userId,
            },
          });

          if (!conversation) {
            socket.emit("error", { msg: "المحادثة غير موجودة أو مغلقة" });
            return (
              callback && callback({ error: "المحادثة غير موجودة أو مغلقة" })
            );
          }

          const newMessage = await ChatMessages.create({
            conversation_id: chat_id,
            sender_type: socket.userType,
            sender_id: socket.userId,
            message: message || "",
            message_type,
            file_url,
            created_at: new Date(),
          });

          console.log(`📩 New message created:`, newMessage.toJSON());

          // بث الرسالة للـ room الخاص بالمحادثة فقط
          const roomId = `conversation_${chat_id}`;
          io.to(roomId).emit("new_message", {
            message: newMessage,
            sender_type: socket.userType,
            conversation_id: chat_id,
          });

          callback && callback({ success: true, message: newMessage });
        } catch (error) {
          console.error("Error in send_chat_message:", error);
          socket.emit("error", { msg: "خطأ أثناء إرسال الرسالة" });
          callback && callback({ error: "خطأ أثناء إرسال الرسالة" });
        }
      }
    );

    // إشعار الكتابة
    socket.on("typing", ({ chat_id, is_typing }) => {
      const roomId = `conversation_${chat_id}`;
      socket.to(roomId).emit("user_typing", {
        user_id: socket.userId,
        user_type: socket.userType,
        is_typing,
      });
    });

    // تحديث حالة القراءة
    socket.on("mark_as_read", async ({ chat_id, message_ids }) => {
      try {
        await ChatMessages.update(
          { is_read: true },
          { where: { id: message_ids, conversation_id: chat_id } }
        );
        const roomId = `conversation_${chat_id}`;
        socket.to(roomId).emit("messages_read", {
          user_id: socket.userId,
          message_ids,
        });
      } catch (error) {
        console.error("Error in mark_as_read:", error);
        socket.emit("error", { msg: "خطأ أثناء تحديث حالة القراءة" });
      }
    });

    // قطع الاتصال
    socket.on("disconnect", async (reason) => {
      console.log(`❌ User ${socket.id} disconnected:`, reason);
      socket.broadcast.emit("user_left", {
        message: `مستخدم غادر (${socket.id})`,
        reason: reason,
        time: new Date().toLocaleString("ar-EG"),
      });

      if (socket.userType === "agent" && socket.userId) {
        try {
          await OnlineAgents.update(
            { is_available: false },
            { where: { agent_id: socket.userId } }
          );
        } catch (error) {
          console.error("Error updating agent status:", error);
        }
      }
    });

    // فحص دوري لتوزيع المحادثات المنتظرة على الوكلاء المتاحين (كل 20 ثانية)
    setInterval(async () => {
      try {
        // جلب أول محادثة في الطابور
        const queuedConversation = await ChatQueue.findOne({
          include: [
            {
              model: ChatConversations,
              where: { status: "waiting" },
              as: "conversation",
              required: true,
            },
          ],
          order: [["created_at", "ASC"]],
        });

        if (!queuedConversation) {
          console.log("No queued conversations found.");
          return;
        }

        const conversation = queuedConversation.conversation;
        if (!conversation) {
          console.log("No queued conversations found.");
          return;
        }
        // جلب وكيل متاح من الـ API الخارجية
        const { agentId, agentName } = await getAvailableAgent();

        if (!agentId) {
          console.log("No available agent found.");
          return;
        }

        // تحديث المحادثة بالوكيل
        await ChatConversations.update(
          {
            crm_agent_id: agentId,
            status: "active",
            updated_at: new Date(),
          },
          { where: { id: conversation.id } }
        );

        // حذف المحادثة من الطابور
        await ChatQueue.destroy({
          where: { conversation_id: conversation.id },
        });

        // جلب socket_id بتاع الوكيل
        const agent = await OnlineAgents.findOne({
          where: { agent_id: agentId },
        });
        if (agent && agent.socket_id) {
          io.to(agent.socket_id).emit("agent_assigned", {
            conversation_id: conversation.id,
            agent_id: agentId,
            agent_name: agentName,
          });
        }

        // إشعار العميل في الـ room
        io.to(`conversation_${conversation.id}`).emit("agent_assigned", {
          conversation_id: conversation.id,
          agent_id: agentId,
          agent_name: agentName,
        });

        console.log(
          `Conversation ${conversation.id} assigned to agent ${agentId}`
        );
      } catch (error) {
        console.error("Error in queue check:", error.message);
      }
    }, 20000);
  });

  global.io = io;
  global.socketIO = io;
  return io;
};

module.exports = setupSocket;
