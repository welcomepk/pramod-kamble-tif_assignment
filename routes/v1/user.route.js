const { Router } = require('express')
const { handleSignUp, handleSignIn, getProfile } = require('../../controllers/user.controller')
const auth = require('../../middlewares/auth')

const router = Router();

router.post('/signup', handleSignUp)
router.post('/signin', handleSignIn)
router.get('/me', auth, getProfile)


module.exports = router