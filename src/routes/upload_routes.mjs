import express from "express";
import UploadController from "../controllers/upload_controller.mjs";
import checkTokenMiddleware from "../middleware/check_token_middleware.mjs";

const router = express.Router();

const baseRoute = "/uploads";

//api routes
router
  .route(baseRoute + "/add")
  .post(checkTokenMiddleware, UploadController.apiAddUpload);

export default router;
