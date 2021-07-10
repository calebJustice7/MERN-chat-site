const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const checkAuth = require('../middleware/check-auth');
const Conversations = require('../models/Conversation');
const Users = require('../models/User');
const Messages = require('../models/Message');
const {cloudinary} = require('../config/cloudinary');

router.post('/new-chat', checkAuth, (req, res) => {
    if ((!req.body.themId || !req.body.myId)) {
        res.status(200).json({"message": "Something went wrong, try again"});
        return;
    }
    const db = mongoose.connection;
    db.collection('conversations').find({userIds: {$all: [req.body.themId, req.body.myId]}}, (err, cursor) => {
        let query = cursor.toArray().then(resp => {
            if (resp.length >= 1) {
                res.status(200).json({"message": "Conversation already exists!", "data": "false"});
                return;
            } else {
                Users.findOne({_id: req.body.themId}).then(user => {
                    console.log(req.body.myId, req.body.themId);
                    let newConversation = new Conversations({
                        userIds: [req.body.themId, req.body.myId],
                        names: [req.body.fullName, user.firstName + ' ' + user.lastName],
                        messageIds: [],
                        createdAt: new Date()
                    })

                    newConversation.save().then((convo) => {
                        Users.updateMany({_id: {$in: [req.body.themId, req.body.myId]}}, {
                            $push: {
                                chats: convo._id
                            }
                        }).then(() => {
                            res.json({"message": "Chat created!", "data": convo})
                        }).catch((err) => {
                            res.json({message: 'Something went wrong', 'data': 'Something went wrong'})
                        })
                    }).catch((err) => console.log(err));
                })
            }
        }).catch(err => console.log(err));
    })
});

router.post('/get-chats', (req, res) => {
    if (!req.body.user) {
        return res.status(200).json({"message": "Something went wrong, try again", success: false});
    }
    const db = mongoose.connection;
    Conversations.find({_id: {$in: req.body.user.chats}}).then(async resp => {
        if (resp.length === 0) {
            res.status(200).json({message: 'No chats', success: 'false'});
        } else {
            let newResp = [];
            // console.log(resp);
            let counter = 0;
            await resp.forEach(async (conv, idx) => {
                    let themUser = conv.userIds.filter(user => user !== req.body.user._id)[0];
                    await Users.findOne({_id: themUser}).then(async user => {
                        let newMessages = [];
                        await Messages.find({chatId: {$in: conv._id}}).then(messages => {
                            let nMess = messages.map(message => {
                                if (message.sentFromId === req.body.user._id) {
                                    return {
                                        sentFromId: message.sentFromId,
                                        createdAt: message.createdAt,
                                        message: message.message,
                                        chatId: message.chatId,
                                        sentFrom: req.body.user
                                    }
                                } else {
                                    return {
                                        sentFromId: message.sentFromId,
                                        createdAt: message.createdAt,
                                        message: message.message,
                                        chatId: message.chatId,
                                        sentFrom: user
                                    }
                                }
                            })
                            newMessages.push(nMess)
                        })
                        newResp.push({
                            userIds: conv.userIds,
                            createdAt: conv.createdAt,
                            messageIds: conv.messageIds,
                            names: conv.names,
                            _id: conv._id,
                            themUser: user,
                            messages: newMessages[0]
                        })
                    })
                    if (counter + 1 === resp.length) {
                        newResp = newResp.sort(function(a,b){
                            return new Date(b.createdAt) - new Date(a.createdAt);
                        });
                        res.json(newResp);
                    }
                    counter++;
                }
            )
        }
    })
    ;
})

router.post('/delete-chat', (req, res) => {
    if (!req.body._id) {
        return res.status(404).json({"message": "Something went wrong, try again"});
    }
    try {
        Conversations.deleteOne({_id: {$eq: req.body._id}}).then(resp => res.status(200).json({"message": resp}));
    } catch (err) {
        res.status(404).json({"message": "Something went wrong, try again"});
    }
})

router.post('/upload-bg-image', checkAuth, async (req, res) => {
    try {
        const fileStr = req.body.data;
        const uploadedResponse = await cloudinary.uploader.upload(fileStr);
        Users.findOne({_id: req.body._id}).then(user => {
            user.chatBg = {url: uploadedResponse.url, publicId: uploadedResponse.public_id};
            user.save();
            if(user.images) {
                user.images.push({url: uploadedResponse.url, publicId: uploadedResponse.public_id});
            } else {
                user.images = [];
                user.images.push({url: uploadedResponse.url, publicId: uploadedResponse.public_id})
            }
            res.json({success: true});
        })
    } catch (err) {
        console.log(err);
        res.json({success: false, message: 'Something went wrong, try again.'})
    }
})


router.post('/get-chat', (req, res) => {
    if (!req.body._id) {
        return res.status(404).json({"message": "Something went wrong, try again"});
    }
    Conversations.findById(req.body._id).then(resp => {
        if (resp == null) {
            res.status(404).json({"message": "Conversation no longer exists, try refreshing"})
        }
        res.json({"message": "success", "data": resp})
    })
})

router.post('/add-message', (req, res) => {
    if (!req.body.sentFromId || !req.body.message) {
        res.status(200).json({"message": "Something went wrong, try again"})
    }
    let {message, sentFromId, chatId} = req.body;
    let newMessage = new Messages({
        sentFromId: sentFromId,
        message: message,
        chatId,
        createdAt: new Date()
    })
    newMessage.save().then(message => {
        Conversations.findOne({_id: req.body.chatId}).then(conv => {
            conv.messageIds.push(message._id);
            conv.save();
            res.json({success: true})
        })
    })
})

module.exports = router;