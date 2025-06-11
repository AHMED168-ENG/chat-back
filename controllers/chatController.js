// controller/v7/chat.js
require("dotenv").config();
const { Op, literal } = require("sequelize");
const sequelize = require("../config/sequelizeDb");
const {
  ChatConversations,
  ChatMessages,
  ChatQueue,
  OnlineAgents,
} = require("../models/index.js");
const language = require("../language/index");
const { getAvailableAgent } = require("../utility/clientApi.js");

let data = {};

data.startConversation = async (req, res) => {
  try {
    const { userId, subject, priority = 1, oldChat } = req.body;
    const lang = req.headers.lang || "en";

    const existingConversation = await ChatConversations.findOne({
      where: {
        customer_id: userId,
        status: { [Op.in]: ["waiting", "active"] },
      },
    });

    if (existingConversation) {
      // return res.status(400).json({
      //   ack: 0,
      //   msg:
      //     language[lang].chat.existing_conversation ||
      //     "لديك محادثة نشطة بالفعل",
      //   conversation_id: existingConversation.id,
      // });
      await ChatConversations.update(
        { status: "closed", closed_at: new Date(), updated_at: new Date() },
        { where: { id: existingConversation.id } }
      );
    }

    const { agentId, agentName } = await getAvailableAgent();
    // console.log(agentId, agentName);
    const conversationData = {
      customer_id: userId,
      subject: subject || language[lang].chat.default_subject,
      priority,
      status: agentId ? "active" : "waiting",
      created_at: new Date(),
      updated_at: new Date(),
    };

    if (agentId) {
      conversationData.crm_agent_id = agentId;
    } else {
      const queueCount = await ChatQueue.count();
      conversationData.queue_position = queueCount + 1;
    }

    const conversation = await ChatConversations.create(conversationData);

    if (!agentId) {
      await ChatQueue.create({
        customer_id: userId,
        conversation_id: conversation.id,
        position: conversation.queue_position,
        created_at: new Date(),
      });
    } else {
      // إرسال إشعار للوكيل باستخدام socket_id
      const agent = await OnlineAgents.findOne({
        where: { agent_id: agentId },
      });

      if (agent && agent.socket_id) {
        global.io.to(agent.socket_id).emit("agent_assigned", {
          conversation_id: conversation.id,
          agent_id: agentId,
          agent_name: agentName,
        });
      }
    }

    res.status(200).json({
      ack: 1,
      msg: language[lang].chat.conversation_created,
      conversation,
      queue_position: conversation.queue_position || null,
      estimated_wait_time: conversation.queue_position
        ? conversation.queue_position * 5
        : 0,
    });
  } catch (e) {
    console.error("Error in startConversation:", e);
    res.status(400).json({
      ack: 0,
      msg: language[lang].chat.error,
      error: e.message,
    });
  }
};

// إرسال رسالة

// data.startConversation = async (req, res) => {
//   try {
//     const { userId, subject, priority = 1, oldChat } = req.body;
//     const lang = req.headers.lang || "en";

//     const existingConversation = await ChatConversations.findOne({
//       where: {
//         customer_id: userId,
//         status: { [Op.in]: ["waiting", "active"] },
//       },
//     });

//     if (existingConversation) {
//       await ChatConversations.update(
//         { status: "closed", closed_at: new Date(), updated_at: new Date() },
//         { where: { id: existingConversation.id } }
//       );
//     }

//     const { agentId, agentName } = await getAvailableAgent();
//     const conversationData = {
//       customer_id: userId,
//       subject: subject || language[lang].chat.default_subject,
//       priority,
//       status: agentId ? "active" : "waiting",
//       created_at: new Date(),
//       updated_at: new Date(),
//     };

//     if (agentId) {
//       conversationData.crm_agent_id = agentId;
//     } else {
//       const queueCount = await ChatQueue.count();
//       conversationData.queue_position = queueCount + 1;
//     }

//     const conversation = await ChatConversations.create(conversationData);

//     // Handle old chat messages if oldChat is provided
//     let oldMessages = [];
//     if (oldChat) {
//       oldMessages = await ChatMessages.findAll({
//         where: { conversation_id: oldChat },
//         attributes: ["id", "message", "created_at", "sender"], // Adjust attributes as needed
//       });

//       // Copy old messages to new conversation
//       if (oldMessages.length > 0) {
//         const newMessages = oldMessages.map((msg) => ({
//           conversation_id: conversation.id,
//           message: msg.message,
//           sender: msg.sender,
//           created_at: msg.created_at,
//           updated_at: new Date(),
//         }));
//         await ChatMessages.bulkCreate(newMessages);
//       }
//     }

