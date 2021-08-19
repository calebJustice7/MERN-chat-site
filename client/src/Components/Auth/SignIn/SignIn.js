import React from 'react';
import axios from 'axios';
import auth from '../../../Helpers/auth';
import './SignIn.css';

export default class SignIn extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tab: 'sign-in',
            firstName: '',
            lastName: '',
            signInEmail: '',
            signInPassword: '',
            registerEmail: '',
            registerPassword: '',
            error: ''
        }
    }

    componentDidMount() {
        auth('STATUS').then(res => {
            if(res) {
                this.props.history.push('/chat');
            }
        })
    };

    handleInput = e => {
        this.setState({
            [e.target.className]: e.target.value
        })
    }

    setTab = tab => {
        this.setState({
            tab
        })
    }

    signUp = () => {
        let config = {
            email: this.state.registerEmail,
            password: this.state.registerPassword,
            firstName: this.state.firstName,
            lastName: this.state.lastName
        }
        axios.post('/api/users/register', config).then(res => {
            this.setState({
                tab: 'sign-in'
            })
        });
    }

    signIn = () => {
        let config = {
            email: this.state.signInEmail,
            password: this.state.signInPassword
        }
        axios.post('/api/users/login', config).then(res => {
            if (res.data.success != 'true') {
                this.setState({
                    error: res.data.message
                })
            }
            if(res.data.user && res.data.token) {
                auth('AUTH', res.data);
                axios.defaults.headers.common['Authorization'] = localStorage.getItem('JWT_PAYLOAD');
                setTimeout(() => {
                    this.props.history.push('/chat');
                }, 300);
            }
        });
    }

    render() {
        return (
            <div className="sign-in-wrapper">
                {this.state.tab === 'sign-in' ? <div className="sign-in">
                    <div>Login</div>
                    <div style={{height: '30px', marginTop: '6px', color: 'red', fontWeight: '200'}}>{this.state.error}</div>
                    <div className="form">

                        <input type="text" value={this.state.signInEmail} className="signInEmail"
                               onChange={(e) => this.handleInput(e)} placeholder="Type Your Email"/>
                        <input type="password" value={this.state.signInPassword} className="signInPassword"
                               onChange={(e) => this.handleInput(e)} placeholder="Type your password"/>
                        <div onClick={() => this.setTab('sign-up')} className="no-account">No account? Create one</div>
                        <div className="button" onClick={() => this.signIn()}>
                            <button>Sign In</button>
                        </div>
                    </div>
                </div> : <div className="sign-in">
                    <div>Sign up</div>
                    <div className="form">
                        <input type="text" value={this.state.firstName} className="firstName"
                               onChange={(e) => this.handleInput(e)} placeholder="Type Your First name"/>
                        <input type="text" value={this.state.lastName} className="lastName"
                               onChange={(e) => this.handleInput(e)} placeholder="Type Your Last name"/>
                        <input type="text" value={this.state.registerEmail} className="registerEmail"
                               onChange={(e) => this.handleInput(e)} placeholder="Type Your Email"/>
                        <input type="password" value={this.state.registerPassword} className="registerPassword"
                               onChange={(e) => this.handleInput(e)} placeholder="Type your password"/>
                        <div onClick={() => this.setTab('sign-in')} className="no-account">Already have an account?
                        </div>
                        <div className="button">
                            <button onClick={() => this.signUp()}>Sign Up</button>
                        </div>
                    </div>
                </div>}
            </div>
        )
    }
}