const jwt = require('jsonwebtoken');

const accessToken = (userId) => {
    const token = jwt.sign({
        userId
    }, 'process.env.ACCESS_TOKEN_SECRET', {
        expiresIn: '10m'
    });
    return token
}

const refreshToken = (userId, password) => {
    const token = jwt.sign({
        userId,
        password,
    }, 'process.env.REFRESH_TOKEN_SECRET', {
        expiresIn: '24h'
    })
    return token
}

const verifyAccessToken = (req, res, next) => {
    let token = req.headers['x-access-token'];
    if (!token) {
        return res.status(403).send({ message: 'No token provided!' });
    }
    jwt.verify(token, 'process.env.ACCESS_TOKEN_SECRET', (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Unauthorized!' });
        }
        req.userId = decoded.userId;
        next();
    });
}

const verifyRefreshToken = (req, res, next) => {
    let token = req.headers['x-refresh-token']
    if (!token) {
        return res.status(403).send({ message: 'No token provided!' })
    }
    jwt.verify(token, 'process.env.REFRESH_TOKEN_SECRET', (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Unauthorized!' });
        }
        console.log("this worked")
        console.log(decoded)
        req.userId = decoded.userId;
        req.password = decoded.password;
        next();
    })
}

module.exports = {
    accessToken,
    refreshToken,
    verifyAccessToken,
    verifyRefreshToken
}