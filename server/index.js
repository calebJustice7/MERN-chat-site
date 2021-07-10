const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const passport = require('passport');
const bodyParser = require('body-parser');
const Users = require('./routes/users');
const Chat = require('./routes/chat');
const socket = require('socket.io');
const User = require('./models/User');

const app = express();
app.use(bodyParser.urlencoded({extended: true, limit: '50mb'}));
app.use(bodyParser.json({limit: '50mb'}));
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

const port = process.env.PORT || 9000;

let server = app.listen(port, () => console.log('Listening on port ', port));

// let url = 'http://calebjustice.com';
let url = 'http:localhost:3001';

let io = socket(server, {cors: {origin: url}});


io.sockets.on('connection', (socket) => {
    socket.on('connection', appUser => {
        if(appUser){
            User.findOne({_id: appUser._id}).then(res => {
                res.active = true;
                res.socketId = socket.id;
                res.save();
            })
        }
    })

    socket.on('newConversation', (userId) => {
        User.findOne({_id: userId}).then(user => {
            if(user.socketId.length && user.active) {
                socket.to(user.socketId).emit('conversation');
            }
        })
    })

    socket.on('newMessage', (chatId, themId) => {
        console.log(chatId, themId);
        User.findOne({_id: themId}).then(user => {
            if(user.socketId.length) {
                socket.to(user.socketId).emit('incomingMessage', chatId);
            }
        })
    })

    socket.on('disconnect', () => {
        User.findOne({socketId: socket.id}).then(user => {
            if(user){
                user.active = false;
                user.socketId = '';
                user.save();
            }
        })
    })
})