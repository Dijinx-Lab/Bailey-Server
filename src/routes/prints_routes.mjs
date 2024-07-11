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
  .route(baseRoute + "/store")
  .post(
    checkRequiredFieldsMiddleware([
      "finger",
      "hand",
      "upload_id"
    ]),
    checkTokenMiddleware,
    PrintsController.apiAddFinger
  );

  router
  .route(baseRoute + "/edit")
  .put(
    checkRequiredFieldsMiddleware([
    "_id",
  ]),checkTokenMiddleware, PrintsController.apiUpdatePrint);
  
  
  router
  .route(baseRoute + "/get")
  .get(checkTokenMiddleware, PrintsController.apiGetAllPrints);

  router
  .route(baseRoute + "/get-by-hand")
  .get(checkTokenMiddleware, PrintsController.apiGetPrintByHand);

export default router;
