const {getRoots, parentOffSprings, getGreetingMessage} = require('./socket.controller.js');
const init = async(io,socket)=> {
    let lang = socket?.lang || "en";

    const greetingMessage = await getGreetingMessage(lang);
    // sending the initial options to the client 
    socket.emit('greeting',greetingMessage );
    
    socket.on('greeting',()=>{
        socket.emit('greeting',greetingMessage );
    });

    const nodes=await getRoots(lang)||[];
    socket.emit('options', {  nodes });
    socket.on('options',()=>{
        socket.emit('options', { nodes });
    });
    // sending offsprings of the selected option
    socket.on('optionSelected', async function(option) {
        const nodes=await parentOffSprings(option.id, lang)||[];
        socket.emit('options', { nodes });
    });
};
module.exports = {init};