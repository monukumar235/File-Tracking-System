import multer from "multer";

const stogare = multer.memoryStorage();

const upload = multer({
    storage : stogare,
    limits:{
        fileSize : 10*1024*1024
    }
});

export default upload;