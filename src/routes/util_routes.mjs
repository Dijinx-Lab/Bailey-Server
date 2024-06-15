import express from "express";
import checkRequiredFieldsMiddleware from "../middleware/check_required_fields_middleware.mjs";
import UtilController from "../controllers/util_controller.mjs";

const router = express.Router();

const utilRoute = "/utility";
//api routes
router.route(utilRoute + "/upload/s3").post(UtilController.apiUploadToS3);

router.get(utilRoute + "/privacy", (req, res) => {
  const filePath =
    "/home/ec2-user/Scavenger-Hunt-Server/res/privacy_policy.html";
  res.sendFile(filePath);
});

router.get(utilRoute + "/terms", (req, res) => {
  const filePath =
    "/home/ec2-user/Scavenger-Hunt-Server/res/terms_and_conditions.html";
  res.sendFile(filePath);
});

export default router;
