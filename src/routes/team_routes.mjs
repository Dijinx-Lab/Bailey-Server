import express from "express";
import checkRequiredFieldsMiddleware from "../middleware/check_required_fields_middleware.mjs";
import checkTokenMiddleware from "../middleware/check_token_middleware.mjs";
import TeamController from "../controllers/team_controller.mjs";

const router = express.Router();

const teamRoutes = "/team";

//api routes

router
  .route(teamRoutes + "/create")
  .post(
    checkRequiredFieldsMiddleware([
      "score",
    ]),
    TeamController.apiCreateTeam
  );

router
  .route(teamRoutes + "/details")
  .get(TeamController.apiGetTeam);

  
router
.route(teamRoutes + "/details-by-code")
.get(TeamController.apiGetTeamByTeamCode);

export default router;
