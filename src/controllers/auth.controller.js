const dotenv = require( "dotenv");
dotenv.config();
const md5 = require( "md5");


const User = require( "../models/user.model.js");
const jwtHelper = require( "../helpers/jwt.helper.js");
const statusCode = require( "./../constants/statusCode.constant.js");
const statusMessage = require( "./../constants/statusMessage.constant.js");
// const { isError } = require( "util");

const tokenList = {};

const accessTokenLife = process.env.ACCESS_TOKEN_LIFE || "1h";
const accessTokenSecret =
  process.env.ACCESS_TOKEN_SECRET || "accessTokenSecret";

const refreshTokenLife = process.env.REFRESH_TOKEN_LIFE || "3650d";
const refreshTokenSecret =
  process.env.REFRESH_TOKEN_SECRET || "refreshTokenSecret";

const signup = async (req, res) => {
  // const { phonenumber, password, uuid } = req.body;
  const { phonenumber, password, uuid } = req.query;
  // phonenumber không tồn tại, độ dài khác 10, không có số không đầu tiên,
  // chứa kí tự không phải số
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
    // password không tồn tại, độ dài nhỏ hơn sáu hoặc lớn hơn 10, password giống phonenumber
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
    // uuid không tồn tại
    return res.status(200).json({
      code: statusCode.PARAMETER_VALUE_IS_INVALID,
      message: statusMessage.PARAMETER_VALUE_IS_INVALID,
    });
  } else {
    const userData = await User.findOne({ phonenumber: phonenumber });
    if (!userData) {
      //chưa có phonenumber đã được đăng kí
      const hashedPassword = md5(password);
      const user = await new User({
        phonenumber: phonenumber,
        password: hashedPassword,
        active: -1,
      }).save();
      return res.status(200).json({
        code: statusCode.OK,
        message: statusMessage.OK,
        user,
      });
    } else {
      // phonenumber đã được đăng kí từ trước
      return res.status(200).json({
        code: statusCode.USER_EXISTED,
        message: statusMessage.USER_EXISTED,
      });
    }
  }
};

const login = async (req, res) => {
    // const { phonenumber, password } = req.body; 
    const { phonenumber, password } = req.query;// gửi bằng query params
    if (
      !phonenumber ||
      phonenumber.length != 10 ||
      phonenumber[0] != "0" ||
      phonenumber.match(/[^0-9]/g)
    ) {
      // phonenumber không tồn tại, độ dài khác 10, không có số không đầu tiên,
      // chứa kí tự không phải số
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
      // password không tồn tại, độ dài nhỏ hơn sáu hoặc lớn hơn 10, password giống phonenumber
      // chứa các kí tự khác chữ thường, chữ in hoa, chữ số(Latin)
      return res.status(200).json({
        code: statusCode.PARAMETER_VALUE_IS_INVALID,
        message: statusMessage.PARAMETER_VALUE_IS_INVALID,
      });
    } else {// nhập đúng định dạng phonenumber và password
      // tìm dữ liệu user qua phonenumber
      const userData = await User.findOne({
        phonenumber: req.body.phonenumber,
      });
      if (userData) {
        // tìm được user có trong hệ thống
        const hashedPassword = md5(req.body.password);// mã hoá password
        if (hashedPassword == userData.password) {
          // kiểm tra password
          // tạo token
          const accessToken = await jwtHelper.generateToken(
            userData,
            accessTokenSecret,
            accessTokenLife
          );
          // const refreshToken = await jwtHelper.generateToken(
          //   userData,
          //   refreshTokenSecret,
          //   refreshTokenLife
          // );
          // lưu token tương ứng vs user, nếu đã tốn tại token thì thay thế token
          await User.findOneAndUpdate(
            { _id: userData._id },
            {
              $set: {
                token: accessToken,
              },
            }
          );
          return res.status(200).json({
            code: statusCode.OK,
            message: statusMessage.OK,
            data: {
              id: userData._id,
              username: userData.username,
              token: accessToken,
              // refreshToken: refreshToken, // chưa cần dùng
              avatar: userData.avatar,
            },
          });
        } else {
          // password không hợp lệ
          res.status(200).json({
            code: statusCode.USER_IS_NOT_VALIDATED,
            message: statusMessage.USER_IS_NOT_VALIDATED,
          });
        }
      } else {
        // phonenumber chưa được đăng kí
        res.status(200).json({
          code: statusCode.USER_IS_NOT_VALIDATED,
          message: statusMessage.USER_IS_NOT_VALIDATED,
        });
      }
    }
};

// const refreshToken = async (req, res) => {
//   const refreshToken= require(Client = req.body.refreshToken;
//   if (refreshToken= require(Client && tokenList[refreshToken= require(Client]) {
//     try {
//       const decoded = await jwtHelper.verifyToken(
//         refreshToken= require(Client,
//         refreshTokenSecret
//       );

//       const userData = decoded.data;

//       const accessToken = await jwtHelper.generateToken(
//         userData,
//         accessTokenSecret,
//         accessTokenLife
//       );

//       return res.status(200).json({ accessToken });
//     } catch (error) {
//       res.status(403).json({
//         message: "Invalid refresh token.",
//       });
//     }
//   } else {
//     return res.status(403).json({
//       message: "No token provided.",
//     });
//   }
// };

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



module.exports = {
  login,
  // refreshToken,
  signup,
  getVerifyCode,
  checkVerifyCode,
  // changeInfoAfterSignup, // move to user.controller.js
};
