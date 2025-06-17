const Joi = require("joi");
const img=Joi.object({
        fieldname: Joi.string().required(),
        originalname: Joi.string().required(),
        encoding: Joi.string().required(),
        mimetype: Joi.string().valid('image/jpeg', 'image/png','image/jpg'),
        size: Joi.number().max(10485760),
        destination: Joi.string().required(),
        filename: Joi.string().required(),
        path: Joi.string()
    })
const createNodeVal = Joi.object({
    name: Joi.string().required(),
    nameAr: Joi.string().required(),
    parentId: Joi.string().uuid().optional(),
    icon:Joi.array().items(img).optional().max(1),

    guidingText: Joi.string().optional(),
    guidingTextAr: Joi.string().optional(),
    textType: Joi.string().valid("text","html").required(),
    optionType: Joi.string().valid("ai","agent","answer").optional(),

    guidingImages: Joi.array().items(img).optional().max(10),
    guidingImagesAr: Joi.array().items(img).optional(),
    notes: Joi.string().optional(),
});
const updateNodeVal=Joi.object({
    nodeId: Joi.string().uuid().required(),
    name: Joi.string().optional(),
    nameAr: Joi.string().optional(),
    parentId: Joi.string().uuid().optional(),
    icon:Joi.array().items(img).optional().max(1),

    guidingText: Joi.string().optional(),
    guidingTextAr: Joi.string().optional(),
    textType: Joi.string().valid("text","html").optional(),
    optionType: Joi.string().valid("ai","agent","answer").optional(),
   
    guidingImages: Joi.array().items(img).optional(),
    guidingImagesAr: Joi.array().items(img).optional(),
    notes: Joi.string().optional()
})
const paramId = Joi.object({
    nodeId: Joi.string().uuid({ version: 'uuidv4' }).required()
})
const greetingVal = Joi.object({
    greeting: Joi.string().required(),
    greetingAr: Joi.string().optional()
})
module.exports={
    createNodeVal,
    updateNodeVal,
    paramId,
    greetingVal
}