import AdminDAO from "../data/admin_dao.mjs";
import AuthUtil from "../utility/auth_util.mjs";
import PatternUtil from "../utility/pattern_util.mjs";
import TokenUtil from "../utility/token_util.mjs";
import TokenService from "./token_service.mjs";

export default class AdminService {
  static async connectDatabase(client) {
    try {
      await AdminDAO.injectDB(client);
    } catch (e) {
      console.error(`Unable to establish a collection handle: ${e}`);
    }
  }

  static async addAdmin(username, password) {
    try {
      const existingAdmin = await AdminDAO.getAdminByUsernameFromDB(username);
      if (existingAdmin) {
        return "Admin with this username already exists";
      }
      const passwordCheck = PatternUtil.checkPasswordLength(password);
      if (!passwordCheck) {
        return "Password's length should be greater than 8 characters";
      }

      const hashedPassword = await AuthUtil.hashPassword(password);
      const createdOn = new Date();
      const deletedOn = null;

      const adminDocument = {
        username: username,
        password: hashedPassword,
        role: "admin",
        created_on: createdOn,
        deleted_on: deletedOn,
      };

      const addedAdminId = await AdminDAO.addAdminToDB(adminDocument);
      let admin = await AdminDAO.getAdminByIDFromDB(addedAdminId);
      admin.image = "https://dk9gc53q2aga2.cloudfront.net/assets/hero-icon.png";
      const filteredAdmins = PatternUtil.filterParametersFromObject(admin, [
        "_id",
        "password",
        "role",
      ]);

      return { admin: filteredAdmins };
    } catch (e) {
      return e.message;
    }
  }

  static async signInAdmin(username, password) {
    try {
      const existingAdmin = await AdminDAO.getAdminByUsernameFromDB(username);
      if (!existingAdmin) {
        return "Either your username or password is incorrect";
      }
      const passwordCheck = await AuthUtil.comparePasswords(
        password,
        existingAdmin.password
      );
      if (!passwordCheck) {
        return "Either your email or password is incorrect";
      }

      const signedInOn = new Date();
      const tokenPayload = {
        _id: existingAdmin._id.toString(),
        username: existingAdmin.username,
        role: existingAdmin.role,
        signedInOn: signedInOn,
      };

      const tokenString = await TokenService.createUserToken(tokenPayload);
      let admin = await AdminDAO.getAdminByIDFromDB(existingAdmin._id);
      admin.image = "https://dk9gc53q2aga2.cloudfront.net/assets/hero-icon.png";
      const filteredAdmins = PatternUtil.filterParametersFromObject(admin, [
        "_id",
        "password",
        "role",
      ]);

      return {
        token: tokenString,
        signed_in_on: signedInOn,
        admin: filteredAdmins,
      };
    } catch (e) {
      return e.message;
    }
  }

  static async signOutAdmin(token) {
    try {
      const cleanedToken = TokenUtil.cleanToken(token);
      const deleteToken = await TokenService.deleteUserToken(cleanedToken);

      return deleteToken;
    } catch (e) {
      return e.message;
    }
  }

  static async getAdminByID(adminId) {
    try {
      const existingAdmin = await AdminDAO.getAdminByIDFromDB(adminId);
      if (!existingAdmin) {
        return "No admin found for this ID";
      } else {
        return existingAdmin;
      }
    } catch (e) {
      return e.message;
    }
  }

  static async getAdminAccountDetails(adminId) {
    try {
      const existingAdmin = await AdminDAO.getAdminByIDFromDB(adminId);
      if (!existingAdmin) {
        return "No admin found for this ID";
      } else {
        const filteredAdmins = PatternUtil.filterParametersFromObject(
          existingAdmin,
          ["_id", "password", "role"]
        );

        return { admin: filteredAdmins };
      }
    } catch (e) {
      return e.message;
    }
  }

  static async updateAdminAccountPassword(adminId, oldPassword, newPassword) {
    try {
      const existingAdmin = await AdminDAO.getAdminByIDFromDB(adminId);
      if (!existingAdmin) {
        return "No admin found for this ID";
      }

      const passwordCheck = await AuthUtil.comparePasswords(
        oldPassword,
        existingAdmin.password
      );

      if (!passwordCheck) {
        return "Incorrect password entered";
      }

      const newPasswordCheck = PatternUtil.checkPasswordLength(newPassword);
      if (!newPasswordCheck) {
        return "Password's length should be greater than 8 characters";
      }
      const hashedPassword = await AuthUtil.hashPassword(newPassword);
      const updateResult = await AdminDAO.updateAdminPasswordInDB(
        existingAdmin.username,
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

  static async updateAdminAccountDetails(adminId, firstName, lastName) {
    try {
      const existingAdmin = await AdminDAO.getAdminByIDFromDB(adminId);
      if (!existingAdmin) {
        return "No admin found for this ID";
      }

      if (firstName) {
        const firstNameCheck = PatternUtil.checkAlphabeticName(firstName);
        if (!firstNameCheck) {
          return "Name can not contain numbers and special characters";
        } else {
          existingAdmin.firstname = firstName;
        }
      }

      if (lastName) {
        const lastNameCheck = PatternUtil.checkAlphabeticName(lastName);
        if (!lastNameCheck) {
          return "Name can not contain numbers and special characters";
        } else {
          existingAdmin.lastname = lastName;
        }
      }

      const updateResult = await AdminDAO.updateAdminAccountInDB(existingAdmin);

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