//     if (!agentId) {
//       await ChatQueue.create({
//         customer_id: userId,
//         conversation_id: conversation.id,
//         position: conversation.queue_position,
//         created_at: new Date(),
//       });
//     } else {
//       // Send notification and old messages to agent
//       const agent = await OnlineAgents.findOne({
//         where: { agent_id: agentId },
//       });

//       if (agent && agent.socket_id) {
//         global.io.to(agent.socket_id).emit("agent_assigned", {
//           conversation_id: conversation.id,
//           agent_id: agentId,
//           agent_name: agentName,
//           old_messages: oldMessages, // Send old messages to agent
//         });
//       }
//     }

//     res.status(200).json({
//       ack: 1,
//       msg: language[lang].chat.conversation_created,
//       conversation,
//       queue_position: conversation.queue_position || null,
//       estimated_wait_time: conversation.queue_position
//         ? conversation.queue_position * 5
//         : 0,
//     });
//   } catch (e) {
//     console.error("Error in startConversation:", e);
//     res.status(400).json({
//       ack: 0,
//       msg: language[lang].chat.error,
//       error: e.message,
//     });
//   }
// };

data.sendMessage = async (req, res) => {
  try {
    const lang = req.headers.lang || "en";
    const { conversation_id, message, userId } = req.body;
    const file_url = req.file ? req.file.path : null;
    const message_type = req.file
      ? req.file.mimetype.startsWith("image/")
        ? "image"
        : "file"
      : "text";

    const conversation = await ChatConversations.findOne({
      where: {
        id: conversation_id,
        customer_id: userId,
        status: { [Op.in]: ["waiting", "active"] },
      },
    });

    if (!conversation) {
      return res.status(404).json({
        ack: 0,
        msg: language[lang].chat.conversation_not_found,
      });
    }

    const newMessage = await ChatMessages.create({
      conversation_id,
      sender_type: "customer",
      sender_id: userId,
      message: message || "",
      message_type,
      file_url,
      created_at: new Date(),
    });

    // إرسال الرسالة للـ room الخاص بالمحادثة فقط
    global.io.to(`conversation_${conversation_id}`).emit("new_message", {
      message: newMessage,
      sender_type: "customer",
      conversation_id,
    });

    res.status(200).json({
      ack: 1,
      msg: language[lang].chat.message_sent,
      message: newMessage,
    });
  } catch (e) {
    console.error("Error in sendMessage:", e);
    res.status(400).json({
      ack: 0,
      msg: language[lang].chat.error,
      error: e.message,
    });
  }
};

// الحصول على تفاصيل المحادثة
data.getConversation = async (req, res) => {
  try {
    const userId = req.query.userId;
    const agentId = req.query.agentId;
    const lang = req.headers.lang || "en";
    const conversation_id = req.params.id;
    let query = {};
    if (agentId) query.crm_agent_id = agentId;
    if (userId) query.customer_id = userId;
    const conversation = await ChatConversations.findOne({
      where: {
        id: conversation_id,
        ...query,
      },
      include: [
        {
          model: ChatMessages,
          as: "messages",
          separate: true, // مهم جدًا علشان نقدر نعمل ترتيب داخل include
          order: [["created_at", "ASC"]],
        },
        {
          model: ChatQueue,
          as: "queue",
          required: false,
        },
      ],
    });

    if (!conversation) {
      return res.status(404).json({
        ack: 0,
        msg: language[lang].chat.conversation_not_found,
      });
    }

    await ChatMessages.update(
      { is_read: true },
      {
        where: {
          conversation_id,
          sender_type: "agent",
          is_read: false,
        },
      }
    );

    res.status(200).json({
      ack: 1,
      conversation,
    });
  } catch (e) {
    console.error("Error in getConversation:", e);
    res.status(400).json({
      ack: 0,
      msg: language[lang].chat.error,
      error: e.message,
    });
  }
};

// الحصول على محادثات المستخدم
data.getMyConversations = async (req, res) => {
  try {
    const userId = req.query.userId;
    const lang = req.headers.lang || "en";
    let limit = parseInt(req.query.limit) || 10;
    let offset = parseInt(req.query.page) || 1;
    if (offset > 0) offset = (offset - 1) * limit;

    const conversations = await ChatConversations.findAndCountAll({
      where: { customer_id: userId },
      include: [
        {
          model: ChatMessages,
          as: "messages",
          limit: 1,
          order: [["created_at", "DESC"]],
        },
      ],
      order: [["updated_at", "DESC"]],
      limit,
      offset,
    });

    res.status(200).json({
      ack: 1,
      conversations: conversations.rows,
      totalCount: conversations.count,
    });
  } catch (e) {
    console.error("Error in getMyConversations:", e);
    res.status(400).json({
      ack: 0,
      msg: language[lang].chat.error,
      error: e.message,
    });
  }
};

