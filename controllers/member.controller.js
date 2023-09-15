const { Snowflake } = require("@theinternetfolks/snowflake");
const Member = require('../models/Member.model');
const Community = require("../models/Community.model");
const User = require("../models/User.model");
const Role = require("../models/Role.model");


const generateError = (param, message, code) => {
    return {
        status: false,
        errors: [
            {
                param,
                code,
                message,
            }
        ]
    }
}


async function addMember(req, res) {

    try {
        const community = await Community.findById({ _id: req.body.community })
        const role = await Role.exists({ _id: req.body.role })
        const user = await User.exists({ _id: req.body.user })

        if (!user) {
            return res.status(400).send(generateError('user', 'User not found', 'RESOURCE_NOT_FOUND'))
        }
        if (!community) {
            return res.status(400).send(generateError('community', 'Community not found.', 'RESOURCE_NOT_FOUND'))
        }
        if (!role) {
            return res.status(400).send(generateError('role', 'Role not found.', 'RESOURCE_NOT_FOUND'))
        }


        if (community.owner !== req.user._id) {
            return res.status(400).send(generateError(message = "You are not authorized to perform this action.", code = 'NOT_ALLOWED_ACCESS'))
        }

        const isExists = await Member.findOne({
            community: req.body.community,
            user: req.body.user
        })
        console.log(isExists);
        if (isExists) {
            return res.status(400).send(generateError(message = "User is already added in the community.", code = 'RESOURCE_EXISTS'))
        }

        const member = await Member.create({
            _id: Snowflake.generate(),
            community: req.body.community,
            user: req.body.user,
            role: req.body.role,
        })

        return res.send({
            status: true,
            content: {
                data: member
            }
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            status: false,
            error: "internal server error"
        })
    }
}

async function deleteMember(req, res) {
    const { id } = req.params

    try {
        const member = await Member.findById({ _id: id })
        if (!member)
            return res.send(generateError(message = "Member not found.", code = 'RESOURCE_NOT_FOUND'))

        const { community } = await member.populate('community')
        console.log(community);
        const isAuthorized = community.owner === req.user._id
        console.log(community.owner);
        if (!isAuthorized)
            return res.send(generateError(message = "You are not authorized to perform this action.", code = 'NOT_ALLOWED_ACCESS'))

        await Member.deleteOne({ _id: id })
        return res.send({
            status: true
        })
    } catch (error) {
        console.log(error)
        res.send(error)
    }
}

module.exports = {
    addMember,
    deleteMember
}