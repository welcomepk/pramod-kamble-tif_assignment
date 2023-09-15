
const { Schema, model } = require('mongoose')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const userSchema = new Schema({
    _id: {
        type: String,
    },
    name: {
        type: String,
        required: true,
        trim: true,
        minLength: [2, "Name should be at least 2 characters."]
    },
    email: {
        type: String,
        required: [true, 'Enter an email address.'],
        unique: [true, "User with this email address already exists."],
        trim: true,
        validate: [validator.isEmail, 'Enter a valid email address.']
    },
    password: {
        type: String,
        required: [true, 'Enter a password.'],
        minLength: [2, "Password should be at least two characters"]
    },
    tokens: {
        type: [{
            token: {
                type: String,
                required: true
            }
        }]
    }
}, { timestamps: true })

userSchema.virtual('communities', {
    ref: 'Community',
    localField: '_id',
    foreignField: 'owner'
})
userSchema.virtual('member', {
    ref: 'Member',
    localField: '_id',
    foreignField: 'user'
})

// generate and save token for a user
userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1 day' })
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
}

// hash password before save
userSchema.pre('save', function (next) {
    const user = this
    if (!user.isModified('password')) return next();

    bcrypt.hash(user.password, 8, function (err, hash) {
        if (err) {
            console.log(err);
            return next();
        }
        user.password = hash;
        next();
    });
})


userSchema.statics.findByCredentials = async function (email, password) {
    const user = await User.findOne({ email });

    if (!user) return { inValid: true, param: "email" }
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return { inValid: true, param: "password" }
    return user;
}

userSchema.methods.toJSON = function () {
    const user = this.toObject();
    user.id = user._id
    delete user._id
    delete user.password
    delete user.tokens
    delete user.updatedAt
    delete user.__v

    return user
}

const User = model('User', userSchema)

module.exports = User