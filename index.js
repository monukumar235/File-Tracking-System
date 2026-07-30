import express from "express"
import dotenv from "dotenv";
import { connectToDb } from "./config/db.js";
import authRoute from "./routes/auth.js";
import userRoute from "./routes/UserRoute.js";
import fileRoute from "./routes/FileRoute.js";
import workFlowRoute from "./routes/WorkFlowRoute.js";
import auditRoutes from "./routes/AuditRoutes.js";
import dashBoardRoute from "./routes/DashBoardRoute.js";

import path from "path";
import { fileURLToPath } from "url";
import { login,logout } from "./controller/authController.js";
import { getDashBoard } from "./controller/DashBoardController.js";
import File from "./models/File.js";
import { authenticate } from "./middleware/authorization.js";
import cookieParser from "cookie-parser";
import { getDashBoardData } from "./services/dashboardServices.js";
import { getAllUsersData } from "./services/userService.js";
import { getAllFilesData } from "./services/fileServices.js";
import { RoleBasedAuthorization } from "./middleware/roleBasedAuthorization.js";
import { createUsers, updateUser,deteleUser } from "./controller/UsersController.js";
import User from "./models/User.js";
import { createFile, submit, updateFile, uploadAttachment } from "./controller/FileController.js";
import upload from "./middleware/AttachmentMiddleWare.js";
import { approveFile, forwardFile, rejectFile, returnFile } from "./controller/WorkFlowController.js";
import AuditLogsModel from "./models/AuditLogsModel.js";
import WorkFlowModel from "./models/WorkFlowModel.js";



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set("view engine","pug");
app.set("views",path.join(__dirname,"views"));
app.use(express.static(path.join(__dirname,"public")));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(express.json());
app.use("/uploads",express.static("uploads"))

dotenv.config();
const port = process.env.PORT;

connectToDb();


app.use("/api/auth",authRoute);
app.use("/api/user",userRoute);
app.use("/api/file",fileRoute);
app.use("/api/workFlow",workFlowRoute);
app.use("/api/audit",auditRoutes);
app.use("/api/dashboard",dashBoardRoute);

app.get("/test", (req, res) => {
    res.render("layout/layout");
});

app.get("/login", (req, res) => {
    res.render("auth/login");
});
app.post("/login",login);

app.get("/logout", logout);


app.get("/dashboard",authenticate,async (req, res) => {

    const dashboard = await getDashBoardData(req.userId,req.roles);

    const recentFiles = await File.find().select("fileNumber subject status").sort({createdAt : -1}).limit(5);

    res.render("dashboard/dashboard",{
        dashboard,
        recentFiles
    });
});

app.get("/users", authenticate,RoleBasedAuthorization("ADMIN"),async(req, res) => {

    const users = await getAllUsersData();
    res.render("users/index", {
        users
    });

});


app.get("/users/create", authenticate, (req, res) => {
    res.render("users/create");
});

app.post("/users/create", authenticate, RoleBasedAuthorization("ADMIN") ,createUsers);


app.get("/users/edit/:id",authenticate,RoleBasedAuthorization("ADMIN"),async(req,res)=>{
    const user = await User.findById(req.params.id);

    res.render("users/edit",{
        user
    });
});

app.post("/users/edit/:id",authenticate,RoleBasedAuthorization("ADMIN"),updateUser);

app.post("/users/delete/:id", authenticate,RoleBasedAuthorization("ADMIN"),deteleUser);

app.get("/files",authenticate, async(req, res) => {
    
    const files = await getAllFilesData(req.userId,req.roles);
    res.render("files/index", { files });
});

app.get("/files/create",authenticate,(req,res)=>{
    res.render("files/create")
});

app.post("/files/create",authenticate,RoleBasedAuthorization("EXECUTIVE_2","EXECUTIVE_1"),createFile);

app.get("/files/view/:id",authenticate,async(req,res)=>{
    const file = await File.findById(req.params.id).populate("createdBy","name role").populate("currentOwner","name role");

    res.render("files/views",{
        file
    });
});

app.get("/files/edit/:id",authenticate,async(req,res)=>{
    const file = await File.findById(req.params.id);
    res.render("files/edit",{
        file
    });
});

app.post("/files/edit/:id",authenticate,updateFile);

app.post("/files/submit/:id",authenticate,submit);

app.get("/files/upload/:id",authenticate,async(req,res)=>{
    const file = await File.findById(req.params.id);
    res.render("files/attachment",{
        file
    });
});

app.post("/files/upload/:id",authenticate,upload.single("attachment"),uploadAttachment);


app.get("/workflow/inbox",authenticate, async(req, res) => {

    const files = await File.find({
        currentOwner : req.userId,
        status :{
            $in :["SUBMITTED","IN_PROGRESS"]
        }
    }).populate("createdBy","name").sort({updatedAt :-1});
    res.render("workflow/inbox", {
        files,
        role : req.roles
    });
});

app.get("/workflow/view/:id",authenticate,async(req,res)=>{

    const file = await File.findById(req.params.id).populate("createdBy","name role").populate("currentOwner","name role");

    res.render("workflow/views",{
        file,
        role : req.roles
    });
});

app.post("/workflow/forward",authenticate,forwardFile);
app.post("/workflow/sendBack",authenticate,returnFile);
app.post("/workflow/approve",authenticate,approveFile);
app.post("/workflow/reject",authenticate,rejectFile);




app.get("/workflow/outbox",authenticate, async(req, res) => {

    const files = await File.find({
        createdBy : req.userId,
        status : {
            $ne : "DRAFT"
        }
    }).populate("currentOwner","name role").sort({createdAt : -1});

    res.render("workflow/outbox", { files });

});


app.get("/audit/file/:id", authenticate,async(req, res) => {

    const file = await File.findById(req.params.id).select("fileNumber subject");

    const logs = await AuditLogsModel.find({
        fileId : req.params.id
    }).populate("userId","name role").sort({createdAt :-1});

    
    res.render("audit/index", { logs ,file});

});

app.listen(port,()=>{
    console.log(`Server is Running at port ${port}`);
})