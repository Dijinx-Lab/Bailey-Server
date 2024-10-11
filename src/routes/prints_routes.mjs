import express from "express";
import UserController from "../controllers/user_controller.mjs";
import PhotosController from "../controllers/photos_controller.mjs";
import checkRequiredFieldsMiddleware from "../middleware/check_required_fields_middleware.mjs";
import checkTokenMiddleware from "../middleware/check_token_middleware.mjs";
import PrintsController from "../controllers/prints_controller.mjs";
// import { Omics } from "aws-sdk";

const router = express.Router();

const baseRoute = "/prints";

//api routes
router
  .route(baseRoute + "/add")
  .post(
    checkRequiredFieldsMiddleware([
      "finger",
      "hand",
      "upload_id",
      "session_id",
    ]),
    checkTokenMiddleware,
    PrintsController.apiAddFinger
  );

router
  .route(baseRoute + "/edit")
  .put(
    checkRequiredFieldsMiddleware(["id", "upload_id", "session_id"]),
    checkTokenMiddleware,
    PrintsController.apiUpdatePrint
  );

router
  .route(baseRoute + "/delete")
  .delete(
    checkRequiredFieldsMiddleware(["id"]),
    checkTokenMiddleware,
    PrintsController.apiDeletePrint
  );

router
  .route(baseRoute + "/list")
  .get(
    checkTokenMiddleware,
    checkRequiredFieldsMiddleware(["id"]),
    PrintsController.apiGetAllPrints
  );

router
  .route(baseRoute + "/session/delete")
  .delete(
    checkTokenMiddleware,
    checkRequiredFieldsMiddleware(["id"]),
    PrintsController.apiDeleteSessionPrints
  );

export default router;
