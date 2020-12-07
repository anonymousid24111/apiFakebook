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
  const { partner_id, conversation_id, index, count } = req.query;
  const { _id } = req.userDataPass;
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
  const { _id } = req.userDataPass;
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
    var numNewMessage= 0;
    userData.conversation.map((element) => {
      
      element.conversation = element.conversation[0];
      if(element.conversation[0].unread=="1") numNewMessage+=1;
      return element;
    });
    return res.status(200).json({
      code: statusCode.OK,
      message: statusMessage.OK,
      data: userData.conversation,
      numNewMessage: numNewMessage,
    });
  } catch (error) {
    return res.status(500).json({
      code: statusCode.UNKNOWN_ERROR,
      message: statusMessage.UNKNOWN_ERROR,
    });
  }
};

const setReadMessage = async (req, res) => {
  const { partner_id, conversation_id} = req.query;
  const { _id } = req.userDataPass;
  try {
    var userData = req.userDataPass;
    if(!userData||userData.blockedIds.inclules(partner_id)){
      throw Error("nodata")
    }
    var chatData = await Chat.findByIdA(conversation_id).populate({
      path: "partner_id",
      select: "username avatar"
    });
    if(!chatData){
      throw Error("notfound")
    }
    chatData.conversation = chatData.conversation.map(element=>{
      element.unread = "0"
      return element
    })
    return res.status(200).json({
      code: statusCode.OK,
      message: statusMessage.OK,
      data: chatData
    });
  } catch (error) {
    if (error.message=="notfound") {
      return res.status(500).json({
        code: statusCode.POST_IS_NOT_EXISTED,
        message: statusMessage.POST_IS_NOT_EXISTED,
      });
    } else if (error.message=="nodata") {
      return res.status(500).json({
        code: statusCode.NO_DATA_OR_END_OF_LIST_DATA,
        message: statusMessage.NO_DATA_OR_END_OF_LIST_DATA,
      });
    } else {
      return res.status(500).json({
        code: statusCode.UNKNOWN_ERROR,
        message: statusMessage.UNKNOWN_ERROR,
      });
    }
    
  }
};

const deleteConversation = async (req, res) => {
  const { token, partner_id, conversation_id, message_id } = req.query;
  const { _id } = req.userDataPass;
  try {
    var chatData = await Chat.findByIdAndUpdate(conversation_id, {
      $pull:{
        partner_id: _id
      }
    });
    if (!chatData) {
      throw Error("nodata");
    }
    return res.status(200).json({
      code: statusCode.OK,
      message: statusMessage.OK,
    });
  } catch (error) {
    if (error.message=="nodata") {
      return res.status(500).json({
        code: statusCode.NO_DATA_OR_END_OF_LIST_DATA,
        message: statusMessage.NO_DATA_OR_END_OF_LIST_DATA,
      });
    } else {
      return res.status(500).json({
        code: statusCode.UNKNOWN_ERROR,
        message: statusMessage.UNKNOWN_ERROR,
      });
    }
    
  }
};

const deleteMessage = async (req, res) => {
  const { token, partner_id, conversation_id, message_id } = req.query;
  const { _id } = req.userDataPass;
  try {
    var chatData = await Chat.findByIdAndUpdate(conversation_id, {
      $pull:{
        conversation: message_id
      }
    });
    if (!chatData) {
      throw Error("nodata");
    }
    return res.status(200).json({
      code: statusCode.OK,
      message: statusMessage.OK,
      data: {
        conversation: chatData.conversation.slice(index, count),
        is_blocked: chatData.is_blocked == _id,
      },
    });
  } catch (error) {
    if (error.message=="nodata") {
      return res.status(500).json({
        code: statusCode.NO_DATA_OR_END_OF_LIST_DATA,
        message: statusMessage.NO_DATA_OR_END_OF_LIST_DATA,
      });
    } else {
      return res.status(500).json({
        code: statusCode.UNKNOWN_ERROR,
        message: statusMessage.UNKNOWN_ERROR,
      });
    }
    
  }
};

module.exports = {
  getConversation,
  getListConversation,
  setReadMessage,
  deleteMessage,
  deleteConversation,
};
