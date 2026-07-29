import File from "../models/File.js";


export const getAllFilesData = async (userId, role) => {

    let filter = {};

    if (role === "ADMIN") {
        filter = {}
    }
    else if (role === "EXECUTIVE_1" || role === "EXECUTIVE_2") {
        filter = {
            createdBy: userId
        }
    }
    else {
        filter = {
            currentOwner: userId
        }
    }
    const file = await File.find(filter).populate("createdBy", "name role").populate("currentOwner", "name role").sort({ createdAt: -1 });

    return file
}