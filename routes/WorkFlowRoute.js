import express  from "express";
import WorkFlowModel from "../models/WorkFlowModel.js";
import { authenticate } from "../middleware/authorization.js";
import { forwardFile ,returnFile,approveFile,rejectFile,remarksHistory} from "../controller/WorkFlowController.js";

const workFlowRoute = express.Router();


workFlowRoute.post("/forward",authenticate,forwardFile);
workFlowRoute.post("/return",authenticate,returnFile);
workFlowRoute.post("/approve",authenticate,approveFile);
workFlowRoute.post("/reject",authenticate,rejectFile);
workFlowRoute.get("/history/:fileId",authenticate,remarksHistory);

export default workFlowRoute;
