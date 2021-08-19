const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const email = require("../models/Email");

router.post('/send-email', async (req, res) => {
    let e = new email({
        ...req.body,
        sentFromName: req.body.name
    })
    e.save().then(ress => {
        // console.log(ress);
        res.json(ress);
    }).catch(er => {
        console.log(er);
        res.json(res);
    })
})

module.exports = router;
