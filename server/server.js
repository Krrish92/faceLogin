const http = require('http');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
var cookieParser = require("cookie-parser");
const crypto = require("crypto");
const path = require("path");
const mongoUtil = require('./mongoUtill');
const mongoSanitize = require('express-mongo-sanitize');

// PORT assign
const PORT = process.env.PORT || 8080;
const message = `Server is running on PORT:${PORT}.`;

// Init express
const app = express();

// Attach session
app.use(cookieParser());
// set a cookie
app.use(function (req, res, next) {
  console.log(req.path)
  var cookie = req.cookies.uuid;
  if (cookie === undefined) {
    var uuid = crypto.randomBytes(16).toString("hex");
    res.cookie('uuid', uuid, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true });
  }
  next();
});

// API monitoring
app.use(morgan('dev'));
app.use(express.static('../client'));
// CORS handler
const whitelist = ['http://localhost:8080'];
const corsOptions = {
  origin: (origin, callback) => {
    console.log(origin, 'origin');
    if (whitelist.indexOf(origin) !== -1 || origin === undefined || origin.match(/chrome-extension/i)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTION',
  credentials: true,
  exposedHeaders: ['x-auth-token'],
  maxAge: 86400,
  preflightContinue: true,
};
app.use(cors(corsOptions));
app.use(express.urlencoded({
  limit: '50mb',
  extended: true,
}));
app.use(express.json({
  limit: '50mb',
}));

app.use(mongoSanitize());

mongoUtil.coonectToMongooseDbServer();
mongoUtil.connectToDBServer(function () {
  console.log("Coonected with mongoclient")
  require('./routes').routes(app);
  //create server
  const server = http.createServer(app);
  server.listen(PORT, () => {
    console.log("Server is running on " + PORT);
  })
});


//testing server
app.get('/test', (req, res) => res.send(message));

app.get("/", (req, res) => {
  res.sendFile(path.resolve(`../client/index.html`))
});
// // Restiction router
// app.all('*', (req, res) => res.status(404).send(`Access denied`));
