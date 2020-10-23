import dotenv from "dotenv";
dotenv.config();
import md5 from "md5";
import fs from "fs";
import formidable from "formidable";

import User from "../models/user.model.js";
import jwtHelper from "../helpers/jwt.helper.js";
import  saveFile  from "../helpers/saveFile.helper.js";
import * as statusCode from "./../constants/statusCode.constant.js";
import * as statusMessage from "./../constants/statusMessage.constant.js";
// import { isError } from "util";

const tokenList = {};

const accessTokenLife = process.env.ACCESS_TOKEN_LIFE || "1h";
const accessTokenSecret =
  process.env.ACCESS_TOKEN_SECRET || "accessTokenSecret";

const refreshTokenLife = process.env.REFRESH_TOKEN_LIFE || "3650d";
const refreshTokenSecret =
  process.env.REFRESH_TOKEN_SECRET || "refreshTokenSecret";

const signup = async (req, res) => {
  const { phonenumber, password, uuid } = req.body;

  if (
    !phonenumber ||
    phonenumber.length != 10 ||
    phonenumber[0] != "0" ||
    phonenumber.match(/[^0-9]/g)
  ) {
    return res.status(200).json({
      code: statusCode.PARAMETER_VALUE_IS_INVALID,
      message: statusMessage.PARAMETER_VALUE_IS_INVALID,
    });
  } else if (
    !password ||
    password.length < 6 ||
    password.length > 10 ||
    password === phonenumber ||
    password.match(/[^a-z|A-Z|0-9]/g)
  ) {
    return res.status(200).json({
      code: statusCode.PARAMETER_VALUE_IS_INVALID,
      message: statusMessage.PARAMETER_VALUE_IS_INVALID,
    });
  } else if (!uuid) {
    return res.status(200).json({
      code: statusCode.PARAMETER_VALUE_IS_INVALID,
      message: statusMessage.PARAMETER_VALUE_IS_INVALID,
    });
  } else {
    const userData = await User.findOne({ phonenumber: phonenumber });
    if (!userData) {
      //chua co
      const hashedPassword = md5(password);
      const user = await new User({
        phonenumber: phonenumber,
        password: hashedPassword,
      }).save();
      return res.status(200).json({
        code: statusCode.OK,
        message: statusMessage.OK,
        user,
      });
    } else {
      return res.status(200).json({
        code: statusCode.USER_EXISTED,
        message: statusMessage.USER_EXISTED,
      });
    }
  }
};

const login = async (req, res) => {
  try {
    const { phonenumber, password } = req.body;
    if (
      !phonenumber ||
      phonenumber.length != 10 ||
      phonenumber[0] != "0" ||
      phonenumber.match(/[^0-9]/g)
    ) {
      return res.status(200).json({
        code: statusCode.PARAMETER_VALUE_IS_INVALID,
        message: statusMessage.PARAMETER_VALUE_IS_INVALID,
      });
    } else if (
      !password ||
      password.length < 6 ||
      password.length > 10 ||
      password === phonenumber ||
      password.match(/[^a-z|A-Z|0-9]/g)
    ) {
      return res.status(200).json({
        code: statusCode.PARAMETER_VALUE_IS_INVALID,
        message: statusMessage.PARAMETER_VALUE_IS_INVALID,
      });
    } else {
      const userData = await User.findOne({
        phonenumber: req.body.phonenumber,
      });
      if (userData) {
        const hashedPassword = md5(req.body.password);
        if (hashedPassword == userData.password) {
          const accessToken = await jwtHelper.generateToken(
            userData,
            accessTokenSecret,
            accessTokenLife
          );
          const refreshToken = await jwtHelper.generateToken(
            userData,
            refreshTokenSecret,
            refreshTokenLife
          );
          await User.findOneAndUpdate(
            { _id: userData._id },
            {
              $set: {
                token: accessToken,
              },
            }
          );
          // console.log(tokenList)
          return res.status(200).json({
            code: statusCode.OK,
            message: statusMessage.OK,
            data: {
              id: userData._id,
              username: userData.username,
              token: accessToken,
              refreshToken: refreshToken,
              avatar: userData.avatar,
            },
          });
        } else {
          res.status(200).json({
            code: statusCode.USER_IS_NOT_VALIDATED,
            message: statusMessage.USER_IS_NOT_VALIDATED,
          });
        }
      } else {
        res.status(200).json({
          code: statusCode.USER_IS_NOT_VALIDATED,
          message: statusMessage.USER_IS_NOT_VALIDATED,
        });
      }
    }
  } catch (error) {
    return res.status(500).json(error);
  }
};

