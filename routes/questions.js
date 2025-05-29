const express = require("express");
const router = express.Router();
const Questions = require("../controllers/questions");
const {
  getQuestionsSchema,
  addQuestionSchema,
  editQuestionSchema,
  deleteQuestionSchema,
  uploadFAQsSchema,
} = require("../validation/questions");
const authenticateUser = require("../middleware/authenticateUser");
const validateJoi = require("../middleware/validationJoi");

const { uploadSingleExcel, handleMulterError } = require("../config/multer");

router.get(
  "/get-all",
  // authenticateUser,
  // authenticateAdmin,
  validateJoi(getQuestionsSchema, "query"),
  Questions.getAllQuestions
);
router.get("/specific/:id", authenticateUser, Questions.getSpecificQuestion);
router.post(
  "/add",
  // authenticateUser,
  validateJoi(addQuestionSchema, "body"),
  Questions.addQuestion
);
router.put(
  "/edit/:id",
  // authenticateUser,
  validateJoi(editQuestionSchema, "body"),
  Questions.editQuestion
);
router.delete(
  "/delete/:id",
  // authenticateUser,
  validateJoi(deleteQuestionSchema, "params"),
  Questions.deleteQuestion
);
router.post(
  "/upload-faqs",
  // authenticateUser,
  uploadSingleExcel("file", "uploads/excel"),
  handleMulterError,
  // validateJoi(uploadFAQsSchema, "file"),
  Questions.uploadFAQs
);

module.exports = router;
