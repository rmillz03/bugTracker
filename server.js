if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')
const bcrypt = require('bcrypt') //encrypts passwords
const passport = require('passport') //save user login data for use in sessions
const flash = require('express-flash') //login error messages
const session = require('express-session') //user sessions
const methodOverride = require('method-override') //allows call of delete instead of POST

//setup db
const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true })
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to Mongoose'))

const indexRouter = require('./routes/index')

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(express.static('public'))
app.use(express.urlencoded({ extended: false })) //need to allow pages to access form data





app.use('/', indexRouter)

app.listen(process.env.PORT || 3000)