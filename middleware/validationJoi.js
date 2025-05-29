// const language = require("../language/index");

// const validateJoi =
//   (schemaFn, source = "params") =>
//   (req, res, next) => {
//     const lang = req.headers.lang || "en";
//     const schema = schemaFn(lang);
//     const data = source === "params" ? req.params : req.query;
//     const { error } = schema.validate(data);

//     if (error) {
//       const errorMessage = error.details[0].message;
//       return res.status(400).json({
//         ack: 0,
//         msg: errorMessage,
//       });
//     }
//     next();
//   };

// module.exports = validateJoi;


const validateJoi = (schemaFn, source = 'body') => {
  return (req, res, next) => {
    const lang = ['en', 'ar'].includes(req.headers.lang) ? req.headers.lang : 'en';
    
    const schema = schemaFn(lang);
        const data = source === 'body' ? req.body : source === 'query' ? req.query : req.params;
    
    const { error } = schema.validate(data, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        [detail.path[0]]: detail.message
      }));
      
      return res.status(201).json({
        ack: 0,
        msg: errors[0][Object.keys(errors[0])[0]],
        errMsg: errors
      });
    }
    
    next();
  };
};

module.exports = validateJoi;