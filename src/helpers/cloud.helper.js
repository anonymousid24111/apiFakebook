require('dotenv').config()

// const fs = require("fs");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});
let upload = (path) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(path)
      .then((result) => {
        resolve(result);
      }).catch((error) => {
        reject(err);
      });
  });
};

module.exports = {
  upload: upload,
};
