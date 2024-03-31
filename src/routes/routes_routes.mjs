import express from "express";
import checkRequiredFieldsMiddleware from "../middleware/check_required_fields_middleware.mjs";
import checkTokenMiddleware from "../middleware/check_token_middleware.mjs";
import RouteController from "../controllers/routes_controller.mjs";

const router = express.Router();

const routes = "/route";

//api routes

router
  .route(routes + "/create")
  .post(
    checkRequiredFieldsMiddleware(["intro_video", "total_time"]),
    RouteController.apiCreateRoute
  );

router.route(routes + "/details").get(RouteController.apiGetRoute);

router.route(routes + "/all-details").get(RouteController.apiGetAllRoutes);

router.route(routes + "/set-start-time").post(RouteController.apiSetStartTime);

export default router;
