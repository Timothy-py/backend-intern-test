const jwt = require('jsonwebtoken');
require('dotenv').config();

function jwtGenerator(userId){
    const payload = {
        user: userId
    };

    return jwt.sign(payload, process.env.jwtSecret, {expiresIn: '30mins'})
}

module.exports = jwtGenerator;