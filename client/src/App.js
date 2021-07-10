import React from 'react';
import { HashRouter as Router, Switch, Route, Redirect } from "react-router-dom";
import SignIn from './Components/Auth/SignIn/SignIn';
import Chat from "./Components/Chat/Chat";
import Settings from "./Components/Settings/Settings";
import MyImages from "./Components/MyImages/MyImages";
import auth from './Helpers/auth';
import axios from 'axios';

class App extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            user: null
        }
    }

    componentDidMount() {
        auth('GET_USER').then(user => {
            if(user) {
                this.setState({user})
            }
        })
    }

    componentWillUnmount() {
        if(!this.state.user) return;
        axios.post('/api/users/set-inactive', {userId: this.state.user._id}).then((res) => {
            console.log(res);
        })
    }

    render(){
      return (
          <div className="app">
            <Router>
                <Switch>
                    <Route exact path="/">
                        <Redirect to="/chat" />
                    </Route>
                    <Route exact path="/sign-in" component={SignIn} />
                    <Route path="/my-images" component={MyImages} />
                    <Route path="/chat" component={Chat} />
                    <Route path="/settings" component={Settings} />
                    <Route render={() => <div>404</div>}/>
                </Switch>
            </Router>
          </div>
      )
    }
}

export default App;
