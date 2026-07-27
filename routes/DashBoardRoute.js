import express from "express";
import { getDashBoard ,getInbox,getOutbox,getDraft} from "../controller/DashBoardController.js";
import { authenticate } from "../middleware/authorization.js";

const dashBoardRoute = express.Router();

dashBoardRoute.get("/",authenticate,getDashBoard)
dashBoardRoute.get("/inbox",authenticate,getInbox)
dashBoardRoute.get("/outbox",authenticate,getOutbox)
dashBoardRoute.get("/draft",authenticate,getDraft)

export default dashBoardRoute;