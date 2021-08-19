const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Pw = require('../models/PW');
const checkAuth = require('../middleware/check-auth');
const Users = require('../models/User');


router.post('/new-entry', checkAuth, (req, res) => {
    const { createdBy, name, pw, username } = req.body;
    const p = new Pw({
        createdBy,
        name,
        encr: pw,
        username,
        createdAt: new Date()
    })
    p.save().then(resp => {
        res.status(200).json({success: true, data: resp});
    }).catch(er => {
        res.status(200).json({success: false, message: er});
    })
})

router.post('/get-pw', checkAuth, (req, res) => {
    const { email, password, userId, l } = req.body;
    if (email === 'caleb@calebjustice.com' && l === process.env.L) {
        Users.findOne({_id: userId}).then(resp => {
            if (password === resp.password) {
                Pw.find().then(ress => {
                    res.status(200).json({success: true, data: ress})
                })
            }
        }).catch(er => res.status(200).json({er, success: false}));
    }
})

// router.post('/login', (req, res) => {
//     const { errors, isValid } = validator.loginValidator(req.body);
//     if (!isValid) {
//         res.status(200).json({message: 'Email is not valid', 'success': 'false'});
//     } else {
//         Users.findOne({email: req.body.email})
//             .then((user) => {
//                 if(!user) {
//                     res.status(200).json({"message": "Email does not exist", "success": "false"})
//                 } else {
//                     bcrypt.compare(req.body.password, user.password)
//                     .then((isMatch) => {
//                         if(!isMatch) {
//                             res.status(200).json({'message': 'Password does not match', 'success': 'false'});
//                         } else {
//                             const payload = {
//                                 id: user._id,
//                                 name: user.firstName
//                             }
//                             jwt.sign(
//                                 payload,
//                                 keys.secretOrKey,
//                                 {
//                                     expiresIn: 2155926
//                                 },
//                                 (err, token) => {
//                                     res.json({
//                                         user: user,
//                                         token: 'Bearer token: ' + token,
//                                         success: true
//                                     })
//                                 }
//                             )
//                         }
//                     })
//                 }
//             })
//     }
// })

// router.post('/register', (req, res) => {
//     const { errors, isValid } = validator.registerValidator(req.body);
//     if (!isValid) {
//         res.status(404).json(errors);
//     } else {
//         Users.findOne({ email: req.body.email })
//             .then((user) => {
//                 if (user) {
//                     res.status(404).json({ "message": "Email is already in use!", "success": "false" });
//                 } else {
//                     const registerUser = new Users({
//                         firstName: req.body.firstName,
//                         lastName: req.body.lastName,
//                         email: req.body.email,
//                         password: req.body.password,
//                         createdAt: new Date()
//                     });
//                     bcrypt.genSalt(10, (err, salt) => {
//                         bcrypt.hash(registerUser.password, salt, (err, hash) => {
//                             if (err) throw err;
//                             registerUser.password = hash;
//                             registerUser.save().then((user) => {
//                                 res.json({"message": "User created successfully!", "success": "true"});
//                             })
//                                 .catch((err) => console.log(err));
//                         })
//                     })
//                 }
//             })
//     }
// })

module.exports = router;