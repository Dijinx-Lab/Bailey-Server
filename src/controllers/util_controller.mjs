import multer from "multer";
import UtilService from "../services/util_service.mjs";


// Multer configuration
const upload = multer();



export default class UtilController {
  static async apiUploadToS3(req, res, next) {
    try {
      // Multer middleware for form-data parsing
      upload.any()(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
          // A Multer error occurred when parsing form-data.
          return res.status(400).send("Multer error occurred.");
        } else if (err) {
          // An unknown error occurred when parsing form-data.
          return res.status(500).send("An unknown error occurred.");
        }

        const folder = req.body.folder; // Retrieve folder from form-data
        const file = req.files[0]; // Assuming the file field is the first field in the form-data

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
