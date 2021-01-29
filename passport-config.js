const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const Users = require('./models/users')

// function Initialize(passport, getUserByEmail, getUserById) {

//     const authenticateUser = async (email, password, done) => {
//         //check for exisiting user
//         const user = getUserByEmail(email)
//         if (user == null) {
//             return done(null, false, {message: 'No user with that email' })
//         }

//         //check for good password
//         try {
//             if (await bcrypt.compare(password, user.password)) {
//                 return done(null, user)
//             } else {
//                 return done(null, false, {message: 'Password incorrect' })
//             }
//         } catch (e) {
//             return done(e)
//         }
//     }

//     passport.use(
//         new LocalStrategy(
//             { usernameField: 'email' }, 
//             authenticateUser
//         )
//     )
//     passport.serializeUser((user, done) => done(null, user.id))
//     passport.deserializeUser((id, done) => {
//         return done(null, getUserById(id))
//     })
// }

passport.use(new LocalStrategy({ usernameField: 'email' },
    function (username, password, done) {
        
        Users.findOne({ email: username }, 
            function(err, user) {
                if (err) { return done(err); }
                if (!user) {
                    console.log("Incorrect username")
                    return done(null, false, { message: 'Incorrect username.' });
                }
                // if (!user.validPassword(password)) {
                //     return done(null, false, { message: 'Incorrect password.' });
                // }
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