// الحصول على حالة الطابور
data.getQueueStatus = async (req, res) => {
  try {
    const userId = req.query.userId;
    const lang = req.headers.lang || "en";

    const queueInfo = await ChatQueue.findOne({
      where: { customer_id: userId },
      include: [
        {
          model: ChatConversations,
          as: "conversation",
          where: { status: "waiting" },
        },
      ],
    });

    if (!queueInfo) {
      return res.status(404).json({
        ack: 0,
        msg: language[lang].chat.no_waiting_conversation,
      });
    }

    const currentPosition = await ChatQueue.count({
      where: {
        position: { [Op.lte]: queueInfo.position },
        id: { [Op.ne]: queueInfo.id },
      },
    });

    res.status(200).json({
      ack: 1,
      queue_position: currentPosition + 1,
      estimated_wait_time: (currentPosition + 1) * 5,
      total_waiting: await ChatQueue.count(),
    });
  } catch (e) {
    console.error("Error in getQueueStatus:", e);
    res.status(400).json({
      ack: 0,
      msg: language[lang].chat.error,
      error: e.message,
    });
  }
};

// إغلاق المحادثة
data.closeConversation = async (req, res) => {
  try {
    const userId = req.query.userId;
    const agentId = req.query.agentId;
    let query = {};
    if (agentId) query.crm_agent_id = agentId;
    if (userId) query.customer_id = agentId;

    const lang = req.headers.lang || "en";
    const conversation_id = req.params.id;

    const conversation = await ChatConversations.findOne({
      where: {
        id: conversation_id,
        ...query,
      },
    });

    if (!conversation) {
      return res.status(404).json({
        ack: 0,
        msg: language[lang].chat.conversation_not_found,
      });
    }

    await ChatConversations.update(
      { status: "closed", closed_at: new Date(), updated_at: new Date() },
      { where: { id: conversation_id } }
    );

    await ChatQueue.destroy({ where: { conversation_id } });

    const queues = await ChatQueue.findAll({
      order: [["position", "ASC"]],
    });
    for (let i = 0; i < queues.length; i++) {
      await ChatQueue.update(
        { position: i + 1 },
        { where: { id: queues[i].id } }
      );
      await ChatConversations.update(
        { queue_position: i + 1 },
        { where: { id: queues[i].conversation_id } }
      );
      global.io
        .to(`conversation_${queues[i].conversation_id}`)
        .emit("queue_update", { position: i + 1 });
    }

    global.io
      .to(`conversation_${conversation_id}`)
      .emit("conversation_closed", {
        closed_by: "customer",
      });

    res.status(200).json({
      ack: 1,
      msg: language[lang].chat.conversation_closed,
    });
  } catch (e) {
    console.error("Error in closeConversation:", e);
    res.status(400).json({
      ack: 0,
      msg: language[lang].chat.error,
      error: e.message,
    });
  }
};

// تعيين وكيل
data.assignAgent = async (req, res) => {
  try {
    const lang = req.headers.lang || "en";
    const { conversation_id, agent_id } = req.body;

    const conversation = await ChatConversations.findOne({
      where: { id: conversation_id, status: "waiting" },
    });

    if (!conversation) {
      return res.status(404).json({
        ack: 0,
        msg: language[lang].chat.conversation_not_found,
      });
    }

    // التحقق من الوكيل أو إنشاؤه لو مش موجود
    let agent = await OnlineAgents.findOne({ where: { agent_id } });
    if (!agent) {
      // إنشاء وكيل جديد بإعدادات افتراضية
      agent = await OnlineAgents.create({
        agent_id,
        agent_name: `Agent ${agent_id}`, // اسم افتراضي
        is_available: true,
        current_conversations: 0,
        max_conversations: 5,
        created_at: new Date(),
      });
    }

    // التحقق من توفر الوكيل
    if (
      !agent.is_available ||
      agent.current_conversations >= agent.max_conversations
    ) {
      return res.status(400).json({
        ack: 0,
        msg: language[lang].chat.agent_unavailable,
      });
    }

    // تحديث المحادثة
    await ChatConversations.update(
      {
        crm_agent_id: agent_id,
        status: "active",
        updated_at: new Date(),
      },
      { where: { id: conversation_id } }
    );

    // زيادة عدد المحادثات للوكيل
    await OnlineAgents.update(
      { current_conversations: literal("current_conversations + 1") },
      { where: { agent_id } }
    );

    // حذف المحادثة من الطابور
    await ChatQueue.destroy({ where: { conversation_id } });

    // تحديث ترتيب الطابور
    const queues = await ChatQueue.findAll({
      order: [["position", "ASC"]],
    });
    for (let i = 0; i < queues.length; i++) {
      await ChatQueue.update(
        { position: i + 1 },
        { where: { id: queues[i].id } }
      );
      await ChatConversations.update(
        { queue_position: i + 1 },
        { where: { id: queues[i].conversation_id } }
      );
      global.io
        .to(`conversation_${queues[i].conversation_id}`)
        .emit("queue_update", { position: i + 1 });
    }

    // إرسال إشعار تعيين الوكيل
    global.io.to(`conversation_${conversation_id}`).emit("agent_assigned", {
      agent_id,
      agent_name: agent.agent_name,
    });

    res.status(200).json({
      ack: 1,
      msg: language[lang].chat.agent_assigned,
    });
  } catch (e) {
    console.error("Error in assignAgent:", e);
    res.status(400).json({
      ack: 0,
      error: e.message,
    });
  }
};

