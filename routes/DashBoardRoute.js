import express from "express";
import { getDashBoard } from "../controller/DashBoardController.js";
import { authenticate } from "../middleware/authorization.js";

const dashBoardRoute = express.Router();

dashBoardRoute.get("/",authenticate,getDashBoard)

export default dashBoardRoute;