import UserDAO from "../data/user_dao.mjs";
import TokenUtil from "../utility/token_util.mjs";
import PatternUtil from "../utility/pattern_util.mjs";
import AuthUtil from "../utility/auth_util.mjs";
import SessionService from "./session_service.mjs";
import AwsUtil from "../utility/aws_util.mjs";

export default class UserService {
  static async connectDatabase(client) {
    try {
      await UserDAO.injectDB(client);
    } catch (e) {
      console.error(`Unable to establish a collection handle: ${e}`);
    }
  }

  static async checkCreateAccountValidations(
    name,
    email,
    password,
    confirmPassword
  ) {
    const passwordCheck = PatternUtil.checkPasswordLength(password);
    if (!passwordCheck) {
      return "Password's length should be greater than 8 characters";
    }
    const passwordsMatch = password === confirmPassword;
    if (!passwordsMatch) {
      return "Passwords do not match";
    }
    const emailCheck = PatternUtil.checkEmailPattern(email);
    if (!emailCheck) {
      return "Please enter a valid email address";
    }
    const nameCheck = PatternUtil.checkAlphabeticName(name);
    if (!nameCheck) {
      return "Your name can not contain any numbers and special characters";
    }
    let existingUser = await UserDAO.getUserByEmailFromDB(email);
    if (existingUser) {
      return "A user with this email already exists, please choose another or sign in instead";
    }
    return null;
  }

  static async checkSignInAccountValidations(email, password) {
    let errorString;
    let existingUser;

    if (email) {
      existingUser = await UserDAO.getUserByEmailFromDB(email);
      if (!existingUser) {
        errorString = "Either your email or password is incorrect";
      }
    } else {
      errorString = "Either your email or password is incorrect";
    }

    if (!errorString) {
      if (!existingUser.password) {
        errorString =
          "An account with this email already exists with another sign-in method, please use that";
      } else {
        const passwordCheck = await AuthUtil.comparePasswords(
          password,
          existingUser.password
        );
        if (!passwordCheck) {
          errorString = "Either your email or password is incorrect";
        }
      }
    }

    if (errorString) {
      return errorString;
    } else {
      return existingUser;
    }
  }

  static async checkPasswordChangeValidations(
    existingUser,
    oldPassword,
    password,
    confirmPassword
  ) {
    let errorString;
    if (oldPassword) {
      const passwordCheck = await AuthUtil.comparePasswords(
        oldPassword,
        existingUser.password
      );
      if (!passwordCheck) {
        errorString = "The current password is incorrect";
      }
    }
    if (!errorString) {
      const passwordCheck = PatternUtil.checkPasswordLength(password);
      if (!passwordCheck) {
        return "New password's length should be greater than 8 characters";
      }
      const passwordsMatch = password === confirmPassword;
      if (!passwordsMatch) {
        return "New passwords do not match";
      }
    }

    if (errorString) {
      return errorString;
    } else {
      return existingUser;
    }
  }

  static async createUserAccount(
    name,
    email,
    password,
    confirmPassword,
    fcmToken
  ) {
    try {
      const validationCheck = await this.checkCreateAccountValidations(
        name,
        email,
        password,
        confirmPassword
      );
      if (typeof validationCheck === "string") {
        return validationCheck;
      }

      const createdOn = new Date();
      const deletedOn = null;
      const hashedPassword = await AuthUtil.hashPassword(password);
      const authToken = TokenUtil.createToken({
        email: email,
        last_signin_on: createdOn,
      });

      const userDocument = {
        contact_name: name,
        email: email,
        company_name: "",
        company_location: "",
        fcm_token: fcmToken ?? "x",
        role: "user",
        token: authToken,
        password: hashedPassword,
        google_id: null,
        apple_id: null,
        last_signin_on: createdOn,
        email_verified_on: null,
        email_verification_code: "",
        password_verification_code: "",
        last_signin_on: createdOn,
        created_on: createdOn,
        deleted_on: deletedOn,
      };

      const addedUserId = await UserDAO.addUserToDB(userDocument);

      const databaseUser = await UserDAO.getUserByIDFromDB(addedUserId);

      await this.sendVerification("email", databaseUser.email);

      const filteredUser = await this.getFormattedUser(databaseUser);

      filteredUser.login_method = "email";

      return { user: filteredUser };
    } catch (e) {
      return e.message;
    }
  }

