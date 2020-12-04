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
  const { _id } = req.jwtDecoded.data;
  try {
    var partnerData = await User.findById(partner_id);
    var userData = await User.findById(_id);
    if (
      !partnerData ||
      partnerData.is_blocked ||
      partnerData.blockedIds.includes(_id)||
      userData.blockedIds.includes(partner_id)
    ) {
      throw Error("blocked or not existed");
    }
    
    var chatData = await new Chat({
      partner_id: [partner_id, _id],
      is_blocked: null,
      creacted: Date.now(),
    }).save();
    partnerData.conversations.push(chatData._id);
    await partnerData.save();
    if (_id != partner_id) {
      await User.findByIdAndUpdate(_id, {
        $push: {
          conversations: chatData._id,
        },
      });
    }
    return res.status(200).json({
      code: statusCode.OK,
      message: statusMessage.OK,
      server: userData.username+" want to message to "+partnerData.username,
    });
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
