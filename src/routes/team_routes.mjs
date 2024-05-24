import express from "express";
import checkRequiredFieldsMiddleware from "../middleware/check_required_fields_middleware.mjs";
import checkTokenMiddleware from "../middleware/check_token_middleware.mjs";
import TeamController from "../controllers/team_controller.mjs";

const router = express.Router();

const teamRoutes = "/team";
const teamAdminRoutes = "/admin/team";

//api routes

router
  .route(teamAdminRoutes + "/create")
  .post(checkRequiredFieldsMiddleware(["name"]), TeamController.apiCreateTeam);

router.route(teamAdminRoutes + "/details").get(TeamController.apiGetTeam);

router
  .route(teamRoutes + "/details-by-code")
  .get(TeamController.apiGetTeamByTeamCode);

router.route(teamRoutes + "/update").post(TeamController.apiUpdateTeam);

router.route(teamRoutes + "/leaderboard").get(TeamController.apiGetAllTeams);

router
  .route(teamRoutes + "/toggle")
  .post(TeamController.apiToggleActiveChallenge);

router
  .route(teamRoutes + "/mark-complete")
  .post(TeamController.apiUpdateCompletedChallenges);

router
  .route(teamAdminRoutes + "/all-details")
  .get(checkTokenMiddleware, TeamController.apiGetAllTeamsForAdmin);

router
  .route(teamAdminRoutes + "/dashboard-summary")
  .get(checkTokenMiddleware, TeamController.apiGetAllTeamsForAdminDashboard);

export default router;
