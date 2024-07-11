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

  static async apiSignInUser(req, res, next) {
    try {
      const { email, password, fcm_token } = req.body;

      const serviceResponse = await UserService.signInUser(
        email,
        password,
        fcm_token
      );

      if (typeof serviceResponse === "string") {
        res
          .status(200)
          .json({ success: false, data: {}, message: serviceResponse });
      } else if (typeof serviceResponse === "number") {
        res.status(serviceResponse).json({
          success: false,
          data: {},
          message:
            "You'll need to verify your email to proceed, code is sent to your email",
        });
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



  static async apiGetUserDetail(req, res, next) {
    try {
      const token = TokenUtil.cleanToken(req.headers["authorization"]);
      const serviceResponse = await UserService.getUserDetails(token);
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

  

  static async apiDeleteUser(req, res, next) {
    try {
      const token = TokenUtil.cleanToken(req.headers["authorization"]);
      const serviceResponse = await UserService.deleteUser(token);
      if (typeof serviceResponse === "string") {
        res
          .status(200)
          .json({ success: false, data: {}, message: serviceResponse });
      } else {
        res.status(200).json({
          success: true,
          data: serviceResponse,
          message: "User Deleted successfully",
        });
      }
    } catch (e) {
      res.status(500).json({ success: false, data: {}, message: e.message });
    }
  }



  static async apiUpdateUserProfile(req, res, next) {
    try {
      const { name, email, fcm_token } = req.body;
      const updateFields = Object.fromEntries(
        Object.entries({
          name,
          email,
          fcm_token,
        }).filter(([_, value]) => value !== undefined && value !== null)
      );
      const token = TokenUtil.cleanToken(req.headers["authorization"]);
      const serviceResponse = await UserService.updateProfile(
        token,
        updateFields
      );
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

  static async apiUpdateUserPassword(req, res, next) {
    try {
      const { old_password, password, confirm_password } = req.body;
      const token = TokenUtil.cleanToken(req.headers["authorization"]);
      const serviceResponse = await UserService.updatePassword(
        token,
        old_password,
        password,
        confirm_password
      );
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

}
