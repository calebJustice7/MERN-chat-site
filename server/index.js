// let prod = false;
let prod = true;

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const passport = require('passport');
const bodyParser = require('body-parser');
const Users = require('./routes/users');
const Chat = require('./routes/chat');
const Defaults = require('./routes/defaults');
const https = require('https');
const socket = require('socket.io');
const User = require('./models/User');
const Pw = require('./routes/pw');
const fs = require('fs');
require('dotenv').config();

const app = express();
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(cors());

const db = require('./config/keys').mongoURL;
mongoose.connect(db, {
        useUnifiedTopology: true,
        useNewUrlParser: true
    }).then(() => console.log('db connected'))
    .catch((err) => console.log(err));

require("./config/passport")(passport)
app.use(passport.initialize());

app.use('/api/users/', Users);
app.use('/api/chat/', Chat);
app.use('/api/defaults/', Defaults);
app.use('/api/pw', Pw);

const port = process.env.PORT || 9000;

let server;

let url = 'http://calebjustice.com';
// let url = 'http:localhost:3000';

if (prod === true) {
    server = https.createServer({
        key: fs.readFileSync('/etc/letsencrypt/live/calebjustice.com/privkey.pem'),
        cert: fs.readFileSync('/etc/letsencrypt/live/calebjustice.com/cert.pem'),
        requestCert: false,
        rejectUnauthorized: false
    }, app).listen(`${port}`, () => console.log('Listening on port ', port));
} else {
    server = app.listen(port, () => console.log('Listening on port ', port));
}

let io = socket(server, { cors: { origin: '*' } });


io.sockets.on('connection', (socket) => {
    socket.on('connection', appUser => {
        if (appUser) {
            User.findOne({ _id: appUser._id }).then(res => {
                res.active = true;
                res.socketId = socket.id;
                res.save();
            })
        }
    })

    socket.on('newConversation', (userId) => {
        User.findOne({ _id: userId }).then(user => {
            if (user.socketId.length && user.active) {
                socket.to(user.socketId).emit('conversation');
            }
        })
    })

    socket.on('newMessage', (chatId, themId) => {
        console.log(chatId, themId);
        User.findOne({ _id: themId }).then(user => {
            if (user.socketId.length) {
                socket.to(user.socketId).emit('incomingMessage', chatId);
            }
        })
    })

    socket.on('leave', (id) => {
        User.findOne({ socketId: socket.id }).then(user => {
            console.log(user);
            if (user) {
                user.active = false;
                user.socketId = '';
                user.save();
            } else {
                User.findOne({ _id: id }).then(userr => {
                    console.log(userr, 'userr');
                    if (userr) {
                        userr.active = false;
                        userr.socketId = '';
                        userr.save();
                    }
                })
            }
        })
    })

    socket.on('disconnect', () => {
        User.findOne({ socketId: socket.id }).then(user => {
            if (user) {
                user.active = false;
                user.socketId = '';
                user.save();
            }
        })
    })
})