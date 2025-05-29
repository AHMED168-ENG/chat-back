const multer = require("multer");
const path = require("path");
const fs = require("fs");

const ensureDirectoryExists = (dir) => {
  const absolutePath = path.join(process.cwd(), dir);
  if (!fs.existsSync(absolutePath)) {
    fs.mkdirSync(absolutePath, { recursive: true });
  }
  return absolutePath;
};

const generateUniqueFileName = (file) => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `${timestamp}_${random}${path.extname(file.originalname)}`;
};

const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("الملف يجب أن يكون صورة"), false);
  }
};

// فلتر جديد لملفات Excel
const excelFilter = (req, file, cb) => {
  const allowedMimetypes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    "application/vnd.ms-excel", // .xls
    "text/csv", // .csv (اختياري)
  ];
  if (allowedMimetypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("الملف يجب أن يكون ملف Excel (.xlsx أو .xls)"), false);
  }
};

const defaultLimits = {
  fileSize: 5 * 1024 * 1024, // 5MB
};

const createStorage = (destinationPath) => {
  const absolutePath = ensureDirectoryExists(destinationPath);
  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, absolutePath);
    },
    filename: (req, file, cb) => {
      cb(null, generateUniqueFileName(file));
    },
  });
};

const uploadSingleImage = (
  fieldName,
  destinationPath = "uploads/default",
  limits = defaultLimits
) => {
  const storage = createStorage(destinationPath);
  return multer({
    storage,
    fileFilter: imageFilter,
    limits,
  }).single(fieldName);
};

// دالة جديدة لرفع ملف Excel واحد
const uploadSingleExcel = (
  fieldName,
  destinationPath = "uploads/excel",
  limits = defaultLimits
) => {
  const storage = createStorage(destinationPath);
  return multer({
    storage,
    fileFilter: excelFilter,
    limits,
  }).single(fieldName);
};

const uploadMultipleImages = (
  fieldName,
  maxCount = 10,
  destinationPath = "uploads/default",
  limits = defaultLimits
) => {
  const storage = createStorage(destinationPath);
  return multer({
    storage,
    fileFilter: imageFilter,
    limits,
  }).array(fieldName, maxCount);
};

const uploadFieldsImages = (
  fieldsConfig,
  destinationPath = "uploads/default",
  limits = defaultLimits
) => {
  const storage = createStorage(destinationPath);
  return multer({
    storage,
    fileFilter: imageFilter,
    limits,
  }).fields(fieldsConfig);
};

const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "حجم الملف كبير جدًا، الحد الأقصى 5 ميجا",
      });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        message: "عدد الملفات أكثر من المسموح",
      });
    }
    return res.status(400).json({
      message: "حصل خطأ أثناء رفع الملف",
      error: err.message,
    });
  } else if (err) {
    return res.status(400).json({
      message: err.message,
    });
  }
  next();
};

module.exports = {
  uploadSingleImage,
  uploadSingleExcel,
  uploadMultipleImages,
  uploadFieldsImages,
  handleMulterError,
};
