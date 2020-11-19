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

const getConversation = async (req, res) => {
  const { token, partner_id, conversation_id, index, count } = req.query;
  const { _id } = req.jwtDecoded.data;
  try {
    var chatData = await Chat.findById(conversation_id).populate({
      path: "sender",
      select: "username avatar",
      sort: {
        created: -1,
      },
    });
    return res.status(200).json({
      code: statusCode.OK,
      message: statusMessage.OK,
      data: {
        conversation: chatData.conversation.slice(index, count),
        is_blocked: chatData.is_blocked == _id,
      },
    });
  } catch (error) {
    return res.status(500).json({
      code: statusCode.UNKNOWN_ERROR,
      message: statusMessage.UNKNOWN_ERROR,
    });
  }
};

const getListConversation = async (req, res) => {
  const { token, index, count } = req.query;
  const { _id } = req.jwtDecoded.data;
  try {
    var userData = await User.findById(_id).populate({
      path: "conversation",
      select: "partner_id created is_blocked conversation",
      sort: {
        created: -1,
      },
      populate: {
        path: "partner_id",
        select: "username avatar",
      },
    });
    userData.conversation.map((element) => {
      element.conversation = element.conversation[0];
    });
    return res.status(200).json({
      code: statusCode.OK,
      message: statusMessage.OK,
      data: userData.conversation,
      numNewMessage: "so conversation co message chua doc",
    });
  } catch (error) {
    return res.status(500).json({
      code: statusCode.UNKNOWN_ERROR,
      message: statusMessage.UNKNOWN_ERROR,
    });
  }
};

const setReadMessage = async (req, res) => {
  const { token, partner_id, conversation_id, index, count } = req.query;
  const { _id } = req.jwtDecoded.data;
  try {
    var chatData = await Chat.findById(conversation_id).populate({
      path: "sender",
      select: "username avatar",
      sort: {
        created: -1,
      },
    });
    return res.status(200).json({
      code: statusCode.OK,
      message: statusMessage.OK,
      data: {
        conversation: chatData.conversation.slice(index, count),
        is_blocked: chatData.is_blocked == _id,
      },
    });
  } catch (error) {
    return res.status(500).json({
      code: statusCode.UNKNOWN_ERROR,
      message: statusMessage.UNKNOWN_ERROR,
    });
  }
};

const deleteConversation = async (req, res) => {
  const { token, partner_id, conversation_id, index, count } = req.query;
  const { _id } = req.jwtDecoded.data;
  try {
    var chatData = await Chat.findById(conversation_id).populate({
      path: "sender",
      select: "username avatar",
      sort: {
        created: -1,
      },
    });
    return res.status(200).json({
      code: statusCode.OK,
      message: statusMessage.OK,
      data: {
        conversation: chatData.conversation.slice(index, count),
        is_blocked: chatData.is_blocked == _id,
      },
    });
  } catch (error) {
    return res.status(500).json({
      code: statusCode.UNKNOWN_ERROR,
      message: statusMessage.UNKNOWN_ERROR,
    });
  }
};

const deleteMessage = async (req, res) => {
  const { token, partner_id, conversation_id, index, count } = req.query;
  const { _id } = req.jwtDecoded.data;
  try {
    var chatData = await Chat.findById(conversation_id).populate({
      path: "sender",
      select: "username avatar",
      sort: {
        created: -1,
      },
    });
    return res.status(200).json({
      code: statusCode.OK,
      message: statusMessage.OK,
      data: {
        conversation: chatData.conversation.slice(index, count),
        is_blocked: chatData.is_blocked == _id,
      },
    });
  } catch (error) {
    return res.status(500).json({
      code: statusCode.UNKNOWN_ERROR,
      message: statusMessage.UNKNOWN_ERROR,
    });
  }
};

module.exports = {
  getConversation,
  getListConversation,
  setReadMessage,
  deleteMessage,
  deleteConversation,
};