  static async verifyCredentials(type, code, email) {
    try {
      let existingUser = await UserDAO.getUserByEmailFromDB(email);

      if (type === "email") {
        const emailOtp = existingUser.email_verification_code;

        if (code != emailOtp) {
          return "Please enter a valid code, the provided one is incorrect";
        }
        const emailVerifiedOn = new Date();
        const processedUpdateFields = {
          email_verified_on: emailVerifiedOn,
          email_verification_code: "",
        };
        existingUser = await UserDAO.updateUserFieldByID(
          existingUser._id,
          processedUpdateFields
        );
        return {};
      } else if (type === "password") {
        const passwordOtp = existingUser.password_verification_code;
        if (code != passwordOtp) {
          return "Please enter a valid code, the provided one is incorrect";
        } else {
          const processedUpdateFields = {
            password_verification_code: "",
          };
          existingUser = await UserDAO.updateUserFieldByID(
            existingUser._id,
            processedUpdateFields
          );
          return {};
        }
      } else {
        return "Mismatched type";
      }
    } catch (e) {
      return e.message;
    }
  }

  static async sendVerification(type, email) {
    try {
      let existingUser = await UserDAO.getUserByEmailFromDB(email);
      if (!existingUser) {
        return "No such user exists with the specified email";
      }
      if (existingUser.google_id || existingUser.apple_id) {
        return "This account was created with social logins and does not have a password to reset";
      }

      const otpCode = PatternUtil.generateRandomCode();

      let verification;
      if (type == "email") {
        verification = {
          email_verification_code: otpCode,
        };
      } else {
        verification = {
          password_verification_code: otpCode,
        };
      }
      const processedUpdateFields = this.convertToDotNotation(verification);

      existingUser = await UserDAO.updateUserFieldByID(
        existingUser._id,
        processedUpdateFields
      );

      await AwsUtil.sendEmail(existingUser.email, type == "password", otpCode);
      return {};
    } catch (e) {
      return e.message;
    }
  }

  static async updateProfile(token, updateFields) {
    try {
      let databaseUser = await this.getUserFromToken(token);
      const validUpdateFields = {};
      for (const field in updateFields) {
        if (updateFields.hasOwnProperty(field)) {
          const value = updateFields[field];
          switch (field) {
            case "name" || "company_name":
              if (!PatternUtil.checkAlphabeticName(value)) {
                throw new Error(
                  "Invalid name format. Name should contain only alphabetic characters"
                );
              }
              break;
            case "email":
              if (databaseUser.email !== value) {
                if (!databaseUser.password) {
                  throw new Error("SSO Users cannot update email");
                }
                if (!PatternUtil.checkEmailPattern(value)) {
                  throw new Error("Invalid email format");
                }
                if (await UserDAO.getUserByEmailFromDB(value)) {
                  throw new Error("Email already exists");
                }
              }

              break;
          }
          validUpdateFields[field] = value;
        }
      }

      const processedUpdateFields =
        this.convertToDotNotation(validUpdateFields);

      databaseUser = await UserDAO.updateUserFieldByID(
        databaseUser._id,
        processedUpdateFields
      );

      const updatedUser = await UserDAO.getUserByIDFromDB(databaseUser._id);
      const filteredUser = await this.getFormattedUser(updatedUser);

      return { user: filteredUser };
    } catch (e) {
      return e.message;
    }
  }

