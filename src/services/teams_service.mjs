import ChallengeDAO from "../data/challenges_dao.mjs";
import { ObjectId } from "mongodb";
import AuthUtil from "../utility/auth_util.mjs";
import PatternUtil from "../utility/pattern_util.mjs";
import TokenUtil from "../utility/token_util.mjs";
import TokenService from "./token_service.mjs";
import QuestionService from "./questions_service.mjs";
import TeamDAO from "../data/team_dao.mjs";
import ChallengeService from "./challenges_service.mjs";
import FirebaseUtility from "../utility/fcm_utility.mjs";
import AnswerDAO from "../data/answers_dao.mjs";
import QuestionDAO from "../data/questions_dao.mjs";
import TimingDAO from "../data/timing_dao.mjs";

export default class TeamService {
  static async connectDatabase(client) {
    try {
      await TeamDAO.injectDB(client);
    } catch (e) {
      console.error(`Unable to establish a collection handle: ${e}`);
    }
  }

  static async addTeam(name) {
    try {
      const createdOn = new Date();
      const deletedOn = null;

      let team_code;

      while (true) {
        team_code = PatternUtil.generateRandomCode();
        const existingTeam = await TeamDAO.getTeamByTeamCode(team_code);

        if (existingTeam) {
          continue;
        }

        break;
      }

      const teamDocument = {
        name: name,
        team_code: team_code,
        score: 0,
        active_challenge: null,
        completed_challenges: [],
        fcm_token: null,
        created_on: createdOn,
        deleted_on: deletedOn,
      };

      const addTeamId = await TeamDAO.addTeamToDB(teamDocument);
      const team = await TeamDAO.getTeamByIDFromDB(addTeamId);

      const filteredTeam = PatternUtil.filterParametersFromObject(team, [
        "fcm_token",
        "created_on",
        "deleted_on",
      ]);

      return { team: filteredTeam };
    } catch (e) {
      return e.message;
    }
  }

  static async getTeamByCodeForAdmin(team_code) {
    try {
      const [existingTeam, existingAnswer, allTeams, routeTiming] =
        await Promise.all([
          TeamDAO.getTeamByTeamCode(team_code),
          AnswerDAO.getAnswerByTeamCode(team_code),
          TeamDAO.getAllTeamsFromDB(),
          TimingDAO.getTimingByTeamCodeFromDB(team_code),
        ]);

      if (!existingTeam) {
        return "No team found for this code";
      } else {
        const filteredTeam = PatternUtil.filterParametersFromObject(
          existingTeam,
          ["created_on", "deleted_on"]
        );

        for (let j = 0; j < existingAnswer.length; j++) {
          if (existingAnswer[j].question != null) {
            const quesResponse = await QuestionDAO.getQuestionByIDFromDB(
              existingAnswer[j].question
            );
            if (typeof quesResponse !== "string") {
              existingAnswer[j].question = quesResponse.question;
              existingAnswer[j].points = quesResponse.score;
            }
          }

          const filteredAnswer = PatternUtil.filterParametersFromObject(
            existingAnswer[j],
            ["created_on", "deleted_on"]
          );

          existingAnswer[j] = filteredAnswer;
        }

        filteredTeam.answered = existingAnswer.length;

        const index = allTeams.findIndex(
          (team) => team.team_code === team_code
        );

        if (index !== -1) {
          filteredTeam.leaderboard = index + 1;
        }

        if (routeTiming) {
          filteredTeam.status = !routeTiming.end_time && routeTiming.start_time ? "ACTIVE" : "INACTIVE";

          filteredTeam.route_started = new Intl.DateTimeFormat("en-GB").format(routeTiming.start_time).toString();

          filteredTeam.time_taken = (filteredTeam.status === "INACTIVE")
          ? ((routeTiming.end_time - routeTiming.start_time) / (1000 * 60)).toFixed(2)
          : null;
                    
        } else {
          filteredTeam.route_started = null;
          filteredTeam.time_taken = null;
          filteredTeam.status = "INACTIVE";
        }

        const newFilteredTeam = PatternUtil.renameKeys(filteredTeam, {
          score: "points_scored",
        });

        return { team: newFilteredTeam, answer: existingAnswer };
      }
    } catch (e) {
      return e.message;
    }
  }

