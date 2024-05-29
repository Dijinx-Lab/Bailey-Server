import multer from "multer";
import UtilService from "../services/util_service.mjs";

const upload = multer({
  limits: { fileSize: 15 * 1024 * 1024 },
});

export default class UtilController {
  static async apiUploadToS3(req, res, next) {
    try {
      upload.any()(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
          return res.status(400).send("Multer error occurred.");
        } else if (err) {
          return res.status(500).send("An unknown error occurred.");
        }

        const folder = req.body.folder;
        const file = req.files[0];

        if (!file) {
          return res.status(400).send("No file uploaded.");
        }

        const serviceResponse = await UtilService.uploadToS3(file, folder);
        if (typeof serviceResponse === "string") {
          res
            .status(200)
            .json({ success: false, data: {}, message: serviceResponse });
        } else {
          res.status(200).json({
            success: true,
            data: serviceResponse,
            message: "File uploaded to S3 successfully",
          });
        }
      });
    } catch (e) {
      res.status(500).json({ success: false, data: {}, message: e.message });
    }
  }
}
