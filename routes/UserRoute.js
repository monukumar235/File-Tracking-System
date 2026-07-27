import express from "express"
import { createUsers,getAllUsers,getUserById,updateUser,deteleUser} from "../controller/UsersController.js";
import { authenticate } from "../middleware/authorization.js";
import { RoleBasedAuthorization } from "../middleware/roleBasedAuthorization.js";


const userRoute = express.Router();

userRoute.post("/createUser",authenticate,RoleBasedAuthorization("ADMIN"),createUsers);
userRoute.get("/users",authenticate,RoleBasedAuthorization("ADMIN"),getAllUsers);
userRoute.get("/:id",authenticate,RoleBasedAuthorization("ADMIN"),getUserById);
userRoute.put("/:id",authenticate,RoleBasedAuthorization("ADMIN"),updateUser);
userRoute.delete("/:id",authenticate,RoleBasedAuthorization("ADMIN"),deteleUser);

export default userRoute;