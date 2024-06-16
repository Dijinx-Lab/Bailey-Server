import ChallengeService from "../services/challenges_service.mjs";

export default class ChallengeController {
  static async apiCreateChallenge(req, res, next) {
    try {
      const {
        name,
        difficulty,
        longitude,
        latitude,
        route,
        description,
        intro_url,
      } = req.body;

      const serviceResponse = await ChallengeService.addChallenge(
        name,
        difficulty,
        longitude,
        latitude,
        route,
        description,
        intro_url
      );
      if (typeof serviceResponse === "string") {
        res
          .status(200)
          .json({ success: false, data: {}, message: serviceResponse });
      } else {
        res.status(200).json({
          success: true,
          data: serviceResponse,
          message: "Challenge created successfully",
        });
      }
    } catch (e) {
      res.status(500).json({ success: false, data: {}, message: e.message });
    }
  }

  static async apiGetChallenge(req, res, next) {
    try {
      const _id = req.query.id;
      const serviceResponse = await ChallengeService.getChallengeByID(_id);
      if (typeof serviceResponse === "string") {
        res
          .status(200)
          .json({ success: false, data: {}, message: serviceResponse });
      } else {
        res.status(200).json({
          success: true,
          data: serviceResponse,
          message: "Challenge details fetched successfully",
        });
      }
    } catch (e) {
      res.status(500).json({ success: false, data: {}, message: e.message });
    }
  }

  static async apiGetChallengeForAdmin(req, res, next) {
    try {
      const _id = req.query.id;
      const serviceResponse = await ChallengeService.getChallengeByIDForAdmin(
        _id
      );
      if (typeof serviceResponse === "string") {
        res
          .status(200)
          .json({ success: false, data: {}, message: serviceResponse });
      } else {
        res.status(200).json({
          success: true,
          data: serviceResponse,
          message: "Challenge details fetched successfully",
        });
      }
    } catch (e) {
      res.status(500).json({ success: false, data: {}, message: e.message });
    }
  }

  static async apiDeleteChallenge(req, res, next) {
    try {
      const _id = req.query.id;
      const serviceResponse = await ChallengeService.deleteChallenge(_id);
      if (typeof serviceResponse === "string") {
        res
          .status(200)
          .json({ success: false, data: {}, message: serviceResponse });
      } else {
        res.status(200).json({
          success: true,
          data: serviceResponse,
          message: "Challenge and its questions deleted successfully",
        });
      }
    } catch (e) {
      res.status(500).json({ success: false, data: {}, message: e.message });
    }
  }

  static async apiGetChallengesByRoute(req, res, next) {
    try {
      const route_id = req.query.route_id;
      const serviceResponse = await ChallengeService.getChallengesByRoute(
        route_id
      );
      if (typeof serviceResponse === "string") {
        res
          .status(200)
          .json({ success: false, data: {}, message: serviceResponse });
      } else {
        res.status(200).json({
          success: true,
          data: serviceResponse,
          message: "Challenge details fetched successfully",
        });
      }
    } catch (e) {
      res.status(500).json({ success: false, data: {}, message: e.message });
    }
  }

  static async apiGetChallengeSummary(req, res, next) {
    try {
      const _id = req.query.id;
      const team_code = req.query.code;
      const serviceResponse = await ChallengeService.getChallengeSummary(
        _id,
        team_code
      );
      if (typeof serviceResponse === "string") {
        res
          .status(200)
          .json({ success: false, data: {}, message: serviceResponse });
      } else {
        res.status(200).json({
          success: true,
          data: serviceResponse,
          message: "Challenge details fetched successfully",
        });
      }
    } catch (e) {
      res.status(500).json({ success: false, data: {}, message: e.message });
    }
  }

  static async apiGetAllChallengeDetails(req, res, next) {
    try {
      const serviceResponse = await ChallengeService.getAllChallengeDetails();
      if (typeof serviceResponse === "string") {
        res
          .status(200)
          .json({ success: false, data: {}, message: serviceResponse });
      } else {
        res.status(200).json({
          success: true,
          data: serviceResponse,
          message: "Challenge details fetched successfully",
        });
      }
    } catch (e) {
      res.status(500).json({ success: false, data: {}, message: e.message });
    }
  }

  

  static async apiUpdateChallenge(req, res, next) {
    try {
      const id = req.query.id;
      const {
        name,
        difficulty,
        longitude,
        latitude,
        questions,
        total_score,
        route,
        description,
        intro_url,
      } = req.body;

      const serviceResponse = await ChallengeService.updateChallenges(
        id,
        name,
        difficulty,
        longitude,
        latitude,
        questions,
        total_score,
        route,
        description,
        intro_url
      );
      if (typeof serviceResponse === "string") {
        res
          .status(200)
          .json({ success: false, data: {}, message: serviceResponse });
      } else {
        res.status(200).json({
          success: true,
          data: serviceResponse,
          message: "Challenge updated successfully",
        });
      }
    } catch (e) {
      res.status(500).json({ success: false, data: {}, message: e.message });
    }
  }
}
