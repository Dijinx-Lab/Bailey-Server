import multer from "multer";
import UploadService from "../services/upload_service.mjs";
import TokenUtil from "../utility/token_util.mjs";

const upload = multer({
  limits: { fileSize: 15 * 1024 * 1024 },
});

export default class UploadController {
  static async apiAddUpload(req, res, next) {
    try {
      const token = TokenUtil.cleanToken(req.headers["authorization"]);
      console.log(token);
      upload.any()(req, res, async function (err) {
        if (err) {
          const errorMessage =
            err.code === "LIMIT_FILE_SIZE"
              ? "File size exceeds the limit of 15MB"
              : err.message;
          console.log(err.code);
          console.log(err.message);
          return res.status(err.code === "LIMIT_FILE_SIZE" ? 413 : 500).json({
            success: false,
            data: {},
            message: errorMessage,
          });
        }

        console.log(req.files.length);

        if (!req.files || req.files.length === 0) {
          return res.status(400).json({
            success: false,
            data: {},
            message: "No file to upload",
          });
        }

        const folder = req.body.folder;
        const file = req.files[0];

        try {
          const serviceResponse = await UploadService.addUpload(
            file,
            folder,
            token
          );
          const success = typeof serviceResponse !== "string";
          return res.status(200).json({
            success,
            data: success ? serviceResponse : {},
            message: success
              ? "File uploaded to S3 successfully"
              : serviceResponse,
          });
        } catch (e) {
          console.log(e.message);
          return res
            .status(500)
            .json({ success: false, data: {}, message: e.message });
        }
      });
    } catch (e) {
      const errorMessage =
        e.code === "LIMIT_FILE_SIZE"
          ? "File size exceeds the limit of 15MB"
          : e.message;
      return res.status(e.code === "LIMIT_FILE_SIZE" ? 413 : 500).json({
        success: false,
        data: {},
        message: errorMessage,
      });
    }
  }
}
