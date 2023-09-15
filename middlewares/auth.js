const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

const auth = async (req, res, next) => {

    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ _id: decoded.id, 'tokens.token': token })
        if (!user) throw new Error("user not found");
        req.user = user;
        req.token = token;
        next();

    } catch (error) {
        return res.status(401).send({
            status: false,
            errors: [
                {
                    message: "You need to sign in to proceed.",
                    code: "NOT_SIGNEDIN",
                    reason: error?.message
                }
            ]
        });
    }

}

module.exports = auth;