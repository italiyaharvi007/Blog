const jwt = require('jsonwebtoken')
const User = require('../model/UserModel')

const auth = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(decoded.id)
        if (!user) {
            throw new Error()
        }

        req.token = token
        req.user = user
        next()

    } catch (error) {
        res.status(401).send({ error: 'Please authenticate.' })
    }
}

module.exports = auth