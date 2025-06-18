const express = require("express");
const router = express.Router();
const pendingQuestionsHandler = require("../controllers/pendingQuestions");
const {
  getPendingQuestionsSchema,
  answerPendingQuestionSchema,
  deletePendingQuestionSchema,
} = require("../validation/pendingQuestionsValidation");
const validateJoi = require("../middleware/validationJoi");

router.get(
  "/",
  validateJoi(getPendingQuestionsSchema),
  pendingQuestionsHandler.getAllPendingQuestions
);
router.get(
  "/:id",
  validateJoi(deletePendingQuestionSchema, "params"),
  pendingQuestionsHandler.getPendingQuestion
);
router.post(
  "/",
  validateJoi(answerPendingQuestionSchema),
  pendingQuestionsHandler.answerPendingQuestion
);
router.delete(
  "/:id",
  validateJoi(deletePendingQuestionSchema, "params"),
  pendingQuestionsHandler.deletePendingQuestion
);

module.exports = router;
