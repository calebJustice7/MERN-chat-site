import {createStore} from 'redux';

const initState = {
    conversations: []
}

const reducer = (state = initState, action) => {
    if(action.type === 'SET_CONVERSATIONS') {
        return {
            ...state,
            conversations: action.conversations
        }
    }
}

const store = createStore(reducer);

export default store;