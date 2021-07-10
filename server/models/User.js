const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    chats: {
        type: Array,
    },
    password: {
        type: String,
        required: true
    },
    chatBg: {
      type: Object,
      contains: {
          url: {type: String},
          publicId: {type: String}
      }
    },
    Date: {
        type: Date,
        default: Date.now
    },
    images: [{
        type: Object,
        contains: {
            url: {type: String},
            publicId: {type: String}
        }
    }],
    avatar: {
        type: Object,
        contains: {
            url: {type: String},
            publicId: {type: String}
        }
    },
    active: {
        type: Boolean,
        default: false
    },
    socketId: {
        type: String,
        default: ''
    },
    deleted: {
        type: Boolean,
        default: false
    }
});

module.exports = User = mongoose.model('Users', UserSchema);