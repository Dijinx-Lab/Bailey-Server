import databaseConfig from "../config/database_config.mjs";

let usercon;

export default class UserDAO {
  static async injectDB(conn) {
    if (usercon) {
      return;
    }
    try {
      usercon = conn.db(databaseConfig.database.dbName).collection("users");
    } catch (e) {
      console.error(`Unable to establish a collection handle: ${e}`);
    }
  }

  static async addUserToDB(user) {
    try {
      const insertionResult = await usercon.insertOne(user);
      if (insertionResult && insertionResult.insertedId) {
        return insertionResult.insertedId;
      } else {
        return null;
      }
    } catch (e) {
      console.error(`Unable to add User: ${e}`);
      return null;
    }
  }

  static async getUserByEmailFromDB(email) {
    try {
      const user = await usercon.findOne({ email: email });
      return user;
    } catch (e) {
      console.error(`Unable to get user by ID: ${e}`);
      return null;
    }
  }

  static async getUserByIDFromDB(id) {
    try {
      const user = await usercon.findOne({ _id: id });
      return user;
    } catch (e) {
      console.error(`Unable to get user by ID: ${e}`);
      return null;
    }
  }

  static async updateUserPasswordInDB(email, newPassword) {
    try {
      const updateResult = await usercon.updateOne(
        { email },
        {
          $set: { password: newPassword },
        }
      );
      return true;
    } catch (e) {
      console.error(`Unable to get user by ID: ${e}`);
      return null;
    }
  }

  static async updateUserAccountInDB(user) {
    try {
      const updateResult = await usercon.updateOne(
        { _id: user._id },
        {
          $set: user,
        }
      );
      return true;
    } catch (e) {
      console.error(`Unable to get user by ID: ${e}`);
      return null;
    }
  }
}
