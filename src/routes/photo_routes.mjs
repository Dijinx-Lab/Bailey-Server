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
  .route(baseRoute + "/add")
  .post(
    checkRequiredFieldsMiddleware(["upload_id", "session_id"]),
    checkTokenMiddleware,
    PhotosController.apiAddPhoto
  );

router
  .route(baseRoute + "/list")
  .get(
    checkTokenMiddleware,
    checkRequiredFieldsMiddleware(["id"]),
    PhotosController.apiGetAllPhotos
  );

router
  .route(baseRoute + "/delete")
  .delete(checkTokenMiddleware, PhotosController.apiDeletePhotos);

router
  .route(baseRoute + "/session/delete")
  .delete(
    checkTokenMiddleware,
    checkRequiredFieldsMiddleware(["id"]),
    PhotosController.apiDeleteSessionPhotos
  );

export default router;
