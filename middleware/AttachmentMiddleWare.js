import multer from "multer";
import path from "path";

const stogare = multer.diskStorage({

    destination : function(req,file,cb){

        cb(null,"./uploads")
    } ,

    filename : function(req,file,cb){

        const fileName = Date.now() + "-" + file.originalname;

        cb(null,fileName);
    }
});

const fileFilter = (req,file,cb)=>{

    const allowedFiles = [
        "application/pdf",
        "image/png",
        "image/jpeg"
    ];

    if(allowedFiles.includes(file.mimetype)){
        cb(null,true);
    }else{
        cb(new Error("Only PDF,PNG and JPEG files are allowed"));
    }
}

export default multer({
    stogare,
    fileFilter
});