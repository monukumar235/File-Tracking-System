import express from "express"
import dotenv from "dotenv";
import { connectToDb } from "./config/db.js";
import authRoute from "./routes/auth.js";
import userRoute from "./routes/UserRoute.js";
import fileRoute from "./routes/FileRoute.js";

const app = express();

dotenv.config();
app.use(express.json());

const port = process.env.PORT;

connectToDb();


app.use("/api/route",authRoute);
app.use("/api",userRoute);
app.use("/api",fileRoute);

app.listen(port,()=>{
    console.log(`Server is Running at port ${port}`);
})