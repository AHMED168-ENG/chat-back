const fs = require('fs');
const path = require('path');
const multer = require('multer');
const AppError = require('../../utils/AppError');
const appRoot = path.resolve(__dirname, '../../../');
const uploadFilePath = path.join(appRoot, 'uploads/');

const fileUpload = (uploadPath = '',type) => {
  const fullPath = path.join('uploads', uploadPath);

  // ✅ Ensure the folder exists
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, fullPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  });

  const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith(type)) {
      cb(null, true);
    } else {
      cb(new AppError(`Only ${type} allowed`,405), false);
    }
  };

  return multer({ storage, fileFilter });
};


// For uploading a single file with a path
const uploadSingleFile = (fieldName, uploadPath, type="image") => {
  return fileUpload(uploadPath,type).single(fieldName);
};

// For uploading multiple files with a path
const uploadArrayOfFiles = (fieldName, uploadPath, type="image") => {
  return fileUpload(uploadPath, type).array(fieldName, 10);
};

// For uploading fields with multiple files, each field can have a different name
const uploadFields = (fields, uploadPath, type="image") => {
  return fileUpload(uploadPath, type).fields(fields);
};
module.exports = {
  uploadSingleFile,
  uploadArrayOfFiles,
  uploadFields
}