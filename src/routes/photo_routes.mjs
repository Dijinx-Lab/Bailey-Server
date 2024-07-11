import express from "express";
import UserController from "../controllers/user_controller.mjs";
import PhotosController from "../controllers/photos_controller.mjs";
import checkRequiredFieldsMiddleware from "../middleware/check_required_fields_middleware.mjs";
import checkTokenMiddleware from "../middleware/check_token_middleware.mjs";
// import { Omics } from "aws-sdk";

const router = express.Router();

const baseRoute = "/photos";

//api routes
router
  .route(baseRoute + "/store")
  .post(
    checkRequiredFieldsMiddleware([
      "upload_id",
    ]),
    checkTokenMiddleware,
    PhotosController.apiAddPhoto
  );

  router
  .route(baseRoute + "/edit")
  .put(
    checkRequiredFieldsMiddleware([
    "_id",
  ]),checkTokenMiddleware, PhotosController.apiUpdateUploadID);
  
  
  router
  .route(baseRoute + "/get")
  .get(checkTokenMiddleware, PhotosController.apiGetAllUploadID);

export default router;
