import dotenv from "dotenv";
dotenv.config();
import fs from "fs";
import saveFile from "../helpers/saveFile.helper.mjs"
import formidable from "formidable";

import Post from "../models/post.model.mjs";
import * as statusCode from "./../constants/statusCode.constant.mjs";
import * as statusMessage from "./../constants/statusMessage.constant.mjs";
import User from "../models/user.model.mjs";
// import { ifError } from "assert";

const addPost = async (req, res) => {
  const { token, image, video, described, status } = req.body;
  const { _id, phonenumber } = req.jwtDecoded.data;
  const form = new formidable.IncomingForm();
  form.parse(req, (err, fields, files) => {
    //save posts of users
    var oldpath = "";
    var newpath = "";
    var typeFile = "";
    var imageList = [];
    for (const key in files) {
      if (files.hasOwnProperty(key)) {
        const file = files[key];
        oldpath = file.path;
        typeFile = file.name.split(".")[1];
        newpath = `upload/post/${_id}${Date.now()}.${typeFile}`;
        saveFile.saveFile(oldpath, newpath);
        imageList.push(newpath);
        // fs.rename(oldpath, newpath, (err) => {
        //   if (err) {
        //     throw err;
        //   }
        //   imageList.push(newpath);
        // });
        
      }
    }
    new Post({
      described: described,
      status: status,
      images: imageList,
      // something else
    }).save()
    //save data what user send
  });
  return res.status(200).json({
    code: statusCode.OK,
    message: statusMessage.OK,
    data: {
      id: "id",
      described: "described",
      created: "created",
      modified: "modified",
      like: "like",
      comment: "comment",
      is_liked: "is_liked",
    },
  });
};
const getPost = async (req, res) => {
  const { token, id } = req.body;
  return res.status(200).json({
    code: statusCode.OK,
    message: statusMessage.OK,
    data: {
      id: "id",
    },
  });
};

export default {
  addPost,
};