const refreshToken = async (req, res) => {
  const refreshTokenFromClient = req.body.refreshToken;
  if (refreshTokenFromClient && tokenList[refreshTokenFromClient]) {
    try {
      const decoded = await jwtHelper.verifyToken(
        refreshTokenFromClient,
        refreshTokenSecret
      );

      const userData = decoded.data;

      const accessToken = await jwtHelper.generateToken(
        userData,
        accessTokenSecret,
        accessTokenLife
      );

      return res.status(200).json({ accessToken });
    } catch (error) {
      res.status(403).json({
        message: "Invalid refresh token.",
      });
    }
  } else {
    return res.status(403).json({
      message: "No token provided.",
    });
  }
};

const getVerifyCode = async (req, res) => {
  const { phonenumber } = req.body;
  if (
    !phonenumber ||
    phonenumber.length != 10 ||
    phonenumber[0] != "0" ||
    phonenumber.match(/[^0-9]/g)
  ) {
    return res.status(200).json({
      code: statusCode.PARAMETER_VALUE_IS_INVALID,
      message: statusMessage.PARAMETER_VALUE_IS_INVALID,
    });
  } else {
    //neu duoi 120s khi da gui request nay thi bao loi 1010 1009

    return res.status(200).json({
      code: statusCode.OK,
      message: statusMessage.OK,
    });
  }
};

const checkVerifyCode = async (req, res) => {
  const { phonenumber, code_verify } = req.body;
  if (
    !phonenumber ||
    phonenumber.length != 10 ||
    phonenumber[0] != "0" ||
    phonenumber.match(/[^0-9]/g)
  ) {
    return res.status(200).json({
      code: statusCode.PARAMETER_VALUE_IS_INVALID,
      message: statusMessage.PARAMETER_VALUE_IS_INVALID,
    });
  } else {
    //neu duoi 120s khi da gui request nay thi bao loi 1010 1009

    return res.status(200).json({
      code: statusCode.OK,
      message: statusMessage.OK,
      data: {
        token: "token",
        id: "id",
      },
    });
  }
};

const changeInfoAfterSignup = async (req, res) => {
  // console.log(req, "jajja")
  const { _id, phonenumber } = req.jwtDecoded.data;
  const { token, username } = req.query;

  const form = new formidable.IncomingForm();
  // console.log(form)
  await form.parse(req, async (err, fields, files) => {
    const oldpath = files.avatar.path;
    const typeFile = files.avatar.name.split(".")[1];
    // console.log(fields)
    const newpath = `upload/${_id}${Date.now()}.${typeFile}`;
    const isErrorSave = saveFile.saveFile(oldpath, newpath);
    if (err) {
      throw err;
    } else {
      const userData = await User.findByIdAndUpdate(_id, {
        $set: {
          username: fields.username,
          avatar: newpath,
        },
      });

      return res.status(200).json({
        code: statusCode.OK,
        message: statusMessage.OK,
        data: {
          id: _id,
          username: fields.username,
          phonenumber: phonenumber,
          created: Date.now(),
          avatar: newpath,
        },
      });
    }
    // fs.rename(oldpath, newpath, (err) => {
    //   if (err) {
    //     throw err;
    //   }

    // });
  });
};

export default {
  login,
  refreshToken,
  signup,
  getVerifyCode,
  checkVerifyCode,
  changeInfoAfterSignup,
};
