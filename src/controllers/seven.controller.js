const dotenv = require("dotenv");
dotenv.config();
const fs = require("fs");
const formidable = require("formidable");
const { getVideoDurationInSeconds } = require('get-video-duration')
const mongoose = require("mongoose");

const Post = require("../models/post.model.js");
const User = require("../models/user.model.js");
const ReportPost = require("../models/report.post.model.js");
const Comment = require("../models/comment.model")

const sameFriendsHelper = require("../helpers/sameFriends.helper.js");

const statusCode = require("../constants/statusCode.constant.js");
const statusMessage = require("../constants/statusMessage.constant.js");

const getRequestedFriends =async (req, res)=>{
    const {token, index, count} = req.query;
    try {
        var userData = await User.findById(_id).populate({
            path: "requestedFriends",
            select: "_id username avatar"
        });
        Promise.all(userData.requestedFriends.map(element=>{
            return sameFriendsHelper.sameFriends(userData.friendIds, element._id);
        })).then(result=>{
            console.log(result);
            userData.requestedFriends.map((value, index)=>{
                return {
                    value,
                    same_friends: result[index]
                }
            })
            return res.status(200).json({
                code: statusCode.OK,
                message: statusMessage.OK,
                data: {
                    request: userData.requestedFriends,
                    total: 0
                }
            })
        }).catch(e=>{
            return res.status(200).json({
                code: statusCode.UNKNOWN_ERROR,
                message: statusMessage.UNKNOWN_ERROR
            })
        })
        
    } catch (error) {
        return res.status(500).json({
            code: statusCode.UNKNOWN_ERROR,
            message: statusMessage.UNKNOWN_ERROR
        })
    }
}

module.exports = {
    getRequestedFriends,
    // getSavedSearch,
    // delSavedSearch
};
