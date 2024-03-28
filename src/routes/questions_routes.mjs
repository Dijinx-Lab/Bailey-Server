import express from "express";
import checkRequiredFieldsMiddleware from "../middleware/check_required_fields_middleware.mjs";
import checkTokenMiddleware from "../middleware/check_token_middleware.mjs";
import QuestionController from "../controllers/questions_controller.mjs";

const router = express.Router();

const quesRoute = "/question";

//api routes

router
  .route(quesRoute + "/create")
  .post(
    checkRequiredFieldsMiddleware([
      "score",
      "type",
      "question",
    ]),
    QuestionController.apiCreateQuestion
  );

export default router;
