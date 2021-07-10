import React from 'react';
import axios from 'axios';
import auth from '../../Helpers/auth';
import {NavLink} from "react-router-dom";
import './Settings.css';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import MessagePopup from "../Common/MessagePopup";
import AutorenewIcon from '@material-ui/icons/Autorenew';

const fileTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/pdf'];

export default class Settings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user: {},
            inputVal: '',
            fileInput: '',
            fileInputBg: '',
            previewSource: '',
            previewSourceBg: '',
            message: '',
            isUploading: false,
            showPopup: false
        }
    }

    handleFileInputChange = (e, type) => {
        const file = e.target.files[0];
        if(!fileTypes.includes(file.type)) {
            this.setState({
                message: 'Must be either jpg, pdf, or png'
            })
        } else {
            this.setState({
                message: ''
            })
            this.previewFile(file, type);
        }
    }

    previewFile = (file, type) => {
        if(file.size > 10000000) {
            this.setState({message: 'File size too big'});
            return;
        }
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
            this.setState({ [type === 'avatar' ? 'previewSource' : 'previewSourceBg']: reader.result });
        }
    }

    handleSubmitFile = (e, type) => {
        e.preventDefault();
        if(type === 'avatar') {
            if(this.state.isUploading || (this.state.message.length > 0 || this.state.messages === 'Success') || !this.state.previewSource || Object.keys(this.state.user) < 1) return;

            this.setState({isUploading: true});
            axios.post('/api/users/upload-image', JSON.stringify({
                data: this.state.previewSource, _id: this.state.user._id
            })).then((res) => {
                this.setState({isUploading: false});
                if(res.data && res.data.message) {
                    this.setState({
                        message: res.data.message,
                        fileInput: '',
                        previewSource: '',
                        showPopup: true
                    });
                } else {
                    this.setState({
                        fileInput: '',
                        previewSource: '',
                        message: 'Success',
                        showPopup: true
                    })
                }
                setTimeout(() => {
                    this.setUser();
                }, 200);
                setTimeout(() => {
                    this.setState({showPopup: false, message: ''});
                },2000);
            });
        } else {
            if(this.state.isUploading || (this.state.message.length > 0 || this.state.messages === 'Success') || !this.state.previewSourceBg || Object.keys(this.state.user) < 1) return;

            this.setState({isUploading: true});
            axios.post('/api/chat/upload-bg-image', JSON.stringify({
                data: this.state.previewSourceBg, _id: this.state.user._id
            })).then(res => {
                this.setState({isUploading: false});
                if(res.data && res.data.message) {
                    this.setState({
                        message: res.data.message,
                        fileInputBg: '',
                        previewSourceBg: '',
                        showPopup: true
                    });
                } else {
                    this.setState({
                        message: 'Success',
                        fileInputBg: '',
                        previewSource: '',
                        showPopup: true
                    });
                }
                setTimeout(() => {
                    this.setUser();
                }, 200);
                setTimeout(() => {
                    this.setState({showPopup: false, message: ''});
                },2000);
            })
        }
    }

    setUser = () => {
        auth('GET_USER').then(user => {
            if(user) {
                this.setState({
                    user,
                    inputVal: user.firstName
                })
            } else {
                this.props.history.push('/sign-in');
            }
        })
    }

    componentDidMount() {
        this.setUser();
    }

    render(){
        return (
            <div className="settings-wrapper">
                <MessagePopup model={this.state.isUploading} noBg={true} >
                    <AutorenewIcon className="loading" />
                </MessagePopup>
                <MessagePopup model={this.state.showPopup}>
                    <div style={{padding: '10px 20px', fontSize: '1.5em', borderRadius: '8px'}}>{this.state.message}</div>
                </MessagePopup>
                <NavLink to="/chat"><ArrowBackIcon className="back" /></NavLink>
                <div className="header">
                    <div>My Profile</div>
                    <NavLink to="/my-images"><button className="image-btn" style={{border: 'none', fontSize: '.5em'}}>View all my images</button></NavLink>
                </div>
                <div className="cards">

                    <div className="left">
                        <div className="img-uploader">
                            <div>Upload Avatar Image</div>
                            <div className="upload-box">
                                <input onChange={(e) => this.handleFileInputChange(e, 'avatar')} type="file" />
                            </div>
                            <div style={{color: this.state.message === 'Success' ? 'green' : 'red', fontSize: '.8em', margin: '20px 0'}}>{ this.state.message }</div>
                            <button className="image-btn" style={{marginTop: '20px'}} onClick={(e) => this.handleSubmitFile(e, 'avatar')}>Save</button>
                        </div>
                        {this.state.previewSource ?
                            <img className="display-image" src={this.state.previewSource} />
                            : (this.state.user.avatar && this.state.user.avatar.url ? <img style={{borderRadius: '50%', objectFit: 'cover', margin: '20px auto 0 25px', width: '25vw', height: '25vw'}} className="display-image" src={this.state.user.avatar.url} />  : <img className="display-image" src={this.state.previewSource} /> )}

                    </div>

                    <div className="right">
                        <div>
                            <div>Change First Name</div>
                            <input onChange={e => this.setState({inputVal: e.target.value})} type="text" placeholder="Change first name" value={this.state.inputVal} />
                        </div>
                        <div className="button-wrapper">
                            <button className="image-btn" style={{marginTop: '20px'}}>Save</button>
                        </div>
                        <div className="img-uploader prof">
                            <div>Upload Image For Chat Background (optional)</div>
                            <div className="upload-box">
                                <input onChange={(e) => this.handleFileInputChange(e, 'bg')} type="file" />
                            </div>
                            <div style={{color: this.state.message === 'Success' ? 'green' : 'red', fontSize: '.8em', margin: '20px 0'}}>{ this.state.message }</div>
                            <button className="image-btn" style={{marginTop: '20px'}} onClick={(e) => this.handleSubmitFile(e, 'bg')}>Save</button>
                        </div>
                        {this.state.previewSourceBg ?
                            <img className="display-image" src={this.state.previewSourceBg} />
                            : (this.state.user.chatBg ? <img style={{ objectFit: 'cover', margin: '20px auto 0 25px', width: '25vw', height: '25vw'}} className="display-image" src={this.state.user.chatBg.url} />  : <img className="display-image" src={this.state.previewSourceBg} /> )}
                    </div>

                </div>
            </div>
        )
    }
}