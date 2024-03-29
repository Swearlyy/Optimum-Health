if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}



const express = require ('express')
const app = express ()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const initializePassport = require ('./passport-config')
const expressEjsLayouts = require('express-ejs-layouts')

initializePassport (
    passport, 
    email => users.find(user => user.email == email),
    id => users.find(user => user.id == id)
)
    

const users = []

app.use(expressEjsLayouts)
app.set('layout', './layouts/base')
app.set('view engine', 'ejs')
app.set('views','./views');

app.use(express.urlencoded({extended: false}))

app.use (flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false

}))

app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.use(express.static(__dirname + '/public'));

app.get( '/', (req, res) => {
    res.render('index.ejs')
} )

app.get( '/profile', checkAuthenticated, (req, res) => {
    res.render('profile.ejs', {firstName:req.user.firstName})
} )

app.get( '/map', (req, res) => {
    res.render('maptest.ejs')
} )

app.get( '/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
} )

app.post( '/login', checkNotAuthenticated, passport.authenticate ('local', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true

}) )


app.get( '/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
} )

app.get( '/contact', (req, res) => {
    res.render('contact.ejs')
} )


app.post( '/register', checkNotAuthenticated, async (req, res) => {
   try{
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
     users .push({
        id: Date.now().toString(),
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        dateofBirth: req.body.dateofBirth,
        phoneNo: req.body.phoneNo,
        streetName: req.body.streetName,
        houseNumber: req.body.houseNumber,
        postalCode: req.body.postalCode,
        city: req.body.city,
        gender: req.body.gender,
        agree: req.body.agree,
        password: hashedPassword
     })

     res.redirect('/login')

}  catch(e){
    console.log(e)
    res.redirect('/register')
   } 
 
} )

app.delete('/logout', (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/login');
      });
}
)


function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next ()
    }

    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) 
    {
       return res.redirect('/profile')
      
    }
    next ()

    
}

app.listen(3000) 


