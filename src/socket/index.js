const   langSocket  = require('./middleware/lang.middleware.js');
const   sessionData  = require('./middleware/sessionData.middleware.js');

const {init} = require('./module/socket.route.js');
module.exports = function socketBootstrap(io) {
    io.use(langSocket); // Use langSocket as a global middleware
    io.use(sessionData); // Use langSocket as a global middleware
    io.on('connection',async  (socket) => {
        console.log(`Client connected: ${socket.id}`);
        // The middleware has already been applied globally, so just initialize routes
        await init(io, socket);
        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
    });
};
