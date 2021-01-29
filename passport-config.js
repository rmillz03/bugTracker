const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const Users = require('./models/users')

passport.use(new LocalStrategy({ usernameField: 'email' },
    function (username, password, done) {
        
        Users.findOne({ email: username }, 
            function async (err, user) {
                if (err) { return done(err); }
                if (!user) {
                    console.log("Incorrect username")
                    return done(null, false, { message: 'Incorrect username.' });
                }

                //if (!user.validPassword(password)) {
                var comparePwd = async () => await bcrypt.compare(password, user.password)
                if (!comparePwd) {
                    return done(null, false, { message: 'Incorrect password.' });
                }

                return done(null, user);

            });
    }
  ));

  passport.serializeUser(function(user, done) {
      done(null, user.id);
  })

  passport.deserializeUser(function(id, done) {
    Users.findById(id, function(err, user) {
      done(err, user);
    });
  });

// module.exports = Initialize