const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let MessageSchema = new Schema({
    sentFromId: {type: Schema.Types.ObjectId, required: true},
    message: {type: String, required: true},
    chatId: {type: Schema.Types.ObjectId, required: true},
    createdAt: {
        type: Date,
        default: new Date()
    }
});

module.exports = Conversation = mongoose.model('Messages', MessageSchema);