  static async getTeamByTeamCode(team_code) {
    try {
      const existingTeam = await TeamDAO.getTeamByTeamCode(team_code);
      if (!existingTeam) {
        return "No team found for this Team Code";
      } else {
        const filteredTeam = PatternUtil.filterParametersFromObject(
          existingTeam,
          ["created_on", "deleted_on"]
        );
        return { team: filteredTeam };
      }
    } catch (e) {
      return e.message;
    }
  }

  static async getAllTeams() {
    try {
      const existingTeam = await TeamDAO.getAllTeamsFromDB();
      if (!existingTeam) {
        return "No teams found";
      } else {
        for (let j = 0; j < existingTeam.length; j++) {
          const filteredTeam = PatternUtil.filterParametersFromObject(
            existingTeam[j],
            ["created_on", "deleted_on"]
          );

          existingTeam[j] = filteredTeam;
        }

        return { teams: existingTeam };
      }
    } catch (e) {
      return e.message;
    }
  }

  static async getAllTeamsForAdmin() {
    try {
      const existingTeam = await TeamDAO.getAllTeamsFromDB();
      const totalTeams = existingTeam.length;
      if (!existingTeam) {
        return "No teams found";
      } else {
        for (let j = 0; j < existingTeam.length; j++) {
          const filteredTeam = PatternUtil.filterParametersFromObject(
            existingTeam[j],
            ["created_on", "deleted_on"]
          );

          existingTeam[j] = filteredTeam;
        }

        return { total_teams: totalTeams, teams: existingTeam };
      }
    } catch (e) {
      return e.message;
    }
  }

  static async updateTeamDetails(
    team_code,
    fcm_token,
    score,
    active_challenge,
    completed_challenges
  ) {
    try {
      const existingTeam = await TeamDAO.getTeamByTeamCode(team_code);
      if (!existingTeam) {
        return "No team found for this team code";
      }

      if (fcm_token) {
        existingTeam.fcm_token = fcm_token;
      }

      if (score) {
        existingTeam.score = score;
      }

      if (active_challenge) {
        existingTeam.active_challenge = active_challenge;
      }

      if (completed_challenges) {
        existingTeam.completed_challenges = completed_challenges;
      }

      const updateResult = await TeamDAO.updateTeamInDB(existingTeam);

      if (updateResult) {
        return {};
      } else {
        return "Failed to update the team";
      }
    } catch (e) {
      return e.message;
    }
  }

  static async toggleActiveChallenge(team_code, active_challenge) {
    try {
      const existingTeam = await TeamDAO.getTeamByTeamCode(team_code);
      if (!existingTeam) {
        return "No team found for this team code";
      }

      existingTeam.active_challenge = existingTeam.active_challenge
        ? null
        : active_challenge;

      const updateResult = await TeamDAO.updateTeamInDB(existingTeam);

      if (updateResult) {
        return {};
      } else {
        return "Failed to update the active challenge";
      }
    } catch (e) {
      return e.message;
    }
  }

  static async updateCompletedChallenges(team_code) {
    try {
      const existingTeam = await TeamDAO.getTeamByTeamCode(team_code);
      if (!existingTeam) {
        return "No team found for this team code";
      }

      if (existingTeam.active_challenge == null) {
        return "No active challenge";
      }

      existingTeam.completed_challenges =
        existingTeam.completed_challenges || [];
      existingTeam.completed_challenges.push(existingTeam.active_challenge);

      const summaryResponse = await ChallengeService.getChallengeSummary(
        existingTeam.active_challenge,
        team_code
      );

      existingTeam.active_challenge = null;

      const updateResult = await TeamDAO.updateTeamInDB(existingTeam);

      if (updateResult) {
        return summaryResponse;
      } else {
        return "Failed to update the team";
      }
    } catch (e) {
      return e.message;
    }
  }

  static async getAllTeamsForAdminDashboard() {
    try {
      const [existingTeam, existingChallenge] = await Promise.all([
        TeamDAO.getAllTeamsFromDBForDashboard(),
        ChallengeDAO.getAllChallengesFromDB(),
      ]);

      if (!existingTeam) {
        return "No teams found";
      } else {
        for (let j = 0; j < existingTeam.length; j++) {
          const filteredTeam = PatternUtil.filterParametersFromObject(
            existingTeam[j],
            ["created_on", "deleted_on"]
          );

          existingTeam[j] = filteredTeam;
        }

        const totalTeams = existingTeam.length;
        
        const totalChallenges = existingChallenge ? existingChallenge.length : 0;

        return { total_teams: totalTeams, total_challenges: totalChallenges, teams: existingTeam };
      }
    } catch (e) {
      return e.message;
    }
  }
}