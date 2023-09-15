const User = require('../models/User.model')
const { Snowflake } = require("@theinternetfolks/snowflake");
const jwt = require('jsonwebtoken')

async function handleSignUp(req, res, next) {
    const payload = {
        ...req.body,
        _id: Snowflake.generate(),
    }
    try {
        const isExists = await User.findOne({ email: payload.email })
        if (isExists) {
            return res.status(400).send({
                status: false,
                errors: [
                    {
                        param: "email",
                        message: "User with this email address already exists.",
                        code: "RESOURCE_EXISTS"
                    }
                ]
            })
        }

        const user = new User(payload)
        const token = await user.generateAuthToken();

        const response = {
            status: true,
            content: {
                data: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    created_at: user.createdAt
                },
                meta: { access_token: token }
            }
        }
        res.send(response)
    } catch (error) {
        next(error);
    }


}
async function handleSignIn(req, res, next) {
    const { email, password } = req.body

    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        if (user.inValid) {
            return res.status(400).send({
                status: false,
                errors: [
                    {
                        param: user.param,
                        message: "The credentials you provided are invalid.",
                        code: "INVALID_CREDENTIALS"
                    }
                ]
            })
        }
        const token = await user.generateAuthToken();

        const response = {
            status: true,
            content: {
                data: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    created_at: user.createdAt
                },
                meta: { access_token: token }
            }
        }
        res.send(response)

    } catch (error) {
        next(error)
    }

}
async function getProfile(req, res) {

    const response = {
        status: true,
        content: {
            data: req.user
        }
    }
    return res.send(response)

}
module.exports = {
    handleSignUp,
    handleSignIn,
    getProfile
}