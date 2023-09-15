const { Router } = require('express')
const auth = require('../../middlewares/auth')
const { addMember, deleteMember } = require('../../controllers/member.controller')

const router = Router();


// api/v1/member/
router.post('/', auth, addMember)
router.delete('/:id', auth, deleteMember)

module.exports = router