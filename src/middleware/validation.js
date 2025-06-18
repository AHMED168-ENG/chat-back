const AppError= require('../../utils/AppError');
// Signup validation function
const validation=(schema,fields=null)=>{
    return async (req, res, next)=>{
    //generalize the input of the validation function to be the request body or the request params.
    let filter={};
    
    if(req.file){
        filter={...req.file,...req.body,...req.params,...req.query};
        //console.log({file:true,fields:filter})
    }
    else if(req.files){
        filter={...req.files,...req.body,...req.params,...req.query};
    }
    else{
        filter={...req.body,...req.params,...req.query};
        //console.log({file:true,fields:filter})
    }
    
    const {error} = await schema.validate(filter, { abortEarly: false });

    if (error) {
        console.log(error.details);
        console.log(filter);
        let errMsg=[];
        error.details.forEach(element => {
            errMsg.push(element.message);
        });
        // console.log(errMsg.length)
        next(new AppError(errMsg, 400));
    } else {
        next();
    }
}  
};

module.exports= validation; 