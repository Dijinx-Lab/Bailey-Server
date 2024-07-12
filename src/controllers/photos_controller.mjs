import TokenUtil from "../utility/token_util.mjs";
import PhotoService from "../services/photo_service.mjs";

export default class PhotosController {
  static async apiAddPhoto(req, res, next) {
    try {
      const { upload_id } = req.body;
      const token = TokenUtil.cleanToken(req.headers["authorization"]);
      const serviceResponse = await PhotoService.addPhotoInDB(token, upload_id);
      if (typeof serviceResponse === "string") {
        res
          .status(200)
          .json({ success: false, data: {}, message: serviceResponse });
      } else {
        res.status(200).json({
          success: true,
          data: serviceResponse,
          message: "Photo has been uploaded successfully",
        });
      }
    } catch (e) {
      res.status(500).json({ success: false, data: {}, message: e.message });
    }
  }

  static async apiGetAllPhotos(req, res, next) {
    try {
      const token = TokenUtil.cleanToken(req.headers["authorization"]);
      const serviceResponse = await PhotoService.getAllPhotos(token);
      if (typeof serviceResponse === "string") {
        res
          .status(200)
          .json({ success: false, data: {}, message: serviceResponse });
      } else {
        res.status(200).json({
          success: true,
          data: serviceResponse,
          message: "",
        });
      }
    } catch (e) {
      res.status(500).json({ success: false, data: {}, message: e.message });
    }
  }

  static async apiDeletePhotos(req, res, next) {
    try {
      const token = TokenUtil.cleanToken(req.headers["authorization"]);
      const { id } = req.query;
      const serviceResponse = await PhotoService.deletePhoto(token, id);
      if (typeof serviceResponse === "string") {
        res
          .status(200)
          .json({ success: false, data: {}, message: serviceResponse });
      } else {
        res.status(200).json({
          success: true,
          data: serviceResponse,
          message: "Photo deleted",
        });
      }
    } catch (e) {
      res.status(500).json({ success: false, data: {}, message: e.message });
    }
  }
}
