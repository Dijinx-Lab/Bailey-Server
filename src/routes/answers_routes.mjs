import express from "express";
import checkRequiredFieldsMiddleware from "../middleware/check_required_fields_middleware.mjs";
import checkTokenMiddleware from "../middleware/check_token_middleware.mjs";
import AnswerController from "../controllers/answers_controller.mjs";

const router = express.Router();

const answerRoute = "/answer";

//api routes

router
  .route(answerRoute + "/create")
  .post(
    checkRequiredFieldsMiddleware([
      "answer",
      "team_code",
      "question",
    ]),
    AnswerController.apiCreateAnswer
  );

router
  .route(answerRoute + "/details")
  .get(AnswerController.apiGetAnswer);

  router
  .route(answerRoute + "/details-by-team")
  .get(AnswerController.apiGetAnswerByTeam);

export default router;
