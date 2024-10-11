import databaseConfig from "../config/database_config.mjs";
import { ObjectId } from "mongodb";
let printcon;

export default class PrintsDAO {
  static async injectDB(conn) {
    if (printcon) {
      return;
    }
    try {
      printcon = conn.db(databaseConfig.database.dbName).collection("prints");
    } catch (e) {
      console.error(`Unable to establish a collection handle: ${e}`);
    }
  }
  static async addPrintsToDB(print) {
    try {
      const insertionResult = await printcon.insertOne(print);
      if (insertionResult && insertionResult.insertedId) {
        return insertionResult.insertedId;
      } else {
        return null;
      }
    } catch (e) {
      console.error(`Unable to add print: ${e}`);
      return null;
    }
  }
  static async getPrintByIDFromDB(id) {
    try {
      const print = await printcon.findOne({ _id: id });
      return print;
    } catch (e) {
      console.error(`Unable to get print by ID: ${e}`);
      return null;
    }
  }
  static async getAllPrints(user_id) {
    try {
      const print = await printcon
        .find({ session_id: user_id, deleted_on: { $eq: null } })
        .toArray();

      return print;
    } catch (e) {
      console.error(`Unable to get print by ID: ${e}`);
      return null;
    }
  }

  static async getAnyFirstPrint(user_id) {
    try {
      const print = await printcon.findOne({
        session_id: user_id,
        deleted_on: { $eq: null },
      });

      return print;
    } catch (e) {
      console.error(`Unable to get print by ID: ${e}`);
      return null;
    }
  }

  static async updatePrintsFieldByID(id, fieldsToUpdate) {
    try {
      const print = await printcon.findOneAndUpdate(
        { _id: id },
        { $set: fieldsToUpdate },
        { new: true }
      );
      return print;
    } catch (e) {
      console.error(`Unable to update print field: ${e}`);
      return null;
    }
  }
  static async getPrintByUserHandFinger(user_id, hand, finger) {
    try {
      const result = await printcon.findOne({
        user_id: user_id,
        hand: hand,
        finger: finger,
        deleted_on: null, // assuming that deleted prints have a non-null deleted_on field
      });
      return result;
    } catch (e) {
      throw new Error(`Unable to query prints: ${e}`);
    }
  }
  static async getPrintsByHandFromDB(hand) {
    try {
      const prints = await printcon.find({ hand: hand }).toArray();
      return prints;
    } catch (e) {
      console.error(`Unable to get prints by hand: ${e}`);
      return null;
    }
  }

  static async deletePrintByID(id) {
    try {
      const result = await printcon.deleteOne({ _id: id });
      return result.deletedCount > 0;
    } catch (e) {
      throw new Error(`Unable to delete photo: ${e}`);
    }
  }

  static async deletePrintsByUserID(user_id) {
    try {
      const result = await printcon.deleteMany({ user_id: user_id });
      return result.deletedCount > 0;
    } catch (e) {
      throw new Error(`Unable to delete prints: ${e}`);
    }
  }

  static async deletePrintsBySessionID(user_id) {
    try {
      const result = await printcon.deleteMany({ session_id: user_id });
      return result.deletedCount > 0;
    } catch (e) {
      throw new Error(`Unable to delete prints: ${e}`);
    }
  }
}
