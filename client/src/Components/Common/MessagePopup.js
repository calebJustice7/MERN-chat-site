import React from 'react';
import './MessagePopup.css';

export default class MessagePopup extends React.Component {
    constructor(props) {
        super(props);
    }

    hideScreen = () => {
        document.getElementsByTagName('html')[0].style.overflow = 'hidden';
    }

    showScreen = () => {
        document.getElementsByTagName('html')[0].style.overflow = 'auto';
    }

    render(){
        let theChild = undefined;
        if(this.props.model === true) {
            this.hideScreen();
        } else {
            this.showScreen();
        }

        if(this.props.model) {
            theChild =  <div style={{overflow: 'scoll', position: 'absolute', top: '0', bottom: '0', left: '0', right: '0', zIndex: this.props.zIndex ? this.props.zIndex : 20, width: '100vw', backgroundColor: this.props.backgroundColor ? this.props.backgroundColor : 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <div style={{backgroundColor: this.props.noBg ? '' : 'white'}}>
                    {this.props.children}
                </div>
            </div>
        }
        return (
            <div>
                    {theChild}
            </div>
            )
    }
}