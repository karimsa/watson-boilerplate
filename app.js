'use strict';

import rc from 'rc';
import fs from 'fs';
import path from 'path';
import express from 'express';
import nextPort from 'next-port';
import watson from 'watson-developer-cloud';

var app = express(),

    // it is better to be saving your credentials into the
    // rc file rather than have them in the code for deployment
    credentials = rc('credentials', {
      version: 'v1',
      url: 'https://stream.watsonplatform.net/speech-to-text/api',
      username: '<username>',
      password: '<password>'
    }),

    // authorizing with watson allows us to fetch the websocket
    // tokens we need to use the speech-to-text
    authorization = watson.authorization(credentials),

    // https allows the on-page javascript to reload the webspeech api
    // without client interaction. otherwise every time our watson session
    // expires, we have to request mic access again.
    https = require('https').createServer({
      // bad code? yes.
      // do i care? no.

      cert: fs.readFileSync(path.resolve(__dirname, 'ssl', 'server.crt'), 'utf8'),
      key: fs.readFileSync(path.resolve(__dirname, 'ssl', 'server.key'), 'utf8')
    }, app);

// watson token fetcher
app.get('/token', function (req, res) {
  authorization.getToken({
    url: credentials.url
  }, function(err, token) {
    if (err) {
      console.log('error:', err);
      res.status(err.code);
    }

    res.send(token);
  });
});

// custom handler
app.use(function (req, res) {
  // use index.html as the default homepage
  res.sendFile(path.resolve(__dirname, req.path === '/' ? 'index.html' : req.path.substr(1)));
});

// setup event handlers
https.on('error', function (err) {
  console.error(err);
  process.exit(-1);
});

// if provided from the environment, we can
// go ahead and use that
if (process.env.PORT !== undefined) {
  https.listen(process.env.PORT, function () {
    console.log('listenining on https://localhost:%s/', process.env.PORT);
  });
}

// otherwise we can do a scan for the next
// available port
nextPort(function (err, port) {
  if (err) {
    console.error(err);
    process.exit(-1);
  }

  https.listen(port, function () {
    console.log('listenining on https://localhost:%s/', port);
  });
});
