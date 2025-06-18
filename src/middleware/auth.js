const jwt = require("jsonwebtoken");
const {users}= require("./../../models");
const  catchError  = require('./../../utils/catchError');
const AppError = require("./../../utils/AppError");
const Authenticate=catchError(async (req,res,next)=>{
    const authHeader = req.headers['authorization'];
    let token;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1]||req.headers?.token;
    }
    if (token && typeof token === "string" && token.trim() && token !== "null" && token !== "undefined") {
        const env_secret = process.env.CRM_JWT_SECRET;
        const secret = Buffer.from(env_secret, 'base64');
        try {
            const decode=jwt.verify(token, secret, { algorithms: ['HS512'] });
            // console.log(decode)
            return next();
        } catch (err) {
            return next(new AppError("Unauthorized", 401));
        }
    }
    return next(new AppError("Unauthorized", 401));
});
class Authorize {
    static allowedTo=(...roles)=>{
        return catchError(
            async (req,res,next)=>{
                let currentUserRole=req.user.role;
                if(!roles.includes(currentUserRole)){
                    return next(new AppError("You are not allowed to access this route",401));
                }
                next();
            }
        )
    }
}
module.exports={
    Authenticate,
    Authorize
}
