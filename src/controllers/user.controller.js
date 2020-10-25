const fs = require("fs");
const formidable = require("formidable");
const saveFile = require("../helpers/saveFile.helper.js");

const User = require("../models/user.model.js");

const statusCode = require("./../constants/statusCode.constant.js");
const statusMessage = require("./../constants/statusMessage.constant.js");

const logout = async (req, res) => {
  const { token } = req.query;
  const { _id } = req.jwtDecoded.data;
  await User.findByIdAndUpdate(_id, {
    $set: {
      token: null
    }
  })
  return res.status(200).json({
    code: statusCode.OK,
    message: statusMessage.OK,
  })
}

const changeInfoAfterSignup = async (req, res) => {
  const { _id, phonenumber } = req.jwtDecoded.data;
  const { token, username } = req.query;
  // username để trống, chứa các kí tự đặc biệt, trùng với số điện thoại, 
  // nhỏ hơn 6 tí tự hoặc lớn hơn 50 kí tự
  // là đường dẫn, số điện thoại, địa chỉ
  if (!username ||
    username.match(/[^a-z|A-Z|0-9]/g) ||
    username === phonenumber ||
    username.lenth < 6 ||
    username.lenth > 50
  ) {
    return res.status(200).json({
      code: statusCode.PARAMETER_VALUE_IS_INVALID,
      message: statusMessage.PARAMETER_VALUE_IS_INVALID,
    });
  }

  const form = new formidable.IncomingForm();
  await form.parse(req, async (err, fields, files) => {
    if (err) {
      throw err;
    } else {
      if (files.avatar.size > 1024 * 1024 * 4) {
        console.log("quá 4mb dung lượng tối đa cho phép");
        return res.status(200).json({
          code: statusCode.FILE_SIZE_IS_TOO_BIG,
          message: statusMessage.FILE_SIZE_IS_TOO_BIG
        })
      }
      const oldpath = files.avatar.path;
      const typeFile = files.avatar.name.split(".")[1];//tách lấy kiểu của file mà người dùng gửi lên
      if (!(typeFile == "jpg" || typeFile == "jpeg" || typeFile == "png")) {//không đúng định dạng
        console.log("File không đúng định dạng")
        return res.status(200).json({
          code: statusCode.FILE_SIZE_IS_TOO_BIG,
          message: statusCode.FILE_SIZE_IS_TOO_BIG
        })
      }
      const newpath = `upload/avatar.${_id}${Date.now()}.${typeFile}`;//tạo đường dẫn mới cho ảnh được upload
      try {
        await saveFile.saveFile(oldpath, newpath);//lưu và đổi tên file
      } catch (error) {
        console.log(error);
        console.log("Lỗi khi lưu file", isErrorSave)
        return res.status(200).json({
          code: statusCode.FILE_SIZE_IS_TOO_BIG,
          message: statusCode.FILE_SIZE_IS_TOO_BIG
        })
      }
      const timeCurrent = Date.now()

      // update tên user và đường dẫn avatar, thời gian sửa đổi
      const userData = await User.findByIdAndUpdate(_id, {
        $set: {
          username: fields.username,
          avatar: newpath,
          created: timeCurrent
        },
      });

      return res.status(200).json({
        code: statusCode.OK,
        message: statusMessage.OK,
        data: {
          id: _id,
          username: fields.username,
          phonenumber: phonenumber,
          created: timeCurrent,
          avatar: newpath,
        },
      });
    }
  });
};
module.exports = {
  logout,
  changeInfoAfterSignup,
}