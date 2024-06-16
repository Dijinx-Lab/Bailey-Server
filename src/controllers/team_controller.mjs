
import TeamService from "../services/teams_service.mjs";

export default class TeamController {
  static async apiCreateTeam(req, res, next) {
    try {
      const { name } = req.body;

      const serviceResponse = await TeamService.addTeam(name);
      if (typeof serviceResponse === "string") {
        res
          .status(200)
          .json({ success: false, data: {}, message: serviceResponse });
      } else {
        res.status(200).json({
          success: true,
          data: serviceResponse,
          message: "Team created successfully",
        });
      }
    } catch (e) {
      res.status(500).json({ success: false, data: {}, message: e.message });
    }
  }

  static async apiGetTeam(req, res, next) {
    try {
      const code = req.query.code;
      const serviceResponse = await TeamService.getTeamByCodeForAdmin(code);
      if (typeof serviceResponse === "string") {
        res
          .status(200)
          .json({ success: false, data: {}, message: serviceResponse });
      } else {
        res.status(200).json({
          success: true,
          data: serviceResponse,
          message: "Team details fetched successfully",
        });
      }
    } catch (e) {
      res.status(500).json({ success: false, data: {}, message: e.message });
    }
  }

  static async apiGetTeamByTeamCode(req, res, next) {
    try {
      const code = req.query.code;
      const serviceResponse = await TeamService.getTeamByTeamCode(code);
      if (typeof serviceResponse === "string") {
        res
          .status(200)
          .json({ success: false, data: {}, message: serviceResponse });
      } else {
        res.status(200).json({
          success: true,
          data: serviceResponse,
          message: "Team details fetched successfully",
        });
      }
    } catch (e) {
      res.status(500).json({ success: false, data: {}, message: e.message });
    }
  }

  static async apiGetAllTeams(req, res, next) {
    try {
      const serviceResponse = await TeamService.getAllTeams();
      if (typeof serviceResponse === "string") {
        res
          .status(200)
          .json({ success: false, data: {}, message: serviceResponse });
      } else {
        res.status(200).json({
          success: true,
          data: serviceResponse,
          message: "Team details fetched successfully",
        });
      }
    } catch (e) {
      res.status(500).json({ success: false, data: {}, message: e.message });
    }
  }

  static async apiGetAllTeamsForAdmin(req, res, next) {
    try {
      const serviceResponse = await TeamService.getAllTeamsForAdmin();
      if (typeof serviceResponse === "string") {
        res
          .status(200)
          .json({ success: false, data: {}, message: serviceResponse });
      } else {
        res.status(200).json({
          success: true,
          data: serviceResponse,
          message: "Team details fetched successfully",
        });
      }
    } catch (e) {
      res.status(500).json({ success: false, data: {}, message: e.message });
    }
  }

  static async apiUpdateTeam(req, res, next) {
    try {
      const team_code = req.query.code;
      const {
        score,
        active_challenge,
        completed_challenges,
        fcm_token,
        activated_on,
      } = req.body;

      const serviceResponse = await TeamService.updateTeamDetails(
        team_code,
        fcm_token,
        score,
        active_challenge,
        completed_challenges,
        activated_on
      );
      if (typeof serviceResponse === "string") {
        res
          .status(200)
          .json({ success: false, data: {}, message: serviceResponse });
      } else {
        res.status(200).json({
          success: true,
          data: serviceResponse,
          message: "Team updated successfully",
        });
      }
    } catch (e) {
      res.status(500).json({ success: false, data: {}, message: e.message });
    }
  }

  static async apiDeleteTeam(req, res, next) {
    try {
      const team_code = req.query.code;

      const serviceResponse = await TeamService.deleteTeam(team_code);
      if (typeof serviceResponse === "string") {
        res
          .status(200)
          .json({ success: false, data: {}, message: serviceResponse });
      } else {
        res.status(200).json({
          success: true,
          data: serviceResponse,
          message: "Team deleted successfully",
        });
      }
    } catch (e) {
      res.status(500).json({ success: false, data: {}, message: e.message });
    }
  }

  static async apiToggleActiveChallenge(req, res, next) {
    try {
      const team_code = req.query.code;
      const challenge_id = req.query.id || null;

      const serviceResponse = await TeamService.toggleActiveChallenge(
        team_code,
        challenge_id
      );
      if (typeof serviceResponse === "string") {
        res
          .status(200)
          .json({ success: false, data: {}, message: serviceResponse });
      } else {
        res.status(200).json({
          success: true,
          data: serviceResponse,
          message: "Team updated successfully",
        });
      }
    } catch (e) {
      res.status(500).json({ success: false, data: {}, message: e.message });
    }
  }

  static async apiUpdateCompletedChallenges(req, res, next) {
    try {
      const team_code = req.query.code;

      const serviceResponse = await TeamService.updateCompletedChallenges(
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
          message: "Team updated successfully",
        });
      }
    } catch (e) {
      res.status(500).json({ success: false, data: {}, message: e.message });
    }
  }

  static async apiGetAllTeamsForAdminDashboard(req, res, next) {
    try {
      const serviceResponse = await TeamService.getAllTeamsForAdminDashboard();
      if (typeof serviceResponse === "string") {
        res
          .status(200)
          .json({ success: false, data: {}, message: serviceResponse });
      } else {
        res.status(200).json({
          success: true,
          data: serviceResponse,
          message: "Team details fetched successfully",
        });
      }
    } catch (e) {
      res.status(500).json({ success: false, data: {}, message: e.message });
    }
  }

  static async apiGetTeamsActiveChart(req, res, next) {
    try {
      const filter = req.query.filter;
      const serviceResponse = await TeamService.getTeamsActiveChartData(filter);
      if (typeof serviceResponse === "string") {
        res
          .status(200)
          .json({ success: false, data: {}, message: serviceResponse });
      } else {
        res.status(200).json({
          success: true,
          data: serviceResponse,
          message: "Chart details fetched successfully",
        });
      }
    } catch (e) {
      res.status(500).json({ success: false, data: {}, message: e.message });
    }
  }

  static async apiGetTeamsChallengedChart(req, res, next) {
    try {
      const filter = req.query.filter;
      const serviceResponse = await TeamService.getTeamsChallengesChartData(
        filter
      );
      if (typeof serviceResponse === "string") {
        res
          .status(200)
          .json({ success: false, data: {}, message: serviceResponse });
      } else {
        res.status(200).json({
          success: true,
          data: serviceResponse,
          message: "Chart details fetched successfully",
        });
      }
    } catch (e) {
      res.status(500).json({ success: false, data: {}, message: e.message });
    }
  }
}
