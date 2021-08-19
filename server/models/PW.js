const mongoose = require('mongoose');
var encrypt = require('mongoose-encryption');

const Schema = mongoose.Schema;

let PwSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    encr: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        required: true
    },
    createdAt: {
        type: Date,
        default: new Date()
    }
});

var encKey = process.env.SOME_32BYTE_BASE64_STRING;
var sigKey = process.env.SOME_64BYTE_BASE64_STRING;

PwSchema.plugin(encrypt, { encryptionKey: encKey, signingKey: sigKey });

module.exports = Conversation = mongoose.model('Pws', PwSchema);