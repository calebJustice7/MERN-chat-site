import React from 'react';
import SendIcon from '@material-ui/icons/Send';
import axios from 'axios';
import './MainChat.css';
import date from '../../../Helpers/date';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import $ from 'jQuery';
import throttle from 'lodash.throttle';

export default class MainChat extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            inputVal: ''
        };
        this.anchorRef = React.createRef();
        this.handleScroll = throttle(this.computeOffsetBottom, 200);
    }

    sendMessage = (e) => {
        if(e._reactName === 'onKeyUp' && e.code !== 'Enter') {
            return;
        }
        if(!this.state.inputVal.length) return;
        axios.post('/api/chat/add-message', {sentFromId: this.props.user._id, message: this.state.inputVal, chatId: this.props.activeChat._id}).then(res => {
            if(res.data.success) {
                this.props.sendMessage(this.props.activeChat);
                this.setState({inputVal: ''})
            }
        })
    }

    componentDidMount() {
        window.addEventListener('scroll', this.handleScroll);
    }

    componentWillUnmount() {
        this.handleScroll.cancel();
        window.removeEventListener('scroll', this.handleScroll);
    }

    computeOffsetBottom = () => {
        if (!this.anchorRef.current) {
            return;
        }

        const {bottom} = this.anchorRef.current.getBoundingClientRect();
        const {offset} = this.props;
        if (Math.floor(bottom) > window.innerHeight) {
            this.setState({bottom: offset + 44});
        } else {
            this.setState({bottom: offset});
        }
    };

    showSidebar = () => {
        if(window.innerWidth > 700) return;
        $('#side-bar-wrapper').show();
        $('#main-chat-wrapper').hide();
    }

    render(){
        return (
            <div className="main-chat-wrapper" id="main-chat-wrapper" style={{backgroundPosition: 'center', backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundImage: this.props.user.chatBg && this.props.user.chatBg.url ? `url(${this.props.user.chatBg.url})` : 'url()'}}>
                {Object.keys(this.props.activeChat).length ? <div className="messages" id="messages">
                    {this.props.activeChat.messages.map((message, idx) => (
                        <div className={message.sentFromId === this.props.user._id ? 'message my-message' : 'message them-message'} key={idx}>
                            <div>{message.message}</div>
                            <div>{date(message.createdAt)}</div>
                        </div>
                    ))}
                </div> : ''}
                <div onClick={this.showSidebar} className="go-back" style={{backgroundColor: 'rgba(255, 255, 255, 0.80)'}}>
                    <ArrowBackIcon style={{fontSize: '2.2em'}}/>
                </div>
                <div id="chat-box" className="text-input" ref={this.anchorRef}>
                    <input onKeyUp={this.sendMessage} value={this.state.inputVal} onChange={(e) => this.setState({inputVal: e.target.value})} type="text"  placeholder="Send a message" />
                    <SendIcon onClick={this.sendMessage} className="send-icon" />
                </div>
            </div>
        )
    }
}