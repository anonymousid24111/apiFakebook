const fs = require( "fs");

let saveFile = (oldpath, newpath) => {
  return new Promise((resolve, reject) => {
    fs.rename(oldpath, newpath, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(newpath);
      }
    });
  });
};

module.exports = {
  saveFile: saveFile,
};
