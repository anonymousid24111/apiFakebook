require('dotenv').config()

// const fs = require("fs");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});
let upload = (path, type) => {
  return new Promise((resolve, reject) =>{
    if (type=="video") {
      cloudinary.uploader.upload(path, { resource_type: "video" })
      .then((result) => {
        resolve(result);
      }).catch((error) => {
        console.log(error)
        reject(err);
      });
    } else {
      cloudinary.uploader.upload(path)
      .then((result) => {
        resolve(result);
      }).catch((error) => {
        console.log("ahihi",error)
        reject(err);
      });
    }
    
  });
};

module.exports = {
  upload: upload,
};