  static async updatePassword(token, oldPassword, password, confirmPassword) {
    try {
      let databaseUser = await this.getUserFromToken(token);

      const validationCheck = await this.checkPasswordChangeValidations(
        databaseUser,
        oldPassword,
        password,
        confirmPassword
      );

      if (typeof validationCheck === "string") {
        return validationCheck;
      }

      const hashedPassword = await AuthUtil.hashPassword(password);

      const processedUpdateFields = this.convertToDotNotation({
        password: hashedPassword,
      });

      databaseUser = await UserDAO.updateUserFieldByID(
        databaseUser._id,
        processedUpdateFields
      );

      const updatedUser = await UserDAO.getUserByIDFromDB(databaseUser._id);
      const filteredUser = await this.getFormattedUser(updatedUser);

      return { user: filteredUser };
    } catch (e) {
      return e.message;
    }
  }

  static async forgotPassword(email, password, confirmPassword) {
    try {
      let databaseUser = await UserDAO.getUserByEmailFromDB(email);

      const validationCheck = await this.checkPasswordChangeValidations(
        databaseUser,
        null,
        password,
        confirmPassword
      );

      if (typeof validationCheck === "string") {
        return validationCheck;
      }

      const hashedPassword = await AuthUtil.hashPassword(password);

      const processedUpdateFields = this.convertToDotNotation({
        password: hashedPassword,
      });

      databaseUser = await UserDAO.updateUserFieldByID(
        databaseUser._id,
        processedUpdateFields
      );

      const updatedUser = await UserDAO.getUserByIDFromDB(databaseUser._id);
      const filteredUser = await this.getFormattedUser(updatedUser);

      return { user: filteredUser };
    } catch (e) {
      return e.message;
    }
  }

  static async signInUser(email, password, fcmToken) {
    try {
      const validationCheck = await this.checkSignInAccountValidations(
        email,

        password
      );

      if (typeof validationCheck === "string") {
        return validationCheck;
      }

      let existingUser = validationCheck;

      const signedInOn = new Date();

      let tokenString;

      tokenString = TokenUtil.createToken({
        email: email,
        last_signin_on: signedInOn,
      });

      existingUser = await UserDAO.updateUserFieldByID(existingUser._id, {
        token: tokenString,
        last_signin_on: signedInOn,
        fcm_token: fcmToken,
      });

      const updatedUser = await UserDAO.getUserByIDFromDB(existingUser._id);
      const filteredUsers = await this.getFormattedUser(updatedUser);

      filteredUsers.login_method = "email";

      if (filteredUsers.email_verified_on == null) {
        await this.sendVerification("email", filteredUsers.email);
      }

      return { user: filteredUsers };
    } catch (e) {
      return e.message;
    }
  }

  static async ssoUser(email, name, appleId, googleId, fcmToken) {
    try {
      let existingUser;
      if (appleId) {
        existingUser = await UserDAO.getUserByAppleIDFromDB(appleId);
      } else if (googleId) {
        existingUser = await UserDAO.getUserByGoogleIDFromDB(googleId);
      }

      if (existingUser) {
        existingUser = await this.socialSignIn(
          existingUser,
          email,
          name,
          appleId,
          googleId,
          fcmToken
        );
      } else {
        existingUser = await UserDAO.getUserByEmailFromDB(email);
        if (existingUser) {
          return "This email is connected to another login method, kindly use that to proceed";
        }
        existingUser = await this.socialSignUp(
          email,
          name,
          appleId,
          googleId,
          fcmToken
        );
      }

      const filteredUser = await this.getFormattedUser(existingUser);
      filteredUser.login_method = googleId ? "google" : "apple";
      return { user: filteredUser };
    } catch (e) {
      return e.message;
    }
  }

  static async socialSignIn(
    existingUser,
    email,
    name,
    appleId,
    googleId,
    fcmToken
  ) {
    const signedInOn = new Date();

    const authToken = TokenUtil.createToken({
      sso_id: googleId ?? appleId,
      email: email ?? "",
      last_signin_on: signedInOn,
    });

    await UserDAO.updateUserFieldByID(existingUser._id, {
      token: authToken,
      last_signin_on: signedInOn,
      fcm_token: fcmToken,
    });

    const updatedUser = await UserDAO.getUserByIDFromDB(existingUser._id);

    return updatedUser;
  }

