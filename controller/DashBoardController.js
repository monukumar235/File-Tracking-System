import File from "../models/File.js";


export const getDashBoard = async (req , res)=>{
    try {
        const userId =  req.userId;
        const role = req.roles;
        
        let dashBoard = {};
      
        if(role === "ADMIN"){
            dashBoard.totalFile = await File.countDocuments();

            dashBoard.draft = await File.countDocuments({
                status : "DRAFT"
            });

            dashBoard.submitted = await File.countDocuments({
                status : "SUBMITTED"
            });

            dashBoard.inProgress = await File.countDocuments({
                status : "IN_PROGRESS"
            });

            dashBoard.approved = await File.countDocuments({
                status : "APPROVED"
            });

            dashBoard.rejected = await File.countDocuments({
                status : "REJECTED"
            });
        }
        else{
            dashBoard.myInbox = await File.countDocuments({
                currentOwner : userId,
                closedDate : null
            });

            dashBoard.myCreatedFile = await File.countDocuments({
                createdBy : userId
            });

            dashBoard.draft = await File.countDocuments({
                createdBy : userId,
                status : "DRAFT"
            });

            dashBoard.pending = await File.countDocuments({
                createdBy : userId,
                status : {
                    $in :["SUBMITTED","IN_PROGRESS"]
                }
            });

            dashBoard.approved = await File.countDocuments({
                createdBy : userId,
                status : "APPROVED"
            });
            dashBoard.rejected = await File.countDocuments({
                createdBy : userId,
                status : "REJECTED"
            })
        }
        return res.status(200).json({
            success : true,
            data : dashBoard
        });
    } catch (error) {
        return res.status(500).json({
            success : false,
            message : "Internal server error",
            error : error.message
        });
    }
}

export const getInbox = async (req,res)=>{
    try {
        const userId = req.userId;
        const files = await File.find({
            currentOwner : userId,
            status :{
                $in : ["SUBMITTED","IN_PROGRESS"]
            }
        }).populate("createdBy","name").sort({updatedAt : -1});

       if(files.length === 0){
          return res.status(404).json({
            success : false,
            message : "No file found."
          });
        }

        return res.status(200).json({
            success : true,
            count : files.length,
            data : files
        });
    } catch (error) {
        return res.status(500).json({
            success : false,
            message : "Internal server error",
            error : error.message
        });
    }
}

export const getOutbox = async (req,res)=>{
    try {
        const userId = req.userId;

        const files = await File.find({
            createdBy : userId,
            status : {
                $ne : "DRAFT"
            }
        }).populate("currentOwner","name role").sort({createdAt : -1});

        if(files.length === 0){
          return res.status(404).json({
            success : false,
            message : "No file found."
          });
        }

        return res.status(200).json({
            success : true,
            count : files.length,
            data : files
        })
    } catch (error) {
        return res.status(200).json({
            success : false,
            message : "Internal server error",
            error : error.message
        });
    }
}

export const getDraft = async (req,res)=>{
    try {
        const userId = req.userId;

        const files = await File.find({
            createdBy : userId,
            status : "DRAFT"
        }).populate("createdBy","name role").populate("currentOwner","name role");

        if(files.length === 0){
          return res.status(404).json({
            success : false,
            message : "No file found."
          });
        }

        return res.status(200).json({
            success : true,
            count : files.length,
            data : files
        });
    } catch (error) {
        return res.status(500).json({
            success : false,
            message : "Internal server error",
            error : error.message
        });
    }
}