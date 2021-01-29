const { render } = require('ejs')
const express = require('express')
const router = express.Router()
const Users = require('../models/users')



router.get('/', async (req, res) => {
    try {
        let searchOptions = {}
        searchOptions.email = new RegExp("tom@tom")
        const findTom = await Users.findOne(searchOptions)
        
        searchOptions = {}
        const users = await Users.find(searchOptions)
        res.render('index.ejs', {
            users: users,
            name:  findTom.name //"unknown"
        })
    } catch (error) {
        console.log(error)
    }
})



module.exports = router