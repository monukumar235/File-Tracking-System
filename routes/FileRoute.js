import express from "express";
import { createFile,getAllFiles ,getFileById,updateFile,submit} from "../controller/FileController.js";
import { authenticate } from "../middleware/authorization.js";
import { RoleBasedAuthorization } from "../middleware/roleBasedAuthorization.js";


const fileRoute = express.Router();

fileRoute.post("/createFile",authenticate,RoleBasedAuthorization("EXECUTIVE_2","EXECUTIVE_1"), createFile);
fileRoute.get("/getAllFiles",authenticate, getAllFiles);
fileRoute.get("/getFile/:id",authenticate, getFileById);
fileRoute.put("/getFile/:id",authenticate, updateFile);
fileRoute.post("/getFile/:id/submit",authenticate, submit);

export default fileRoute;