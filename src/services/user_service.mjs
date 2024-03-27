import UserDAO from "../data/user_dao.mjs";
import AuthUtil from "../utility/auth_util.mjs";
import PatternUtil from "../utility/pattern_util.mjs";
import TokenUtil from "../utility/token_util.mjs";
import TokenService from "./token_service.mjs";

export default class UserService {
  static async connectDatabase(client) {
    try {
      await UserDAO.injectDB(client);
    } catch (e) {
      console.error(`Unable to establish a collection handle: ${e}`);
    }
  }

  static async addUser(firstname, lastname, email, password) {
    try {
      const existingUser = await UserDAO.getUserByEmailFromDB(email);
      if (existingUser) {
        return "User with this email already exists";
      }
      const passwordCheck = PatternUtil.checkPasswordLength(password);
      if (!passwordCheck) {
        return "Password's length should be greater than 8 characters";
      }
      const emailCheck = PatternUtil.checkEmailPattern(email);
      if (!emailCheck) {
        return "Please enter a valid email";
      }
      const nameCheck =
        PatternUtil.checkAlphabeticName(firstname) &&
        PatternUtil.checkAlphabeticName(lastname);
      if (!nameCheck) {
        return "Name can not contain numbers and special characters";
      }

      const hashedPassword = await AuthUtil.hashPassword(password);
      const createdOn = new Date();
      const deletedOn = null;

      const userDocument = {
        email: email,
        firstname: firstname,
        lastname: lastname,
        password: hashedPassword,
        role: "user",
        created_on: createdOn,
        deleted_on: deletedOn,
      };

      const addedUserId = await UserDAO.addUserToDB(userDocument);
      const user = await UserDAO.getUserByIDFromDB(addedUserId);
      const filteredUsers = PatternUtil.filterParametersFromObject(user, [
        "_id",
        "password",
        "role",
      ]);

      return { user: filteredUsers };
    } catch (e) {
      return e.message;
    }
  }

  static async signInUser(email, password, deviceName, deviceId, ipAddress) {
    try {
      const existingUser = await UserDAO.getUserByEmailFromDB(email);
      if (!existingUser) {
        return "Either your email or password is incorrect";
      }
      const passwordCheck = await AuthUtil.comparePasswords(
        password,
        existingUser.password
      );
      if (!passwordCheck) {
        return "Either your email or password is incorrect";
      }

      const signedInOn = new Date();
      const tokenPayload = {
        _id: existingUser._id.toString(),
        email: existingUser.email,
        role: existingUser.role,
        signedInOn: signedInOn,
        deviceName: deviceName,
        deviceId: deviceId,
        ipAddress: ipAddress,
      };

      const tokenString = await TokenService.createUserToken(tokenPayload);
      const user = await UserDAO.getUserByIDFromDB(existingUser._id);
      const filteredUsers = PatternUtil.filterParametersFromObject(user, [
        "_id",
        "password",
        "role",
      ]);

      return {
        token: tokenString,
        signed_in_on: signedInOn,
        user: filteredUsers,
      };
    } catch (e) {
      return e.message;
    }
  }

  static async signOutUser(token) {
    try {
      const cleanedToken = TokenUtil.cleanToken(token);
      const deleteToken = await TokenService.deleteUserToken(cleanedToken);

      return deleteToken;
    } catch (e) {
      return e.message;
    }
  }

  static async getUserByID(userId) {
    try {
      const existingUser = await UserDAO.getUserByIDFromDB(userId);
      if (!existingUser) {
        return "No user found for this ID";
      } else {
        return existingUser;
      }
    } catch (e) {
      return e.message;
    }
  }

  static async getUserAccountDetails(userId) {
    try {
      const existingUser = await UserDAO.getUserByIDFromDB(userId);
      if (!existingUser) {
        return "No user found for this ID";
      } else {
        const filteredUsers = PatternUtil.filterParametersFromObject(
          existingUser,
          ["_id", "password", "role"]
        );

        return { user: filteredUsers };
      }
    } catch (e) {
      return e.message;
    }
  }

  static async updateUserAccountPassword(userId, oldPassword, newPassword) {
    try {
      const existingUser = await UserDAO.getUserByIDFromDB(userId);
      if (!existingUser) {
        return "No user found for this ID";
      }

      const passwordCheck = await AuthUtil.comparePasswords(
        oldPassword,
        existingUser.password
      );

      if (!passwordCheck) {
        return "Incorrect password entered";
      }

      const newPasswordCheck = PatternUtil.checkPasswordLength(newPassword);
      if (!newPasswordCheck) {
        return "Password's length should be greater than 8 characters";
      }
      const hashedPassword = await AuthUtil.hashPassword(newPassword);
      const updateResult = await UserDAO.updateUserPasswordInDB(
        existingUser.email,
        hashedPassword
      );

      if (updateResult) {
        return {};
      } else {
        return "Failed to update the password";
      }
    } catch (e) {
      return e.message;
    }
  }

  static async updateUserAccountDetails(userId, firstName, lastName) {
    try {
      const existingUser = await UserDAO.getUserByIDFromDB(userId);
      if (!existingUser) {
        return "No user found for this ID";
      }

      if (firstName) {
        const firstNameCheck = PatternUtil.checkAlphabeticName(firstName);
        if (!firstNameCheck) {
          return "Name can not contain numbers and special characters";
        } else {
          existingUser.firstname = firstName;
        }
      }

      if (lastName) {
        const lastNameCheck = PatternUtil.checkAlphabeticName(lastName);
        if (!lastNameCheck) {
          return "Name can not contain numbers and special characters";
        } else {
          existingUser.lastname = lastName;
        }
      }

      const updateResult = await UserDAO.updateUserAccountInDB(existingUser);

      if (updateResult) {
        return {};
      } else {
        return "Failed to update the password";
      }
    } catch (e) {
      return e.message;
    }
  }
}
