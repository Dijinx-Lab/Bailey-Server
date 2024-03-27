import { ObjectId } from "mongodb";
import TokenDAO from "../data/token_dao.mjs";
import TokenUtil from "../utility/token_util.mjs";

export default class TokenService {
  static async connectDatabase(client) {
    try {
      await TokenDAO.injectDB(client);
    } catch (e) {
      console.error(`Unable to establish a collection handle: ${e}`);
    }
  }

  static async createUserToken(payload) {
    try {
      const tokenString = TokenUtil.createToken(payload);
      const signedInOn = payload.signedInOn;
      const userId = new ObjectId(payload._id);
      const deviceName = payload.deviceName;
      const deviceId = payload.deviceId;
      const IpAddress = payload.ipAddress;
      const role = payload.role;

      const tokenDocument = {
        token: tokenString,
        user_id: userId,
        role: role,
        device_name: deviceName,
        device_id: deviceId,
        ip_address: IpAddress,
        signed_in_on: signedInOn,
      };
      const addedTokenId = await TokenDAO.addTokenToDB(tokenDocument);
      return tokenString;
    } catch (e) {
      console.log(e.message);
      return null;
    }
  }

  static async getUserToken(tokenString) {
    try {
      const tokenObject = await TokenDAO.getTokenFromDB(tokenString);
      return tokenObject;
    } catch (e) {
      console.log(e.message);
      return null;
    }
  }

  static async deleteUserToken(tokenString) {
    try {
      const tokenObject = await TokenDAO.deleteTokenFromDB(tokenString);
      return tokenObject;
    } catch (e) {
      console.log(e.message);
      return null;
    }
  }
}
