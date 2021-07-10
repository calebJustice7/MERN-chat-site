import React from 'react';
import SideBar from "./Sidebar/SideBar";
import './Chat.css';
import auth from '../../Helpers/auth.js';
import socketClient from "socket.io-client";
import axios from "axios";
import MainChat from "./MainChat/MainChat";
import $ from 'jQuery';

let socket;
let socketUrl = 'http://localhost:9000';
// let socketUrl = 'http://calebjustice.com:9000';

export default class Chat extends React.Component {

    _isMounted = true;

    constructor(props) {
        super(props);
        this.state = {
            user: null,
            activeChat: {},
            id: null,
            conversations: []
        }
    }

    getUser = () => {
        auth('GET_USER').then(user => {
            if(user) {
                this.setState({user});
            }
        })
    }

    componentDidMount() {
        $('#message').hide();
        setTimeout(() => {
            $('#message').slideDown(200);
        }, 300);

        setTimeout(() => {
            $('#message').slideUp(200);
        }, 4500);

        auth('GET_USER').then(user => {
            this.getConversations();
            if (!user) {
                this.props.history.push('/sign-in');
            } else {
                socket = socketClient(socketUrl);
                socket.emit('connection', user);
                socket.on('connection', () => {
                    console.info('socket connection established on port 9000');
                })
                socket.on('conversation', () => {
                    this.getConversations();
                })
                socket.on('incomingMessage', () => {
                    this.getConversations();
                });

                this.setState({
                    user
                })
            }
        })
        setInterval(() => {
            socket.emit('test');
        }, 3000);
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    getConversations = () => {
        auth('GET_USER').then(user => {
            axios.post('/api/chat/get-chats', {user: user}).then(res => {
                if(res.data.success == 'false') return;
                else {
                    if(this._isMounted) {
                        let newActiveChat = Object.keys(this.state.activeChat).length ? res.data.find(conv => conv._id === this.state.activeChat._id) : {};
                        this.setState({
                            conversations: res.data,
                            activeChat: newActiveChat
                        })
                        let el = document.getElementById('messages');
                        if(el){
                            el.scrollTop = el.scrollHeight;
                        }
                    }
                }
            })
        })
    }


    setActiveChat = chat => {
        this.setState({
            activeChat: chat
        })
        this.getConversations();
    }

    sendMessage = chat => {
        this.getConversations();
        let themUser = chat.userIds.filter(id => id !== this.state.user._id)[0];
        socket.emit('newMessage', chat._id, themUser);
    }


    emitNewConversation = (userId) => {
        this.getConversations();
        socket.emit('newConversation', userId);
    }

    render() {
        let text = 'no user';
        if(this.state.user) {
            text = JSON.stringify(this.state.user.socketId) + this.state.user.active;
        }
        return (
            <div className="chat-wrapper" style={{overflow: 'hidden'}}>
                <div id="message">
                    <div className="content">
                        <div>You will need to refresh if re-opening tab</div>
                    </div>
                </div>
                <div className="sidebar">
                    <SideBar emitNewConversation={this.emitNewConversation} conversations={this.state.conversations} activeChat={this.state.activeChat} setActiveChat={this.setActiveChat} user={this.state.user}/>
                </div>

                <div className="chat">
                    {Object.keys(this.state.activeChat).length ? <MainChat user={this.state.user} sendMessage={this.sendMessage} activeChat={this.state.activeChat} /> : ''}
                </div>
            </div>
        )
    }
}