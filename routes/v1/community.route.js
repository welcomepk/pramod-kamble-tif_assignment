
const { Snowflake } = require('@theinternetfolks/snowflake')
const express = require('express')
const slugify = require('slugify')
const Community = require('../../models/Community.model')
const Member = require('../../models/Member.model')
const auth = require('../../middlewares/auth')

const router = express.Router()

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
router.get('/me/member', auth, async (req, res) => {

    const page = parseInt(req.query.page) || 1; // Get the page from query parameter, default to 1 if not provided
    const limit = parseInt(req.query.limit) || 10; // Set a default limit of 10 items per page
    const skip = (page - 1) * limit

    try {

        const data = await Member.find({ user: req.user._id })
            .populate({
                path: 'community',
                model: 'Community',
                select: 'name slug owner createdAt updatedAt',
                populate: {
                    path: 'owner',
                    model: 'User',
                    select: 'name'
                }
            })

        const communities = data.map(member => {
            const community = member.community;
            return {
                id: community._id, // Here, we're using '_id' as 'id'
                name: community.name,
                slug: community.slug,
                owner: {
                    id: community.owner._id,
                    name: community.owner.name
                },
                created_at: community.createdAt,
                updated_at: community.updatedAt
            };
        });

        const total = communities.length
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
                data: communities
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


router.get('/:id/members', async (req, res) => {

    const { id: community_id } = req.params

    const page = parseInt(req.query.page) || 1; // Get the page from query parameter, default to 1 if not provided
    const limit = parseInt(req.query.limit) || 10; // Set a default limit of 10 items per page
    const skip = (page - 1) * limit

    try {

        const community = await Community.findById({ _id: community_id })
        if (!community) {
            return res.status(400).send(generateError(message = "Community not found.", code = 'RESOURCE_NOT_FOUND'))
        }
        const data = await community.populate({
            path: 'members',
            options: {
                limit,   // for pagination
                skip,
            },
            select: '_id community user role createdAt',
            populate: [
                {
                    path: 'user',
                    select: '_id name' // Specify the fields you want from the user document
                },
                {
                    path: 'role',
                    select: '_id name' // Specify the fields you want from the role document
                }
            ]

        })

        const members = data.members.map(item => {
            return {
                id: item.id,
                community: item.community,
                user: {

                    id: item.user._id,
                    name: item.user.name,
                },
                role: {

                    id: item.role._id,
                    name: item.role.name,
                },
                createdAt: item.createdAt,

            };
        });

        const total = members.length
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
                data: members
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