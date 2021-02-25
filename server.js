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
const configPassport = require('./passport-config')
const methodOverride = require('method-override') //allows call of delete instead of POST
const bcrypt = require('bcrypt')

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(express.static('public'))
app.use(express.urlencoded({ extended: false })) //need to allow pages to access form data
app.use(flash())
app.use(methodOverride('_method'))


//setup db
const mongoose = require('mongoose')
const mongoStore = require('connect-mongo')(session)
const dbString = process.env.DATABASE_URL
const dbOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}
mongoose.connect(dbString, dbOptions)
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to Mongoose'))

//sessions
const sessionStore = new mongoStore({
    mongooseConnection: db,
    collection: 'sessions'
})
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24
    }
}))
app.use(passport.initialize())
app.use(passport.session())

const Users = require('./models/users.js')

//routes
const usersRouter = require('./routes/users')
const projectRouter = require('./routes/projects')

app.use('/users', usersRouter)
app.use('/projects', projectRouter)


//login routes
var ssn //session

app.get('/', checkAuthenticated, async (req, res) => {
    try {
        var user = req.user;  
        //save authenticated email to sessions
        if (!req.session.email) {
            req.session.email = user.email
        }
                        
        res.render('index.ejs', {
            name: user.firstName
         })
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
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: hashedPassword,
            role: req.body.role
        })
        user.save(function (err) {
            if (err) return console.error(err);
        });
        res.redirect('/login')
    } catch {
        res.redirect('/register')
    }   
})

app.delete('/logout', (req, res) => {
    req.logout() //built in passport func
    res.redirect('/login')
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