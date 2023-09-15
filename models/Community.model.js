
const { Schema, model } = require('mongoose')
const validator = require('validator')
const { Snowflake } = require('@theinternetfolks/snowflake')

const jwt = require('jsonwebtoken')
const Member = require('./Member.model')
const Role = require('./Role.model')

const communitySchema = new Schema({
    _id: {
        type: String,
    },
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minLength: [2, "Name should be at least 2 characters."]
    },
    slug: {
        type: String,
    },
    owner: {
        type: String,
        required: true,
    },

}, { timestamps: true })

communitySchema.post('save', async function (doc) {
    const community = doc;
    console.log(doc)

    const roleName = 'Community Admin'

    // get the role of community-admin
    let role = await Role.findOne({ name: roleName })

    // creating role if not exists
    if (!role) {
        role = await Role.create({
            _id: Snowflake.generate(),
            name: roleName
        })
    }

    const memberPayload = {
        _id: Snowflake.generate(),
        community: community._id,
        user: community.owner,
        role: role._id
    }
    const member = await Member.create(memberPayload)
});

communitySchema.methods.toJSON = function () {
    const community = this.toObject();
    community.id = community._id
    delete community._id
    delete community.__v
    return community
}

const Community = model('Community', communitySchema)
module.exports = Community