const {User}= require("./../../DB/models");
const  AppError = require("../../utils/AppError")
module.exports = async (req, res, next) => {
    console.log(req.body.email)
    let user = await User.findOne({ where:{email: req.body.email }})
    return user?next(new AppError("Email already exists",409)):next()
}