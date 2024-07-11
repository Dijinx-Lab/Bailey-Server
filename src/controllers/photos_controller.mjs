import UserService from "../services/user_service.mjs";
import TokenUtil from "../utility/token_util.mjs";
import PhotoService from "../services/photo_service.mjs";
export default class PhotosController {
  static async apiAddPhoto(req, res, next) {
    try {
      const { upload_id } = req.body;
      const token = TokenUtil.cleanToken(req.headers["authorization"]);
      const serviceResponse = await PhotoService.addPhotoInDB(
        token,
        upload_id,
      );
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



  static async apiUpdateUploadID(req, res, next) {
    try {
      const _id = req.query._id;
      const { old_upload_id,upload_id } = req.body;
      const token = TokenUtil.cleanToken(req.headers["authorization"]);
      const serviceResponse = await PhotoService.updateUploadId(
        token,
        _id,
        old_upload_id,
        upload_id
      );
      if (typeof serviceResponse === "string") {
        res
          .status(200)
          .json({ success: false, data: {}, message: serviceResponse });
      } else {
        res.status(200).json({
          success: true,
          data: serviceResponse,
          message: "Photo Updated Successfully",
        });
      }
    } catch (e) {
      res.status(500).json({ success: false, data: {}, message: e.message });
    }
  }

  static async apiGetUploadID(req, res, next) {
    try {
      const _id = req.query._id;
      // const { upload_id } = req.body;
      const token = TokenUtil.cleanToken(req.headers["authorization"]);
      const serviceResponse = await PhotoService.getUploadId(
        token,
        _id,
        // upload_id
      );
      if (typeof serviceResponse === "string") {
        res
          .status(200)
          .json({ success: false, data: {}, message: serviceResponse });
      } else {
        res.status(200).json({
          success: true,
          data: serviceResponse,
          message: "Photo Retrieved Successfully",
        });
      }
    } catch (e) {
      res.status(500).json({ success: false, data: {}, message: e.message });
    }
  }
  static async apiGetAllUploadID(req, res, next) {
    try {
      // const _id = req.query._id;
      // const { upload_id } = req.body;
      const token = TokenUtil.cleanToken(req.headers["authorization"]);
      const serviceResponse = await PhotoService.getAllUploadId(
        token,
        // _id,
        // upload_id
      );
      if (typeof serviceResponse === "string") {
        res
          .status(200)
          .json({ success: false, data: {}, message: serviceResponse });
      } else {
        res.status(200).json({
          success: true,
          data: serviceResponse,
          message: "Photos Retrieved Successfully",
        });
      }
    } catch (e) {
      res.status(500).json({ success: false, data: {}, message: e.message });
    }
  }


}
