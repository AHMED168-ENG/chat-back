const express = require("express");
const router = express.Router();
const pendingQuestionsHandler = require("../controllers/pendingQuestions");
const validate = require("../middleware/validate");
const {
  getPendingQuestionsSchema,
  answerPendingQuestionSchema,
  deletePendingQuestionSchema,
} = require("../validation/pendingQuestionsValidation");

router.get(
  "/",
  validate(getPendingQuestionsSchema),
  pendingQuestionsHandler.getAllPendingQuestions
);
router.get(
  "/:id",
  validate(deletePendingQuestionSchema),
  pendingQuestionsHandler.getPendingQuestion
);
router.post(
  "/",
  validate(answerPendingQuestionSchema),
  pendingQuestionsHandler.answerPendingQuestion
);
router.delete(
  "/:id",
  validate(deletePendingQuestionSchema),
  pendingQuestionsHandler.deletePendingQuestion
);

module.exports = router;
