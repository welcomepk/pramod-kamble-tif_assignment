const { Snowflake } = require("@theinternetfolks/snowflake");
const Role = require('../models/Role.model')

async function getAllRoles(req, res) {
    const page = parseInt(req.query.page) || 1; // Get the page from query parameter, default to 1 if not provided
    const limit = parseInt(req.query.limit) || 10; // Set a default limit of 10 items per page


    try {
        const total = await Role.countDocuments({});
        const data = await Role.find({})
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

}

async function createRole(req, res, next) {
    const { name } = req.body

    try {
        const exists = await Role.findOne({ name })

        if (exists) return res.send({
            status: false,
            errors: [
                {
                    param: "name",
                    message: `Role with this name '${name}' already exists.`,
                    code: "RESOURCE_EXISTS"
                }
            ]
        });

        const role = await Role.create({
            _id: Snowflake.generate(),
            name
        })
        const response = {
            status: true,
            content: {
                data: role
            }
        }
        return res.send(response)
    } catch (error) {
        console.log(error);
        next(error)
    }
}

module.exports = {
    getAllRoles,
    createRole
}