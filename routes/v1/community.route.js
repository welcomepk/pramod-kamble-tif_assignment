
const { Snowflake } = require('@theinternetfolks/snowflake')
const express = require('express')
const slugify = require('slugify')
const Community = require('../../models/Community.model')
const auth = require('../../middlewares/auth')

const router = express.Router()

router.get('/', async (req, res) => {
    const page = parseInt(req.query.page) || 1; // Get the page from query parameter, default to 1 if not provided
    const limit = parseInt(req.query.limit) || 10; // Set a default limit of 10 items per page
    try {
        const total = await Community.countDocuments({});
        const data = await Community.find({})
            .skip((page - 1) * limit)
            .limit(limit);

        const totalPages = Math.ceil(total / limit);

        const meta = {
            total,
            pages: totalPages,
            page,
        };

        const response = {
            status: true,
            content: {
                meta,
                data
            }
        }
        return res.send(response)

    } catch (error) {
        console.log(error);
        return res.status(500).send({
            status: false,
            message: "internal server error"
        })
    }

})

router.post('/', auth, async (req, res, next) => {
    const { name } = req.body
    const payload = {
        _id: Snowflake.generate(),
        name,
        slug: slugify(name, { lower: true }),
        owner: req.user._id
    }
    try {
        const exists = await Community.findOne({ name })

        if (exists) return res.status(400).send({
            status: false,
            errors: [
                {
                    param: "name",
                    message: `Community with this name '${name}' already exists.`,
                    code: "RESOURCE_EXISTS"
                }
            ]
        });

        const community = await Community.create(payload)
        const response = {
            status: true,
            content: {
                data: community
            }
        }
        res.send(response)
    } catch (error) {
        console.log(error);
        next(error)
    }
})
router.get('/me/owner', auth, async (req, res) => {
    const page = parseInt(req.query.page) || 1; // Get the page from query parameter, default to 1 if not provided
    const limit = parseInt(req.query.limit) || 10; // Set a default limit of 10 items per page
    try {
        const total = await Community.countDocuments({ owner: req.user._id })
        const data = await Community.find({ owner: req.user._id })
            .skip((page - 1) * limit)
            .limit(limit);

        const totalPages = Math.ceil(total / limit)

        const meta = {
            total,
            pages: totalPages,
            page,
        };

        const response = {
            status: true,
            content: {
                meta,
                data
            }
        }
        return res.send(response)

    } catch (error) {
        console.log(error);
        return res.status(500).send({
            status: false,
            message: "internal server error"
        })
    }

})
module.exports = router