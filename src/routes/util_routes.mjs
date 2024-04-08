import express from "express";
import checkRequiredFieldsMiddleware from "../middleware/check_required_fields_middleware.mjs";
import UtilController from "../controllers/util_controller.mjs";

const router = express.Router();

const utilRoute = "/utility";
//api routes
router.route(utilRoute + "/upload/s3").post(UtilController.apiUploadToS3);

export default router;
