const { date } = require('joi');
const workflownodes = require('../../../models/workflownodes.js');
const workflowsessionhistory = require('../../../models/workflowsessionhistory.js');
const {getRoots, parentOffSprings, getGreetingMessage,getOptionDetails,saveSessionHistory} = require('./socket.controller.js');
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
        const optionDetails=await getOptionDetails(option.id, lang);
        const sessionData=socket.sessionData || {};
        sessionData.selectedOptions.push({id:option.id,date: new Date()});
        // if (['ai', 'agent', 'answer'].includes(optionDetails.optionType)) {
        //     await saveSessionHistory(socket.id,sessionData.selectedOptions,lang);

        //     socket.disconnect(true);
        //     return;
        // }
        
        const nodes=await parentOffSprings(option.id, lang)||[];
        socket.emit('options', { nodes });
    });
    socket.on("disconnect", async () => {
        const sessionData=socket.sessionData || {};
        await saveSessionHistory(socket.id,sessionData.selectedOptions,lang);
        socket.disconnect(true);
        return;
    })
};
module.exports = {init};