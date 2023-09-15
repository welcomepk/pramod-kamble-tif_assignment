const { Router } = require('express');
const router = Router();

const userRouter = require('./user.route')
const roleRouter = require('./role.route')
const communityRouter = require('./community.route')
const memberRouter = require('./member.route')


// api/v1
router.use('/auth', userRouter);
router.use('/role', roleRouter);
router.use('/community', communityRouter);
router.use('/member', memberRouter);

module.exports = router