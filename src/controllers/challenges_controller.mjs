import ChallengeService from "../services/challenges_service.mjs";
import QuestionService from "../services/questions_service.mjs";
import TokenUtil from "../utility/token_util.mjs";

export default class ChallengeController {
  static async apiCreateChallenge(req, res, next) {
    try {
      const { longitude, latitude, questions } = req.body;

      const serviceResponse = await ChallengeService.addChallenge(
        longitude, latitude, questions
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
      const _id = req.query._id;
      const serviceResponse = await ChallengeService.getChallengeByID(
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
}
