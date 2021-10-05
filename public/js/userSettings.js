import axios from 'axios';
import { showAlert } from './alerts';

export const updateSettings = async (data, type) => {
    const url = type === 'password' 
    ? 'http://127.0.0.1:3000/api/v1/users/updatemypassword' 
    : 'http://127.0.0.1:3000/api/v1/users/updateme';

    try{
        const res = await axios({
            method: 'PATCH',
            url,
            data
        });

        if(res.data.status === 'success') {
            showAlert('success', `${type.toUpperCase()} Uppdated Successfully`);
        };
    } catch(err) {
        showAlert('error', err.response.data.message);
    };

};