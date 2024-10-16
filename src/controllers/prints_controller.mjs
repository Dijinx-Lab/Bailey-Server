import UserService from "../services/user_service.mjs";
import TokenUtil from "../utility/token_util.mjs";
import PrintService from "../services/print_service.mjs";
export default class PrintsController {
  static async apiAddFinger(req, res, next) {
    try {
      const { finger, hand, upload_id, session_id } = req.body;
      const token = TokenUtil.cleanToken(req.headers["authorization"]);
      const serviceResponse = await PrintService.addPrint(
        token,
        finger,
        hand,
        upload_id,
        session_id
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

  static async apiUpdatePrint(req, res, next) {
    try {
      const { id } = req.query;
      const { upload_id, session_id } = req.body;

      const serviceResponse = await PrintService.updatePrint(
        id,
        upload_id,
        session_id
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

  static async apiDeletePrint(req, res, next) {
    try {
      const { id } = req.query;
      const token = TokenUtil.cleanToken(req.headers["authorization"]);

      const serviceResponse = await PrintService.deletePrint(token, id);
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

  static async apiGetAllPrints(req, res, next) {
    try {
      const token = TokenUtil.cleanToken(req.headers["authorization"]);
      const { id } = req.query;
      const serviceResponse = await PrintService.getAllPrints(id);
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

  static async apiDeleteSessionPrints(req, res, next) {
    try {
      const token = TokenUtil.cleanToken(req.headers["authorization"]);
      const { id } = req.query;
      const serviceResponse = await PrintService.deleteAllSessionPrints(id);
      if (typeof serviceResponse === "string") {
        res
          .status(200)
          .json({ success: false, data: {}, message: serviceResponse });
      } else {
        res.status(200).json({
          success: true,
          data: serviceResponse,
          message: "Fingerprints deleted",
        });
      }
    } catch (e) {
      res.status(500).json({ success: false, data: {}, message: e.message });
    }
  }
}
