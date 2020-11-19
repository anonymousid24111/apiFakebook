const dotenv = require("dotenv");
dotenv.config();
const fs = require("fs");
const formidable = require("formidable");
const { getVideoDurationInSeconds } = require("get-video-duration");
const mongoose = require("mongoose");

const Post = require("../models/post.model.js");
const User = require("../models/user.model.js");
const ReportPost = require("../models/report.post.model.js");
const Chat = require("../models/chat.model");

const sameFriendsHelper = require("../helpers/sameFriends.helper.js");

const statusCode = require("../constants/statusCode.constant.js");
const statusMessage = require("../constants/statusMessage.constant.js");

const setConversation = async (req, res) => {
  const { token, partner_id } = req.query;
  const {_id} = req.jwtDecoded.data;
  try {
    var partnerData = await User.findById(partner_id);
    if (!partnerData||partnerData.is_blocked||partnerData.blockedIds.includes(_id)) {
      throw Error("blocked or not existed")
    }
    var chatData = new Chat({
      partner_id: [
        partner_id,
        _id
      ],
      is_blocked: null,
      creacted: Date.now()
    });
    partnerData.conversations.push(chatData._id);
    await partnerData.save();
    var userData = await User.findByIdAndUpdate(_id,{
      $push:{
        conversations: chatData._id,
      }
    })
    return res.status(200).json({
      code: statusCode.OK,
      message: statusMessage.OK,
      data: "Giong get conversation"
    })
  } catch (error) {
    return res.status(500).json({
      code: statusCode.UNKNOWN_ERROR,
      message: statusMessage.UNKNOWN_ERROR,
    });
  }
};




module.exports = {
  setConversation,
};
