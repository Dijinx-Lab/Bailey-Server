import ChallengeDAO from "../data/challenges_dao.mjs";
import { ObjectId } from "mongodb";
import PatternUtil from "../utility/pattern_util.mjs";
import RouteService from "./routes_service.mjs";
import RouteDAO from "../data/routes_dao.mjs";
import QuestionDAO from "../data/questions_dao.mjs";
import AnswerDAO from "../data/answers_dao.mjs";
import TeamDAO from "../data/team_dao.mjs";
import QuestionService from "./questions_service.mjs";
import TimingService from "./timing_service.mjs";

export default class ChallengeService {
  static async connectDatabase(client) {
    try {
      await ChallengeDAO.injectDB(client);
    } catch (e) {
      console.error(`Unable to establish a collection handle: ${e}`);
    }
  }

  static async addChallenge(
    name,
    difficulty,
    longitude,
    latitude,
    route,
    description,
    intro_url
  ) {
    try {
      const createdOn = new Date();
      const deletedOn = null;

      const new_route_id = new ObjectId(route);

      const chalDocument = {
        name: name,
        intro_url: intro_url ?? null,
        difficulty: difficulty,
        longitude: longitude,
        latitude: latitude,
        questions: 0,
        total_score: 0,
        route: new_route_id,
        description: description,
        created_on: createdOn,
        deleted_on: deletedOn,
      };

      const addedChalId = await ChallengeDAO.addChallengeToDB(chalDocument);
      const challenge = await ChallengeDAO.getChallengeByIDFromDB(addedChalId);

      const filteredChallenge = PatternUtil.filterParametersFromObject(
        challenge,
        ["created_on", "deleted_on"]
      );

      return { challenge: filteredChallenge };
    } catch (e) {
      return e.message;
    }
  }

  static async getChallengeByID(chalId) {
    try {
      const existingChallenge = await ChallengeDAO.getChallengeByIDFromDB(
        chalId
      );
      if (!existingChallenge) {
        return "No challenge found for this ID";
      } else {
        if (existingChallenge.route != null) {
          const chalResponse = await RouteService.getRouteByID(
            existingChallenge.route
          );
          if (typeof chalResponse !== "string") {
            existingChallenge.route = chalResponse;
          }
        }
        const filteredChallenge = PatternUtil.filterParametersFromObject(
          existingChallenge,
          ["created_on", "deleted_on"]
        );
        return filteredChallenge;
      }
    } catch (e) {
      return e.message;
    }
  }

  // static async getChallengeByID(chalId) {
  //   try {
  //     const existingChallenge = await ChallengeDAO.getChallengeByIDFromDB(
  //       chalId
  //     );
  //     if (!existingChallenge) {
  //       return "No challenge found for this ID";
  //     } else {
  //       if (existingChallenge.route != null) {
  //         const chalResponse = await RouteService.getRouteByID(
  //           existingChallenge.route
  //         );
  //         if (typeof chalResponse !== "string") {
  //           existingChallenge.route = chalResponse;
  //         }
  //       }
  //       const filteredChallenge = PatternUtil.filterParametersFromObject(
  //         existingChallenge,
  //         ["created_on", "deleted_on"]
  //       );
  //       return filteredChallenge;
  //     }
  //   } catch (e) {
  //     return e.message;
  //   }
  // }

  static async getChallengeByIDForAdmin(chalId) {
    try {
      const [existingChallenge, existingQuestion] = await Promise.all([
        ChallengeDAO.getChallengeByIDFromDB(chalId),
        QuestionDAO.getQuestionsByChallengeFromDB(chalId),
      ]);
      if (!existingChallenge) {
        return "No challenge found for this ID";
      } else {
        const filteredChallenge = PatternUtil.filterParametersFromObject(
          existingChallenge,
          ["created_on", "deleted_on"]
        );

        for (let i = 0; i < existingQuestion.length; i++) {
          const filteredQuestion = PatternUtil.filterParametersFromObject(
            existingQuestion[i],
            ["created_on", "deleted_on"]
          );

          existingQuestion[i] = filteredQuestion;
        }

        filteredChallenge.intro_url = existingChallenge.intro_url;

        return { challenge: filteredChallenge, questions: existingQuestion };
      }
    } catch (e) {
      return e.message;
    }
  }

  static async deleteChallenge(chalId) {
    try {
      const [existingChallenge, existingQuestion] = await Promise.all([
        ChallengeDAO.getChallengeByIDFromDB(chalId),
        QuestionDAO.getQuestionsByChallengeFromDB(chalId),
      ]);
      if (!existingChallenge) {
        return "No challenge found for this ID";
      } else {
        const deletePromises = existingQuestion.map((question) =>
          QuestionService.deleteQuestion(question._id)
        );
        console.log(existingQuestion);
        await Promise.all(deletePromises);

        const deletedOn = new Date();

        existingChallenge.deleted_on = deletedOn;

        const updateResult = await ChallengeDAO.updateChallengeInDB(
          existingChallenge
        );

        return {};
      }
    } catch (e) {
      return e.message;
    }
  }

