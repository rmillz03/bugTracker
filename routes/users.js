const express = require('express')
const { route } = require('.')
const router = express.Router()
const Users = require('../models/users.js')


//user profile
router.get('/profile', async (req, res) => {
    var ssn = req.session;
    var userInfo = await Users.findOne({ email: ssn.email })
    console.log('user: ' + userInfo)
    res.render('users/profile', {
        userInfo: userInfo
    })
})

module.exports = router