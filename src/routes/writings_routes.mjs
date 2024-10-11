import express from "express";
import WritingsController from "../controllers/writings_controller.mjs";
import checkRequiredFieldsMiddleware from "../middleware/check_required_fields_middleware.mjs";
import checkTokenMiddleware from "../middleware/check_token_middleware.mjs";
import PrintsController from "../controllers/prints_controller.mjs";
// import { Omics } from "aws-sdk";

const router = express.Router();

const baseRoute = "/writings";

//api routes
router
  .route(baseRoute + "/add")
  .post(
    checkRequiredFieldsMiddleware(["upload_id", "session_id"]),
    checkTokenMiddleware,
    WritingsController.apiAddWritings
  );

router
  .route(baseRoute + "/delete")
  .delete(
    checkRequiredFieldsMiddleware(["id"]),
    checkTokenMiddleware,
    WritingsController.apiDeleteWriting
  );

router
  .route(baseRoute + "/list")
  .get(
    checkTokenMiddleware,
    checkRequiredFieldsMiddleware(["id"]),
    WritingsController.apiGetAllWritings
  );

router
  .route(baseRoute + "/session/delete")
  .delete(
    checkTokenMiddleware,
    checkRequiredFieldsMiddleware(["id"]),
    WritingsController.apiDeleteSessionWritings
  );

export default router;
