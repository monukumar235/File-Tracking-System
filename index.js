import express from "express"
import dotenv from "dotenv";
import { connectToDb } from "./config/db.js";
import authRoute from "./routes/auth.js";
import userRoute from "./routes/UserRoute.js";
import fileRoute from "./routes/FileRoute.js";
import workFlowRoute from "./routes/WorkFlowRoute.js";
const app = express();

dotenv.config();
app.use(express.json());
app.use("/uploads",express.static("uploads"))

const port = process.env.PORT;

connectToDb();


app.use("/api/auth",authRoute);
app.use("/api/user",userRoute);
app.use("/api/file",fileRoute);
app.use("/api/workFlow",workFlowRoute);

app.listen(port,()=>{
    console.log(`Server is Running at port ${port}`);
})