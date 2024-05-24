import express from "express";
import AdminController from "../controllers/admin_controller.mjs";
import checkRequiredFieldsMiddleware from "../middleware/check_required_fields_middleware.mjs";
import checkTokenMiddleware from "../middleware/check_token_middleware.mjs";

const router = express.Router();

const adminRoute = "/admin/auth";
//api routes
router
  .route(adminRoute + "/create")
  .post(
    checkRequiredFieldsMiddleware([
      "firstname",
      "lastname",
      "email",
      "password",
    ]),
    AdminController.apiCreateAdminAccount
  );

router
  .route(adminRoute + "/sign-in")
  .post(
    checkRequiredFieldsMiddleware([
      "email",
      "password",
    ]),
    AdminController.apiSignInAdminAccount
  );

router
  .route(adminRoute + "/update/password")
  .post(
    checkRequiredFieldsMiddleware(["old_password", "new_password"]),
    checkTokenMiddleware,
    AdminController.apiUpdateAccountPassword
  );

router
  .route(adminRoute + "/update")
  .post(checkTokenMiddleware, AdminController.apiUpdateAccountDetails);

router
  .route(adminRoute + "/sign-out")
  .delete(checkTokenMiddleware, AdminController.apiSignOutAdminAccount);

router
  .route(adminRoute + "/details")
  .get(checkTokenMiddleware, AdminController.apiGetAdminAccountDetails);

export default router;
