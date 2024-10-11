import express from "express";

import checkRequiredFieldsMiddleware from "../middleware/check_required_fields_middleware.mjs";
import checkTokenMiddleware from "../middleware/check_token_middleware.mjs";
import SessionController from "../controllers/session_controller.mjs";
// import { Omics } from "aws-sdk";

const router = express.Router();

const baseRoute = "/sessions";

//api routes
router
  .route(baseRoute + "/add")
  .post(
    checkRequiredFieldsMiddleware(["first_name", "last_name", "date_of_birth"]),
    checkTokenMiddleware,
    SessionController.apiAddSession
  );

router
  .route(baseRoute + "/list")
  .get(checkTokenMiddleware, SessionController.apiGetAllSessions);

router
  .route(baseRoute + "/delete")
  .delete(
    checkTokenMiddleware,
    checkRequiredFieldsMiddleware(["id"]),
    SessionController.apiDeleteSession
  );

export default router;
