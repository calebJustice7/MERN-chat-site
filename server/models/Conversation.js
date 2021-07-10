const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let ConversationSchema = new Schema({
    userIds: {
        type: Array,
        required: true
    },
    names: {
        type: Array
    },
    messageIds: {
        type: Array
    },
    createdAt: {
        type: Date,
        default: new Date()
    }
});

module.exports = Conversation = mongoose.model('Conversations', ConversationSchema);