  static async getChallengesByRoute(routeId) {
    try {
      const existingChallenge = await ChallengeDAO.getChallengeByRouteFromDB(
        routeId
      );
      if (!existingChallenge) {
        return "No challenge found for this route";
      } else {
        for (let i = 0; i < existingChallenge.length; i++) {
          if (existingChallenge[i].route != null) {
            const chalResponse = await RouteService.getRouteByID(
              existingChallenge[i].route
            );
            if (typeof chalResponse !== "string") {
              existingChallenge[i].route = chalResponse;
            }
          }
          const filteredChallenge = PatternUtil.filterParametersFromObject(
            existingChallenge[i],
            ["created_on", "deleted_on"]
          );
          existingChallenge[i] = filteredChallenge;
        }
        return existingChallenge;
      }
    } catch (e) {
      return e.message;
    }
  }

  static async updateChallenges(
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
  ) {
    try {
      let existingChallenge = await ChallengeDAO.getChallengeByIDFromDB(id);
      if (!existingChallenge) {
        return "No challenge found for this id";
      }

      if (name) {
        existingChallenge.name = name;
      }

      if (difficulty) {
        existingChallenge.difficulty = difficulty;
      }

      if (longitude) {
        existingChallenge.longitude = longitude;
      }

      if (latitude) {
        existingChallenge.latitude = latitude;
      }

      if (questions) {
        existingChallenge.questions = questions;
      }

      if (total_score) {
        existingChallenge.total_score = total_score;
      }

      if (route) {
        existingChallenge.route = route;
      }

      if (description) {
        existingChallenge.description = description;
      }

      if (intro_url) {
        existingChallenge.intro_url = intro_url;
      }

      const updateResult = await ChallengeDAO.updateChallengeInDB(
        existingChallenge
      );

      existingChallenge = await ChallengeDAO.getChallengeByIDFromDB(id);

      if (updateResult) {
        return existingChallenge;
      } else {
        return "Failed to update the challenge";
      }
    } catch (e) {
      return e.message;
    }
  }

  static async updateChallengeStats(action, id, total_score) {
    try {
      const existingChallenge = await ChallengeDAO.getChallengeByIDFromDB(id);
      if (!existingChallenge) {
        return "No challenge found for this id";
      }

      if (action === "add") {
        existingChallenge.questions += 1;

        if (total_score) {
          existingChallenge.total_score += total_score;
        }
      } else if (action === "update") {
        if (total_score) {
          existingChallenge.total_score += total_score;
        }
      } else if (action === "delete") {
        existingChallenge.questions -= 1;

        if (total_score) {
          existingChallenge.total_score -= total_score;
        }
      }

      const updateResult = await ChallengeDAO.updateChallengeInDB(
        existingChallenge
      );

      if (updateResult) {
        return {};
      } else {
        return "Failed to update the challenge";
      }
    } catch (e) {
      return e.message;
    }
  }

  static async getChallengeSummary(chalId, team_code) {
    try {
      const [existingChallenge, existingAnswer] = await Promise.all([
        ChallengeDAO.getChallengeByIDFromDB(chalId),
        AnswerDAO.getAnswerByTeamCode(team_code),
      ]);

      if (!existingChallenge) {
        return "No challenge found for this id";
      }

      if (!existingAnswer) {
        return "No answer found for this team code";
      }

      let total_score = 0;

      for (let i = 0; i < existingAnswer.length; i++) {
        const existingQues = await QuestionDAO.getQuestionByIDFromDB(
          existingAnswer[i].question
        );
        existingAnswer[i].question = existingQues.question;
        existingAnswer[i].challengeId = existingQues.challenge;

        total_score += existingAnswer[i].score;
      }

      const challengeId = existingChallenge._id.toString();

      const challengeAnswers = existingAnswer.filter(
        (answer) => answer.challengeId.toString() === challengeId
      );

      const filteredChallenge = PatternUtil.filterParametersFromObject(
        existingChallenge,
        ["created_on", "deleted_on"]
      );

      filteredChallenge.total_score = total_score;
      // filteredChallenge.answers = challengeAnswers;

      return { challenge: filteredChallenge, answers: challengeAnswers };
    } catch (e) {
      return e.message;
    }
  }

  static async getAllChallengeDetails() {
    try {
      const [existingChallenge, existingTeam] = await Promise.all([
        ChallengeDAO.getAllChallengesFromDB(),
        TeamDAO.getAllTeamsFromDB(),
      ]);

      const total_challenges = existingChallenge.length;
      const completed_challenges = existingTeam.reduce((total, team) => {
        return total + team.completed_challenges.length;
      }, 0);
      const uncompleted_challenges = total_challenges - completed_challenges;

      if (!existingChallenge) {
        return "No challenge found";
      } else {
        for (let i = 0; i < existingChallenge.length; i++) {
          const filteredChallenge = PatternUtil.filterParametersFromObject(
            existingChallenge[i],
            ["created_on", "deleted_on"]
          );

          existingChallenge[i] = filteredChallenge;
        }

        return {
          total_challenges: total_challenges,
          completed_challenges: completed_challenges,
          uncompleted_challenges: uncompleted_challenges,
          challenges: existingChallenge,
        };
      }
    } catch (e) {
      return e.message;
    }
  }

  static async getChallengesChartData(filter) {
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

      return {
        filter: filter,
        chart_min: Math.min(...data),
        chart_max: Math.max(...data),
        keys: keys,
        data: data,
        mapped_data: monthCounts,
        
      };
    } catch (e) {
      return e.message;
    }
  }

  static getWeek(date) {
    const onejan = new Date(date.getFullYear(), 0, 1);
    const weekNumber = Math.ceil(
      ((date - onejan) / 86400000 + onejan.getDay() + 1) / 7
    );
    return weekNumber;
  }
}