// إرسال رسالة من الوكيل
data.sendAgentMessage = async (req, res) => {
  try {
    const lang = req.headers.lang || "en";
    const { conversation_id, agent_id, message } = req.body;
    const file_url = req.file ? req.file.path : null;
    const message_type = req.file
      ? req.file.mimetype.startsWith("image/")
        ? "image"
        : "file"
      : "text";

    const conversation = await ChatConversations.findOne({
      where: {
        id: conversation_id,
        crm_agent_id: agent_id,
        status: "active",
      },
    });

    if (!conversation) {
      return res.status(404).json({
        ack: 0,
        msg: language[lang].chat.conversation_not_found,
      });
    }

    const newMessage = await ChatMessages.create({
      conversation_id,
      sender_type: "agent",
      sender_id: agent_id,
      message: message || "",
      message_type,
      file_url,
      created_at: new Date(),
    });

    global.io.to(`conversation_${conversation_id}`).emit("new_message", {
      message: newMessage,
      sender_type: "agent",
    });

    res.status(200).json({
      ack: 1,
      msg: language[lang].chat.message_sent,
      message: newMessage,
    });
  } catch (e) {
    console.error("Error in sendAgentMessage:", e);
    res.status(400).json({
      ack: 0,
      msg: language[lang].chat.error,
      error: e.message,
    });
  }
};

// الحصول على المحادثات المنتظرة
data.getWaitingConversations = async (req, res) => {
  try {
    const lang = req.headers.lang || "en";

    const conversations = await ChatConversations.findAll({
      where: { status: "waiting" },
      include: [
        {
          model: ChatQueue,
          as: "queue",
        },
      ],
      order: [["created_at", "ASC"]],
    });

    res.status(200).json({
      ack: 1,
      conversations,
    });
  } catch (e) {
    console.error("Error in getWaitingConversations:", e);
    res.status(400).json({
      ack: 0,
      msg: language[lang].chat.error,
      error: e.message,
    });
  }
};

// الحصول على محادثات الوكيل
data.getAgentConversations = async (req, res) => {
  try {
    const lang = req.headers.lang || "en";
    const agent_id = req.params.agentId;

    const conversations = await ChatConversations.findAll({
      where: { crm_agent_id: agent_id },
      include: [
        {
          model: ChatMessages,
          as: "messages",
          limit: 1,
          order: [["created_at", "DESC"]],
        },
      ],
      order: [["updated_at", "DESC"]],
    });

    res.status(200).json({
      ack: 1,
      conversations,
    });
  } catch (e) {
    console.error("Error in getAgentConversations:", e);
    res.status(400).json({
      ack: 0,
      msg: language[lang].chat.error,
      error: e.message,
    });
  }
};

// إغلاق المحادثة من قبل الوكيل
data.closeConversationByAgent = async (req, res) => {
  try {
    const lang = req.headers.lang || "en";
    const conversation_id = req.params.id;
    const { agent_id } = req.body;

    const conversation = await ChatConversations.findOne({
      where: {
        id: conversation_id,
        crm_agent_id: agent_id,
      },
    });

    if (!conversation) {
      return res.status(404).json({
        ack: 0,
        msg: language[lang].chat.conversation_not_found,
      });
    }

    await ChatConversations.update(
      { status: "closed", closed_at: new Date(), updated_at: new Date() },
      { where: { id: conversation_id } }
    );

    // await OnlineAgents.update(
    //   { current_conversations: literal("current_conversations - 1") },
    //   { where: { agent_id, current_conversations: { [Op.gt]: 0 } } }
    // );

    global.io
      .to(`conversation_${conversation_id}`)
      .emit("conversation_closed", {
        closed_by: "agent",
      });

    res.status(200).json({
      ack: 1,
      msg: language[lang].chat.conversation_closed,
    });
  } catch (e) {
    console.error("Error in closeConversationByAgent:", e);
    res.status(400).json({
      ack: 0,
      msg: language[lang].chat.error,
      error: e.message,
    });
  }
};

module.exports = data;
