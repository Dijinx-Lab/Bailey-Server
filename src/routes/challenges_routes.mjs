import express from "express";
import checkRequiredFieldsMiddleware from "../middleware/check_required_fields_middleware.mjs";
import checkTokenMiddleware from "../middleware/check_token_middleware.mjs";
import ChallengeController from "../controllers/challenges_controller.mjs";

const router = express.Router();

const chalRoute = "/challenge";
const chalAdminRoute = "/admin/challenge";

//api routes

router
  .route(chalAdminRoute + "/create")
  .post(
    checkRequiredFieldsMiddleware([
      "name",
      "difficulty",
      "longitude",
      "latitude",
      "route",
    ]),
    ChallengeController.apiCreateChallenge
  );

router
  .route(chalAdminRoute + "/details")
  .get(ChallengeController.apiGetChallengeForAdmin);


router
  .route(chalAdminRoute + "/delete")
  .delete(ChallengeController.apiDeleteChallenge);

router
  .route(chalRoute + "/details-by-route")
  .get(ChallengeController.apiGetChallengesByRoute);

router
  .route(chalRoute + "/summary")
  .get(ChallengeController.apiGetChallengeSummary);

router
  .route(chalAdminRoute + "/all-details")
  .get(ChallengeController.apiGetAllChallengeDetails);

router
  .route(chalAdminRoute + "/update")
  .put(
    checkRequiredFieldsMiddleware(["id"]),
    ChallengeController.apiUpdateChallenge
  );

export default router;
