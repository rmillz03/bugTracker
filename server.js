if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

//dependencies
const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')
const flash = require('express-flash') //login error messages
const session = require('express-session') //user sessions
const passport = require('passport') //save user login data for use in sessions
const methodOverride = require('method-override') //allows call of delete instead of POST
const bcrypt = require('bcrypt')

const Users = require('./models/users.js')

const configPassport = require('./passport-config')


app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(express.static('public'))
app.use(express.urlencoded({ extended: false })) //need to allow pages to access form data
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

//setup db
const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true })
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to Mongoose'))

//routes
// const indexRouter = require('./routes/index')
// app.use('/', indexRouter)

//login routes
app.get('/', checkAuthenticated, async (req, res) => {
    try {
        var user = req.user;  
        res.render('index.ejs', { name: user.name })
    } catch (error) {
        console.log(error)
    }
})

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs', { layout: 'layouts/loginLayout' })
})

app.post('/login', 
    checkNotAuthenticated,
    passport.authenticate('local', { successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs', { layout: 'layouts/loginLayout' })
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const user = new Users({
            name: req.body.regName,
            email: req.body.email,
            password: hashedPassword
        })
        user.save(function (err, fluffy) {
            if (err) return console.error(err);
        });
        res.redirect('/login')
    } catch {
        res.redirect('/register')
    }   
})

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }

    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }

    next()
}

app.listen(process.env.PORT || 3000)