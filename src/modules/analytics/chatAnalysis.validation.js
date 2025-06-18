const Joi=require('joi');
const chatAnalysisSchema = Joi.object({
  from: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/) //yyyy-mm-dd format
    .required()
    .label('from')
    .messages({
      'string.pattern.base': '"from" must be in yyyy-mm-dd format',
      'any.required': '"from" is required'
    }),
  to: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .label('to')
    .messages({
      'string.pattern.base': '"to" must be in yyyy-mm-dd format',
      'any.required': '"to" is required'
    })
}).custom((value, helpers) => {
  const fromDate = new Date(value.from);
  const toDate = new Date(value.to);

  if (isNaN(fromDate) || isNaN(toDate)) {
    return helpers.message('Invalid date format');
  }

  if (fromDate > toDate) {
    // console.log(fromDate, toDate)
    return helpers.message('"from" date must be less than or equal to "to" date');
  }

  return value;
});
module.exports={
    chatAnalysisSchema
}