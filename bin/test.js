"use strict";
const request = require('request');
let options = {
    // url: 'https://devtiffwebapp.azurewebsites.net/api/login',
    url: 'http://localhost:3000/api/en/reservation/email',
    form: {
        id: '58173be46110990ca49b0cc8',
        to: 'ilovegadd@gmail.com',
    }
};
request.post(options, (error, response, body) => {
    console.log(error);
    console.log(body);
});
