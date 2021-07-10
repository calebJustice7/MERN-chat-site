import axios from 'axios';

export default async function (type, payload) {
    switch (type) {
        case 'AUTH':
            localStorage.setItem('JWT_PAYLOAD', payload.token);
            localStorage.setItem('_ID', payload.user._id);
            break;
        case 'STATUS':
            return await localStorage.getItem('JWT_PAYLOAD') ? true : false;
        case 'GET_USER':
            let jwt = localStorage.getItem('JWT_PAYLOAD');
            if (!jwt) {
                return false;
            }
            let data = localStorage.getItem('_ID') ? localStorage.getItem('_ID') : false;
            let returnVal;
            if (data) {
                await axios.post('/api/users/get-user', {_id: data}).then(res => {
                    returnVal = res.data.payload;
                })
                    .catch(err => {
                        returnVal = false;
                    })
            }
            return returnVal;
            break;
        case 'GET_USER_ID':
            return localStorage.getItem('_ID') ? localStorage.getItem('_ID') : '';
    }
}