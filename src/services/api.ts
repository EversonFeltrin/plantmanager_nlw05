import axios from 'axios';

// usar ipadress ao invés de localhost
const api = axios.create({
    baseURL: 'http://<ipaddress>:3333',
});

export default api;

