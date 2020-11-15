require('dotenv').config()
const formidable = require("formidable");
const { getVideoDurationInSeconds } = require("get-video-duration");
const statusCode = require('../constants/statusCode.constant');
// const fs = require("fs");
let parse = (req, postData) => {
  return new Promise((resolve, reject) =>{
    const form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files)=>{
      // số lượng file phải < 5
      // var file = {};
      var numberOfImages = (postData&&postData.image)?postData.image.length:0;
      var numberOfVideos = (postData&&postData.video&&postData.video.url)?1:0;
      var imageList = [];
      var videoList = [];
      var tempType = "";
      var file="";
      for(const key in files){
        if (files.hasOwnProperty(key)) {
          file= files[key];
          tempType = file.type.split("/")[1];
          if(tempType=="jpg"||tempType=="jpeg"||tempType=="png"){
            numberOfImages++;
            if(numberOfImages>4){
              console.log("có nhiều hơn 4 file ảnh")
              return reject(statusCode.FILE_SIZE_IS_TOO_BIG)
            }
            if (file.size>4*1024*1024) {
              console.log("ảnh có dung lượng hơn 4Mb")
              return reject(statusCode.FILE_SIZE_IS_TOO_BIG)
            }
            imageList.push(file.path);
          }
          else if (tempType=="mp4"||tempType=="3gp") {
            numberOfVideos++;
            if(numberOfVideos>2){
              console.log("có nhiều hơn 1 file video");
              return reject(statusCode.FILE_SIZE_IS_TOO_BIG)
            }
            if (file.size>10*1024*1024) {// kiem tra file video co hon hon 10MB khong
              console.log("dung lượng file lơn hơn 10Mb")
              return reject(statusCode.FILE_SIZE_IS_TOO_BIG)
            }
            getVideoDurationInSeconds(file.path).then(duration=>{
              if (duration<1||duration>10) {
                console.log("thời lượng video <1s hoặc lớn hơn 10s")
                return reject(statusCode.FILE_SIZE_IS_TOO_BIG)
              }
            }).catch(err=>{
              if(err){
                console.log("lỗi lấy duration")
                return reject(statusCode.UNKNOWN_ERROR)
              }
            })
            videoList.push(file.path);
          }
        }
      }
      if (numberOfVideos==1&&numberOfImages==0) {
        resolve({type: "video", data: videoList});
      } else if(numberOfVideos==0&&numberOfImages<=4&&numberOfImages>0) {
        resolve({type: "image", data: imageList})
      } else if(numberOfImages==0&&numberOfImages==0){
        resolve({type: "null", data: {}})
      } else{
        console.log("không thoả mãn chỉ có 1 video hoặc chỉ có dưới 4 ảnh", numberOfImages, numberOfVideos);
        return reject(statusCode.FILE_SIZE_IS_TOO_BIG)
      }
    })
  });
};

module.exports = {
  parse: parse,
};