  static async socialSignUp(email, name, appleId, googleId, fcmToken) {
    const createdOn = new Date();
    const deletedOn = null;

    const authToken = TokenUtil.createToken({
      sso_id: googleId ?? appleId,
      email: email ?? "",
      last_signin_on: createdOn,
    });

    const userDocument = {
      contact_name: name,
      email: email,
      company_name: "",
      company_location: "",
      fcm_token: fcmToken ?? "x",
      role: "user",
      token: authToken,
      password: null,
      google_id: googleId ?? null,
      apple_id: appleId ?? null,
      email_verified_on: createdOn,
      email_verification_code: "",
      password_verification_code: "",
      last_signin_on: createdOn,
      created_on: createdOn,
      deleted_on: deletedOn,
    };

    const addedUserId = await UserDAO.addUserToDB(userDocument);

    const addedUser = await UserDAO.getUserByIDFromDB(addedUserId);

    return addedUser;
  }

  static async getUserDetails(token) {
    try {
      let databaseUser = await this.getUserFromToken(token);
      if (!databaseUser) {
        return "User with this token does not exists";
      }

      const filteredUser = await this.getFormattedUser(databaseUser);

      if (filteredUser.email_verified_on == null) {
        await this.sendVerification("email", databaseUser.email);
      }

      return { user: filteredUser };
    } catch (e) {
      return e.message;
    }
  }

  static async getFormattedUser(rawUser) {
    const filteredUser = PatternUtil.filterParametersFromObject(rawUser, [
      "created_on",
      "deleted_on",
      "role",
      "password",
      "email_verification_code",
      "password_verification_code",
    ]);

    filteredUser.notifications_enabled =
      rawUser.fcm_token !== null && rawUser.fcm_token !== "x";
    return filteredUser;
  }

  static async signOutUser(token) {
    try {
      let databaseUser = await UserDAO.getUserByAuthTokenFromDB(token);
      if (!databaseUser) {
        return "No such user found";
      }
      databaseUser = await UserDAO.updateUserFieldByID(databaseUser._id, {
        token: null,
        fcm_token: null,
      });

      return {};
    } catch (e) {
      return e.message;
    }
  }

  static async deleteUser(token) {
    try {
      let databaseUser = await UserDAO.getUserByAuthTokenFromDB(token);
      if (!databaseUser) {
        return "No such user found";
      }

      const sessions = await SessionService.getAllSessionsInternal(token);

      await Promise.all(
        sessions.map((e) => SessionService.deleteSession(e._id))
      );

      await UserDAO.deleteUserByID(databaseUser._id);

      return {};
    } catch (e) {
      return e.message;
    }
  }

  static async getUserFromToken(authToken) {
    try {
      let databaseUser = await UserDAO.getUserByAuthTokenFromDB(authToken);
      return databaseUser;
    } catch (e) {
      return e.message;
    }
  }

  static async getUserByID(userId) {
    try {
      let databaseUser = await UserDAO.getUserByIDFromDB(userId);
      return databaseUser;
    } catch (e) {
      return e.message;
    }
  }

  static convertToDotNotation(updateFields, prefix = "") {
    const processedUpdateFields = {};
    for (const key in updateFields) {
      if (Object.prototype.hasOwnProperty.call(updateFields, key)) {
        const value = updateFields[key];
        const newKey = prefix ? `${prefix}.${key}` : key;

        if (Array.isArray(value)) {
          processedUpdateFields[newKey] = value.map((item, index) => {
            if (typeof item === "object" && item !== null) {
              return this.convertToDotNotation(item, `${newKey}.${index}`);
            } else {
              return item;
            }
          });
        } else if (typeof value === "object" && value !== null) {
          const nestedFields = this.convertToDotNotation(value, newKey);
          Object.assign(processedUpdateFields, nestedFields);
        } else {
          processedUpdateFields[newKey] = value;
        }
      }
    }
    return processedUpdateFields;
  }
}
