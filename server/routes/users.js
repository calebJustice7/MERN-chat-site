const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const keys = require('../config/keys');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const passport = require('../config/passport');
const Users = require('../models/User');
const Conversation = require('../models/Conversation');
const validator = require('../validators/validators');
const checkAuth = require('../middleware/check-auth');
const multer = require('multer');
const fs = require('fs');
const { cloudinary } = require('../config/cloudinary');

router.get('/get-all-users', checkAuth, (req, res) => {
    Users.find({ email: { $ne: req.body.email } }).then(resp => {
        res.json(resp);
    })
})

router.post('/get-user', (req, res) => {
    Users.findOne({ _id: req.body._id }).then(resp => {
        if (!resp) res.json({ message: 'We encountered an error, try signing in again', success: 'false' });
        else {
            res.json({ payload: resp, success: 'true' });
        }
    })
})

router.post('/user-by-search', (req, res) => {
    Users.find({ email: { $regex: `.*${req.body.email}.*` }, _id: { $ne: req.body.userId } }).then(users => {
        // console.log(users);
        let newUsers = users;
        res.json(newUsers);
    }).catch((err) => {
        console.log(err);
        console.log(req.body.userId);
        res.json({ error: 'Something went wrong' });
    })
})

router.post('/login', (req, res) => {
    const { errors, isValid } = validator.loginValidator(req.body);
    if (!isValid) {
        res.status(200).json({ message: 'Email is not valid', 'success': 'false' });
    } else {
        Users.findOne({ email: req.body.email })
            .then((user) => {
                if (!user) {
                    res.status(200).json({ "message": "Email does not exist", "success": "false" })
                } else {
                    bcrypt.compare(req.body.password, user.password)
                        .then((isMatch) => {
                            if (!isMatch) {
                                res.status(200).json({ 'message': 'Password does not match', 'success': 'false' });
                            } else {
                                const payload = {
                                    id: user._id,
                                    name: user.firstName
                                }
                                jwt.sign(
                                    payload,
                                    keys.secretOrKey, {
                                        expiresIn: 2155926
                                    },
                                    (err, token) => {
                                        res.json({
                                            user: user,
                                            token: 'Bearer token: ' + token,
                                            success: true
                                        })
                                    }
                                )
                            }
                        })
                }
            })
    }
})

router.post('/upload-image', checkAuth, async(req, res) => {
    try {
        const fileStr = req.body.data;
        const uploadedResponse = await cloudinary.uploader.upload(fileStr);
        Users.findOne({ _id: req.body._id }).then(user => {
            user.avatar = { url: uploadedResponse.url, publicId: uploadedResponse.public_id };
            user.save();
            if (user.images) {
                user.images.push({ url: uploadedResponse.url, publicId: uploadedResponse.public_id });
            } else {
                user.images = [];
                user.images.push({ url: uploadedResponse.url, publicId: uploadedResponse.public_id })
            }
            res.json({ success: true });
        })
    } catch (err) {
        console.log(err);
        res.json({ success: false, message: 'Something went wrong, try again.' })
    }
})

router.post('/set-avatar', (req, res) => {
    let { userId, publicId, url, type } = req.body;
    Users.findOne({ _id: userId }).then(user => {
        user[type] = {
            url,
            publicId
        }
        user.save().then(() => {
            res.json({ success: true, message: `User ${type === 'chatBg' ? 'Chat background' : 'Avatar'} updated` });
        }).catch(() => {
            res.json({ success: false, message: 'Something went wrong updating the user' });
        })
    }).catch(() => {
        res.json({ success: false, message: 'Something went wrong updating the user' });
    })
})

router.post('/set-inactive', (req, res) => {
    Users.findOne({ _id: req.body.userId }).then(user => {
        user.socketId = '';
        user.active = false;
    })
})

router.post('/remove-image', (req, res) => {
    let { userId, publicId, url } = req.body;
    Users.findOne({ _id: userId }).then(user => {
        let newImages = user.images.filter(image => image.publicId !== publicId);
        console.log(user.avatar, user.chatBg, publicId);
        if (user.avatar.publicId === publicId) {
            user.avatar = '';
        }
        if (user.chatBg.publicId === publicId) {
            user.chatBg = '';
        }
        console.log(user);
        user.images = newImages;
        user.save().then(() => {
            res.json({ success: true, message: 'Image successfully removed' });
        }).catch(() => {
            res.json({ success: true, message: 'Something went wrong removing image' });
        })
    }).catch(() => {
        res.json({ success: true, message: 'Something went wrong removing image' });
    })
})

router.post('/register', (req, res) => {
    const { errors, isValid } = validator.registerValidator(req.body);
    if (!isValid) {
        res.status(404).json(errors);
    } else {
        Users.findOne({ email: req.body.email })
            .then((user) => {
                if (user) {
                    res.status(404).json({ "message": "Email is already in use!", "success": "false" });
                } else {
                    const registerUser = new Users({
                        firstName: req.body.firstName,
                        lastName: req.body.lastName,
                        email: req.body.email,
                        password: req.body.password,
                        createdAt: new Date()
                    });
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(registerUser.password, salt, (err, hash) => {
                            if (err) throw err;
                            registerUser.password = hash;
                            registerUser.save().then((user) => {
                                    res.json({ "message": "User created successfully!", "success": "true" });
                                })
                                .catch((err) => console.log(err));
                        })
                    })
                }
            })
    }
})

module.exports = router;