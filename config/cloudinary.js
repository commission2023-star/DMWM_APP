const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: 'hsotf8aj',
  api_key: 584454741647774,
  api_secret: 'aUxPjBPMsPtUfFdyefutqqacGQA'
});

module.exports = cloudinary;