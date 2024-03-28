import express from "express";
import checkRequiredFieldsMiddleware from "../middleware/check_required_fields_middleware.mjs";
import checkTokenMiddleware from "../middleware/check_token_middleware.mjs";
import ChallengeController from "../controllers/challenges_controller.mjs";

const router = express.Router();

const chalRoute = "/challenge";

//api routes

router
  .route(chalRoute + "/create")
  .post(
    checkRequiredFieldsMiddleware([
      "longitude",
      "latitude",
      "questions",
    ]),
    ChallengeController.apiCreateChallenge
  );

router
  .route(chalRoute + "/details")
  .get(ChallengeController.apiGetChallenge);

export default router;
