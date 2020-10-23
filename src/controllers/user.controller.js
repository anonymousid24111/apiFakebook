import User from "../models/user.model.js";
import * as statusCode from "./../constants/statusCode.constant.js";
import * as statusMessage from "./../constants/statusMessage.constant.js";

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
    logout,
    changeInfoAfterSignup,
}