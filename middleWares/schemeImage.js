const DatabaseMongoose = require("../repository/database")
const multer = require('multer');
const mongoose = require('mongoose');

 
const mongouri = DatabaseMongoose.url;
try {
  mongoose.connect(mongouri, {
    useUnifiedTopology: true,
    useNewUrlParser: true
  });
} catch (error) {
  console.log(error)
  handleError(error);
}
process.on('unhandledRejection', error => {
  console.log('unhandledRejection', error);
});
 

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'uploads')
  },
  filename: (req, file, cb) => {
      cb(null, file.fieldname + '-' + Date.now())
  }
});

const upload = multer({ storage})

module.exports = {upload}