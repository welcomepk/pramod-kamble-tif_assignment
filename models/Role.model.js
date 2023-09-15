
const { Schema, model } = require('mongoose')


const roleSchema = new Schema({
    _id: {
        type: String,
    },
    name: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        minLength: [2, "Name should be at least 2 characters."]
    },
}, { timestamps: true })


roleSchema.methods.toJSON = function () {
    const role = this.toObject();
    role.id = role._id
    delete role._id
    delete role.__v
    return role
}
const Role = model('Role', roleSchema)

module.exports = Role