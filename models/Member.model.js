const { Schema, model } = require('mongoose')

const memberSchema = new Schema({
    _id: {
        type: String
    },
    community: {
        type: String,
        required: true,
        ref: 'Community'
    },
    user: {
        type: String,
        required: true,
        ref: 'User'
    },
    role: {
        type: String,
        required: true,
        ref: 'Role'
    }
}, { timestamps: true, strictPopulate: false })

// memberSchema.methods.toJSON = function () {
//     const member = this.toObject();
//     member.id = member._id
//     delete member._id
//     return member
// }

const Member = model('Member', memberSchema)

module.exports = Member