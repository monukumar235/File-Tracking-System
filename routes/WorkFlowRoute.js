import express  from "express";
import WorkFlowModel from "../models/WorkFlowModel.js";
import { authenticate } from "../middleware/authorization.js";
import { forwardFile ,returnFile,approveFile,rejectFile} from "../controller/WorkFlowController.js";
const workFlowRoute = express.Router();


workFlowRoute.post("/forward",authenticate,forwardFile);
workFlowRoute.post("/return",authenticate,returnFile);
workFlowRoute.post("/approve",authenticate,approveFile);
workFlowRoute.post("/reject",authenticate,rejectFile);

export default workFlowRoute;
