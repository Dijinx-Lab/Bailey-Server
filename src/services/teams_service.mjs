import ChallengeDAO from "../data/challenges_dao.mjs";
import PatternUtil from "../utility/pattern_util.mjs";
import TeamDAO from "../data/team_dao.mjs";
import ChallengeService from "./challenges_service.mjs";
import AnswerDAO from "../data/answers_dao.mjs";
import QuestionDAO from "../data/questions_dao.mjs";
import TimingDAO from "../data/timing_dao.mjs";
import TimingService from "./timing_service.mjs";

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
      const alrTeam = await TeamDAO.getTeamByTeamName(name);
      if (alrTeam) {
        return "A team with this name already exists. Please try a more unique name";
      }
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
            const quesResponse =
              await QuestionDAO.getQuestionByIDFromDBIgnoreDel(
                existingAnswer[j].question
              );
            if (!quesResponse) {
              continue;
            }
            if (typeof quesResponse !== "string") {
              existingAnswer[j].question = quesResponse.question;
              // existingAnswer[j].points = quesResponse.score;
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
          const isActive = routeTiming.start_time ? true : false;
          filteredTeam.status = isActive ? "ACTIVE" : "INACTIVE";

          filteredTeam.route_started = routeTiming.start_time;

          filteredTeam.time_taken = isActive
            ? `${((routeTiming.end_time - routeTiming.start_time) / (1000 * 60))
                .toFixed(2)
                .toString()} mins`
            : "PENDING";
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
          filteredTeam.leaderboard = j + 1;
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
          filteredTeam.leaderboard = j + 1;
          existingTeam[j] = filteredTeam;
        }

        const totalTeams = existingTeam.length;

        const totalChallenges = existingChallenge
          ? existingChallenge.length
          : 0;

        return {
          total_teams: totalTeams,
          total_challenges: totalChallenges,
          teams: existingTeam,
        };
      }
    } catch (e) {
      return e.message;
    }
  }

  static async getTeamsActiveChartData(filter) {
    try {
      let keys;
      switch (filter) {
        case "monthly":
          keys = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];
          break;
        case "weekly":
          keys = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
          break;
        case "daily":
          keys = Array.from({ length: 24 }, (_, i) =>
            i.toString().padStart(2, "0")
          );
          break;
        default:
          throw new Error(`Unsupported filter: ${filter}`);
      }

      const monthCounts = Object.fromEntries(keys.map((key) => [key, 0]));

      const existingTeams = await TeamDAO.getAllTeamsFromDB();

      const routesCompletedPromises = existingTeams.map(async (team) => {
        try {
          const timings = await TimingService.getTeamTimings(team.team_code);
          return timings;
        } catch (e) {
          console.error(
            `Error fetching timings for team ${team.team_code}: ${e.message}`
          );
          return null; // Handle error by returning null
        }
      });

      let routesCompletedResults = await Promise.all(routesCompletedPromises);
      routesCompletedResults = routesCompletedResults.filter(
        (result) => result !== null
      );

      const currentDate = new Date();

      routesCompletedResults.forEach((result) => {
        const timings = result.timings;
        if (timings && timings.start_time) {
          const startDateTime = new Date(timings.start_time);
          switch (filter) {
            case "monthly":
              if (startDateTime.getFullYear() === currentDate.getFullYear()) {
                const startMonth = startDateTime.getMonth();
                const monthKey = keys[startMonth];
                monthCounts[monthKey]++;
              }
              break;
            case "weekly":
              if (
                startDateTime.getFullYear() === currentDate.getFullYear() &&
                this.getWeek(startDateTime) === this.getWeek(currentDate)
              ) {
                const startDayOfWeek = startDateTime.getDay();
                const dayKey = keys[startDayOfWeek];
                monthCounts[dayKey]++;
              }

              break;
            case "daily":
              if (
                startDateTime.getFullYear() === currentDate.getFullYear() &&
                startDateTime.getMonth() === currentDate.getMonth() &&
                startDateTime.getDate() === currentDate.getDate()
              ) {
                const startHour = startDateTime.getHours();
                const hourKey = keys[startHour];
                monthCounts[hourKey]++;
              }
              break;
          }
        } else {
          console.warn("Unexpected timings format:", timings);
        }
      });

      const data = keys.map((key) => monthCounts[key]);
      const min = Math.min(...data);
      const max = Math.max(...data);
      const scale = this.generateYAxisLabels(min, max);

      return {
        filter: filter,
        chart_min: min,
        chart_max: max,
        scale: scale,
        keys: keys,
        data: data,
        mapped_data: monthCounts,
      };
    } catch (e) {
      return e.message;
    }
  }

  static async getTeamsChallengesChartData(filter) {
    try {
      let keys;
      switch (filter) {
        case "monthly":
          keys = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];
          break;
        case "weekly":
          keys = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
          break;
        case "daily":
          keys = Array.from({ length: 24 }, (_, i) =>
            i.toString().padStart(2, "0")
          );
          break;
        default:
          throw new Error(`Unsupported filter: ${filter}`);
      }

      const counts = Object.fromEntries(keys.map((key) => [key, 0]));

      let existingTeams = await TeamDAO.getAllTeamsFromDB();

      const routesCompletedPromises = existingTeams.map(async (team) => {
        try {
          const timings = await TimingService.getTeamTimings(team.team_code);
          return { team, timings };
        } catch (e) {
          console.error(
            `Error fetching timings for team ${team.team_code}: ${e.message}`
          );
          return null;
        }
      });

      let routesCompletedResults = await Promise.all(routesCompletedPromises);

      routesCompletedResults = routesCompletedResults.filter(
        (result) =>
          result !== null && result.timings && result.timings.timings.start_time
      );

      const currentDate = new Date();

      routesCompletedResults.forEach((result) => {
        const { team, timings } = result;
        const startDateTime = new Date(timings.timings.start_time);
        let key = null;

        switch (filter) {
          case "monthly":
            if (startDateTime.getFullYear() === currentDate.getFullYear()) {
              key = keys[startDateTime.getMonth()];
            }
            break;
          case "weekly":
            if (
              startDateTime.getFullYear() === currentDate.getFullYear() &&
              this.getWeek(startDateTime) === this.getWeek(currentDate)
            ) {
              key = keys[startDateTime.getDay()];
            }
            break;
          case "daily":
            if (
              startDateTime.getFullYear() === currentDate.getFullYear() &&
              startDateTime.getMonth() === currentDate.getMonth() &&
              startDateTime.getDate() === currentDate.getDate()
            ) {
              key = keys[startDateTime.getHours()];
            }
            break;
        }

        if (key) {
          counts[key] += team.completed_challenges.length;
        }
      });

      const data = keys.map((key) => counts[key]);

      const min = Math.min(...data);
      const max = Math.max(...data);
      const scale = this.generateYAxisLabels(min, max);

      return {
        filter: filter,
        chart_min: min,
        chart_max: max,
        scale: scale,
        keys: keys,
        data: data,
        mapped_data: counts,
      };
    } catch (e) {
      return e.message;
    }
  }

  static generateYAxisLabels(min, max) {
    const range = max - min;
    let interval;
    if (range <= 10) {
      interval = 2;
    } else if (range <= 50) {
      interval = 10;
    } else if (range <= 100) {
      interval = 15;
    } else if (range <= 500) {
      interval = 100;
    } else if (range <= 1000) {
      interval = 200;
    } else {
      interval = 500;
    }

    const labels = [];
    for (let i = 0; i <= max + interval; i += interval) {
      labels.push(i);
    }
    return labels;
  }

  static getWeek(date) {
    const onejan = new Date(date.getFullYear(), 0, 1);
    const weekNumber = Math.ceil(
      ((date - onejan) / 86400000 + onejan.getDay() + 1) / 7
    );
    return weekNumber;
  }

  static async deleteTeam(id) {
    try {
      let existingTeam = await TeamDAO.getTeamByTeamCode(id);
      if (!existingTeam) {
        return "No team found for this code";
      }

      const deletedOn = new Date();

      existingTeam.deleted_on = deletedOn;

      const updateResult = await TeamDAO.updateTeamInDB(existingTeam);

      return {};
    } catch (e) {
      return e.message;
    }
  }
}
