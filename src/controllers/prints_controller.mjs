import UserService from "../services/user_service.mjs";
import TokenUtil from "../utility/token_util.mjs";
import PrintService from "../services/print_service.mjs";
export default class PrintsController {
  static async apiAddFinger(req, res, next) {
    try {
      const { finger,hand,upload_id } = req.body;
      const token = TokenUtil.cleanToken(req.headers["authorization"]);
      const serviceResponse = await PrintService.addPrintInDB(
        token,
        finger,
        hand,
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
          message: "Fingerprints has been uploaded successfully",
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

  static async apiUpdatePrint(req, res, next) {
    try {
      const _id = req.query._id;
      const { old_upload_id,upload_id } = req.body;
      const token = TokenUtil.cleanToken(req.headers["authorization"]);
      const serviceResponse = await PrintService.updatePrint(
        token,
        _id,
        // hand,
        // finger,
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
          message: "Fingerprint Updated Successfully",
        });
      }
    } catch (e) {
      res.status(500).json({ success: false, data: {}, message: e.message });
    }
  }

  // static async apiGetPrintByID(req, res, next) {
  //   try {
  //     const _id = req.query._id;
  //     // const { upload_id } = req.body;
  //     const token = TokenUtil.cleanToken(req.headers["authorization"]);
  //     const serviceResponse = await PrintService.getPrintById(
  //       token,
  //       _id,
  //       // upload_id
  //     );
  //     if (typeof serviceResponse === "string") {
  //       res
  //         .status(200)
  //         .json({ success: false, data: {}, message: serviceResponse });
  //     } else {
  //       res.status(200).json({
  //         success: true,
  //         data: serviceResponse,
  //         message: "Fingerprint Retrieved Successfully",
  //       });
  //     }
  //   } catch (e) {
  //     res.status(500).json({ success: false, data: {}, message: e.message });
  //   }
  // }
  static async apiGetAllPrints(req, res, next) {
    try {
      // const _id = req.query._id;
      // const { upload_id } = req.body;
      const token = TokenUtil.cleanToken(req.headers["authorization"]);
      const serviceResponse = await PrintService.getAllPrints(
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
          message: "Fingerprint Retrieved Successfully",
        });
      }
    } catch (e) {
      res.status(500).json({ success: false, data: {}, message: e.message });
    }
  }
  static async apiGetPrintByHand(req, res, next) {
    try {
      const hand = req.query.hand;
      // const { upload_id } = req.body;
      const token = TokenUtil.cleanToken(req.headers["authorization"]);
      const serviceResponse = await PrintService.getPrintByHand(
        token,
        hand,
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
          message: "Fingerprint Retrieved Successfully",
        });
      }
    } catch (e) {
      res.status(500).json({ success: false, data: {}, message: e.message });
    }
  }


}
