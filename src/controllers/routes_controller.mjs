import ChallengeService from "../services/challenges_service.mjs";
import QuestionService from "../services/questions_service.mjs";
import RouteService from "../services/routes_service.mjs";
import TokenUtil from "../utility/token_util.mjs";

export default class RouteController {
  static async apiCreateRoute(req, res, next) {
    try {
      const { intro_video, total_time, finish_line_lat, finish_line_long } =
        req.body;

      const serviceResponse = await RouteService.addRoute(
        intro_video,
        total_time,
        finish_line_lat,
        finish_line_long
      );
      if (typeof serviceResponse === "string") {
        res
          .status(200)
          .json({ success: false, data: {}, message: serviceResponse });
      } else {
        res.status(200).json({
          success: true,
          data: serviceResponse,
          message: "Route created successfully",
        });
      }
    } catch (e) {
      res.status(500).json({ success: false, data: {}, message: e.message });
    }
  }

  static async apiGetRoute(req, res, next) {
    try {
      const _id = req.query.id;
      const serviceResponse = await RouteService.getRouteByID(_id);
      if (typeof serviceResponse === "string") {
        res
          .status(200)
          .json({ success: false, data: {}, message: serviceResponse });
      } else {
        res.status(200).json({
          success: true,
          data: serviceResponse,
          message: "Route details fetched successfully",
        });
      }
    } catch (e) {
      res.status(500).json({ success: false, data: {}, message: e.message });
    }
  }

  static async apiGetAllRoutes(req, res, next) {
    try {
      const code = req.query.code;

      const serviceResponse = await RouteService.getAllChallengesAndRoute(code);
      if (typeof serviceResponse === "string") {
        res
          .status(200)
          .json({ success: false, data: {}, message: serviceResponse });
      } else {
        res.status(200).json({
          success: true,
          data: serviceResponse,
          message: "Challenge and Route details fetched successfully",
        });
      }
    } catch (e) {
      res.status(500).json({ success: false, data: {}, message: e.message });
    }
  }

  static async apiSetStartTime(req, res, next) {
    try {
      const id = req.query.id;
      const serviceResponse = await RouteService.setStartTime(id);
      if (typeof serviceResponse === "string") {
        res
          .status(200)
          .json({ success: false, data: {}, message: serviceResponse });
      } else {
        res.status(200).json({
          success: true,
          data: serviceResponse,
          message: "Route details updated successfully",
        });
      }
    } catch (e) {
      res.status(500).json({ success: false, data: {}, message: e.message });
    }
  }
}
