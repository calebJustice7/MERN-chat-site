require('dotenv').config();
const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: 'dtzputkae',
    api_secret: 'OxA6XrccdIQG3hen1T35vQPsR1w',
    api_key: '251322357686573'
});
module.exports = {cloudinary};