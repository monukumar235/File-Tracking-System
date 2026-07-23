import express from "express"
import { login ,logout,profile} from "../controller/authController.js";
import { authenticate} from "../middleware/authorization.js";
import { RoleBasedAuthorization } from "../middleware/roleBasedAuthorization.js";

const authRoute = express.Router();

authRoute.post("/login",login);
authRoute.post("/logout",logout);
authRoute.get("/profile",authenticate,profile);



export default authRoute;

