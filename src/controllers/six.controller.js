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

const cloud = require("../helpers/cloud.helper.js");

const statusCode = require("../constants/statusCode.constant.js");
const statusMessage = require("../constants/statusMessage.constant.js");

const search = async (req, res) => {
    const { token, user_id, keyword, index, count } = req.query;
    const { _id } = req.jwtDecoded.data;
    // check params
    try {
        if (!index || !count || !user_id|| !keyword) {
            throw Error("params");
        }
        // mo ta
        // 
        // Ưu tiên đứng đầu danh sách là các kết quả có chứa đủ các từ và đúng thứ tự
        // var postData1 = Post.find({ described: keyword}, (err, docs)=>{
        //     if (err) throw err;
        // });
        //Tiếp theo là các kết quả đủ từ nhưng không đúng thứ tự
        // var postData1 = Post.find({ described: keyword}, (err, docs)=>{
        //     if (err) throw err;
        // }); 

        var postData = await Post.find({}, (err, docs) => {
            if (err) throw err;
        }).limit(count).sort({ created: 1 });
        if (!postData) {
            throw Error("nodata");
        }
    } catch (error) {
        if (error.message == "params") {
            return res.status(200).json({
                code: statusCode.PARAMETER_VALUE_IS_INVALID,
                message: statusMessage.PARAMETER_VALUE_IS_INVALID
            })
        } else if (error.message == "nodata") {
            return res.status(200).json({
                code: statusCode.NO_DATA_OR_END_OF_LIST_DATA,
                message: statusMessage.NO_DATA_OR_END_OF_LIST_DATA
            })
        } else {
            return res.status(200).json({
                code: statusCode.UNKNOWN_ERROR,
                message: statusMessage.UNKNOWN_ERROR
            })
        }
    }
}

const getSavedSearch = async (req, res) => {
    const { token, user_id, keyword, index, count } = req.query;
    const { _id } = req.jwtDecoded.data;
    // check params
    try {
        if (!index || !count || !user_id|| !keyword) {
            throw Error("params");
        }
        // mo ta
        // 
        // Ưu tiên đứng đầu danh sách là các kết quả có chứa đủ các từ và đúng thứ tự
        // var postData1 = Post.find({ described: keyword}, (err, docs)=>{
        //     if (err) throw err;
        // });
        //Tiếp theo là các kết quả đủ từ nhưng không đúng thứ tự
        // var postData1 = Post.find({ described: keyword}, (err, docs)=>{
        //     if (err) throw err;
        // }); 

        var postData = await Post.find({}, (err, docs) => {
            if (err) throw err;
        }).limit(count).sort({ created: 1 });
        if (!postData) {
            throw Error("nodata");
        }
    } catch (error) {
        if (error.message == "params") {
            return res.status(200).json({
                code: statusCode.PARAMETER_VALUE_IS_INVALID,
                message: statusMessage.PARAMETER_VALUE_IS_INVALID
            })
        } else if (error.message == "nodata") {
            return res.status(200).json({
                code: statusCode.NO_DATA_OR_END_OF_LIST_DATA,
                message: statusMessage.NO_DATA_OR_END_OF_LIST_DATA
            })
        } else {
            return res.status(200).json({
                code: statusCode.UNKNOWN_ERROR,
                message: statusMessage.UNKNOWN_ERROR
            })
        }
    }
}
const delSavedSearch = async (req, res) => {
    const { token, user_id, keyword, index, count } = req.query;
    const { _id } = req.jwtDecoded.data;
    // check params
    try {
        if (!index || !count || !user_id|| !keyword) {
            throw Error("params");
        }
        // mo ta
        // 
        // Ưu tiên đứng đầu danh sách là các kết quả có chứa đủ các từ và đúng thứ tự
        // var postData1 = Post.find({ described: keyword}, (err, docs)=>{
        //     if (err) throw err;
        // });
        //Tiếp theo là các kết quả đủ từ nhưng không đúng thứ tự
        // var postData1 = Post.find({ described: keyword}, (err, docs)=>{
        //     if (err) throw err;
        // }); 

        var postData = await Post.find({}, (err, docs) => {
            if (err) throw err;
        }).limit(count).sort({ created: 1 });
        if (!postData) {
            throw Error("nodata");
        }
    } catch (error) {
        if (error.message == "params") {
            return res.status(200).json({
                code: statusCode.PARAMETER_VALUE_IS_INVALID,
                message: statusMessage.PARAMETER_VALUE_IS_INVALID
            })
        } else if (error.message == "nodata") {
            return res.status(200).json({
                code: statusCode.NO_DATA_OR_END_OF_LIST_DATA,
                message: statusMessage.NO_DATA_OR_END_OF_LIST_DATA
            })
        } else {
            return res.status(200).json({
                code: statusCode.UNKNOWN_ERROR,
                message: statusMessage.UNKNOWN_ERROR
            })
        }
    }
}


module.exports = {
    search,
    getSavedSearch,
    delSavedSearch
};
