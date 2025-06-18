module.exports= (socket, next) => {
    try {
        console.log("Language middleware triggered for socket connection");
        // Extract the 'lang' header from the socket handshake, defaulting to 'en' if not provided
        var lang = socket.handshake.headers.lang || "en";
        
        // Validate the language format (optional, based on your requirements)
        if (typeof lang !== 'string' || lang.length !== 2) {
            throw new Error("Invalid language format");
        }
        // Attach the language to the socket object for further use
        socket.lang = lang;
        console.log(`Language set to: ${socket.lang}`);
        // Proceed to the next middleware
        next();
    } catch (err) {
        // Pass the error to the next middleware with a default error message and status code
        next(err);
    }
}

