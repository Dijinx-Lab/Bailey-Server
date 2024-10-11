import UserService from "../services/user_service.mjs";
import TokenUtil from "../utility/token_util.mjs";
import PrintService from "../services/print_service.mjs";
import WritingService from "../services/writing_service.mjs";

export default class WritingsController {
  static async apiAddWritings(req, res, next) {
    try {
      const { upload_id, session_id } = req.body;
      const token = TokenUtil.cleanToken(req.headers["authorization"]);
      const serviceResponse = await WritingService.addWritingInDB(
        token,
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
          message: "",
        });
      }
    } catch (e) {
      res.status(500).json({ success: false, data: {}, message: e.message });
    }
  }

  static async apiGetAllWritings(req, res, next) {
    try {
      const token = TokenUtil.cleanToken(req.headers["authorization"]);
      const { id } = req.query;
      const serviceResponse = await WritingService.getAllHandwritings(id);
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

  static async apiDeleteWriting(req, res, next) {
    try {
      const { id } = req.query;
      const token = TokenUtil.cleanToken(req.headers["authorization"]);
      const serviceResponse = await WritingService.deleteWriting(token, id);
      if (typeof serviceResponse === "string") {
        res
          .status(200)
          .json({ success: false, data: {}, message: serviceResponse });
      } else {
        res.status(200).json({
          success: true,
          data: serviceResponse,
          message: "HandWriting deleted",
        });
      }
    } catch (e) {
      res.status(500).json({ success: false, data: {}, message: e.message });
    }
  }

  static async apiDeleteSessionWritings(req, res, next) {
    try {
      const token = TokenUtil.cleanToken(req.headers["authorization"]);
      const { id } = req.query;
      const serviceResponse = await WritingService.deleteAllSessionWritings(id);
      if (typeof serviceResponse === "string") {
        res
          .status(200)
          .json({ success: false, data: {}, message: serviceResponse });
      } else {
        res.status(200).json({
          success: true,
          data: serviceResponse,
          message: "Handwritings deleted",
        });
      }
    } catch (e) {
      res.status(500).json({ success: false, data: {}, message: e.message });
    }
  }
}
