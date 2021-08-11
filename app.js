var createError = require('http-errors');
var express = require('express');
var bodyParser= require('body-parser');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var expressHbs = require('express-handlebars');
var mongoose = require('mongoose');
var session = require('express-session');
var passport = require('passport'); 
var flash = require('connect-flash');
const validator= require('express-validator');
var MongoStore= require('connect-mongo')(session);
const Handlebars = require('handlebars');
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access');
const nodemailer = require('nodemailer');

const config = require('./config');
var indexRouter = require('./routes/index');
var userRouter = require('./routes/user');
var classrouter = require('./routes/classroom')

var app = express();
	

	mongoose.connect('mongodb+srv://abshetty:xHPl9iJDBtGc8lvQ@eattendance.oxj6e.mongodb.net/eattendance?retryWrites=true&w=majority',{useNewUrlParser: true, useUnifiedTopology: true})
	
//	mongoose.connect('mongodb://localhost:27017/eattendance',{useNewUrlParser: true, useUnifiedTopology: true})
   

require('./config/passport');

const hbs=expressHbs.create({
  defaultLayout: 'layout',
  extname: '.hbs',
  handlebars: allowInsecurePrototypeAccess(Handlebars),

  //create custom helpers
  helpers:{
    maxItems:function(arg,context,options){
      items=[]
      if(context.length<=arg)
        limit=context.length
      else
        limit=arg
      for (var i = 0;i<limit; i++) {
         items.push(options.fn(context[i]));
      }
      item=items.join(' ')
      return item;
    },
    ifEquals: function(arg1, arg2, options) {
      return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    },
      ifCond: function (v1, operator, v2, options) {
          switch (operator) {
              case '==':
                  return (v1 === v2) ? options.fn(this) : options.inverse(this);
              case '===':
                  return (v1 === v2) ? options.fn(this) : options.inverse(this);
              case '!=':
                  return (v1 !== v2) ? options.fn(this) : options.inverse(this);
              case '!==':
                  return (v1 !== v2) ? options.fn(this) : options.inverse(this);
              case '<':
                  return (v1 < v2) ? options.fn(this) : options.inverse(this);
              case '<=':
                  return (v1 <= v2) ? options.fn(this) : options.inverse(this);
              case '>':
                  return (v1 > v2) ? options.fn(this) : options.inverse(this);
              case '>=':
                  return (v1 >= v2) ? options.fn(this) : options.inverse(this);
              case '&&':
                  return (v1 && v2) ? options.fn(this) : options.inverse(this);
              case '||':
                  return (v1 || v2) ? options.fn(this) : options.inverse(this);
              default:
                  return options.inverse(this);
          }
  }
  }
})

// view engine setup
app.engine('.hbs',hbs.engine);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Server Start Notification
app.listen(3000, () => console.log("Server Started on port 3000..."));

// Set Static Folder Path
app.use('/public', express.static(path.join(__dirname, 'public')));




app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(validator());
app.use(cookieParser());
app.use(session({
  secret: 'mysupersecret',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({mongooseConnection: mongoose.connection}),
  cookie: {maxAge: 100*60*1000}
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));


app.use(function(req, res, next) {
  res.locals.login = req.isAuthenticated();
  res.locals.session = req.session;
  next();
});

// Get Index Page Request
app.get ('/', (req, res) => {
    res.render(config.theme);
});
// Post Email Request
app.post('/send', (req, res) => {

    // Email Template
    const output = `
        <p>You have a message</p>
        <h3>Contact Details</h3>
        <p>Name: ${req.body.name}</p>
        <p>Email: ${req.body.email}</p>
        <h3>Message</h3>
        <p>${req.body.message}</p>
    `;

    // Alert if successfully sending email
    const successAlert = `
        <div class="alert alert-success alert-dismissible fade show" role="alert">
      <span class="alert-inner--icon"><i class="ni ni-like-2"></i></span>
      <span class="alert-inner--text"><strong>Success!</strong> Message has been Sent.</span>
      <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    `;

    // Alert if failed to sending email
    const failAlert = `
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
      <span class="alert-inner--icon"><i class="ni ni-support-16"></i></span>
      <span class="alert-inner--text"><strong>Failed!</strong> Please Refresh this Page.</span>
      <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    `;


    // Use this is you want to use Gmail SMTP
     let transporter = nodemailer.createTransport(
             `smtps://${config.user}:${config.pass}@smtp.gmail.com`
     );

    // Setup email settings
    let mailOptions = {
            from: config.from,
            to: config.to,
            subject: config.subject,
            html: output
    };

    // Send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                    res.render(config.theme, {msg: failAlert});
            }

            res.render(config.theme, {msg: successAlert});
    });
});

app.use('/classroom', classrouter);
app.use('/user', userRouter);
app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

port= process.env.PORT ||   3000
app.listen(port, '0.0.0.0',function(err){
  if(err){
    console.log(err)
  }
  else{
    console.log("Listening to port:",port)
  }
})


module.exports = app;
