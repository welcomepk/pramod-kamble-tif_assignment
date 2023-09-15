const { Router } = require('express')
const auth = require('../../middlewares/auth')
const { getAllRoles, createRole } = require('../../controllers/role.controller')

const router = Router();


// api/v1/role/
router.post('/', createRole)
router.get('/', getAllRoles)

module.exports = router