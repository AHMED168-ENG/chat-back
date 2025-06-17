module.exports= (socket, next) => {
    try {
        const sessionData = {
            session_id: socket.id,
            selectedOptions: [],
            lang: socket?.lang || "en"
        };
        socket.sessionData= sessionData;
        next();
    } catch (err) {
        next(err);
    }
}

