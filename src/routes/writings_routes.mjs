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
  .route(baseRoute + "/store")
  .post(
    checkRequiredFieldsMiddleware([
      "upload_id",
    ]),
    checkTokenMiddleware,
    WritingsController.apiAddWritings
  );


  router
  .route(baseRoute + "/edit")
  .put(
    checkRequiredFieldsMiddleware([
    "_id",
  ]),checkTokenMiddleware, WritingsController.apiUpdateUploadID);
  
  
  router
  .route(baseRoute + "/get")
  .get(checkTokenMiddleware, WritingsController.apiGetAllWritings);

//   router
//   .route(baseRoute + "/get-by-hand")
//   .get(checkTokenMiddleware, PrintsController.apiGetPrintByHand);

export default router;
