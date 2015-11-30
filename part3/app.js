'use strict';

/**
 * Module dependencies.
 */

const express = require('express');
const path = require('path');

/**
 * Create Express server.
 */

const app = express();

/**
 * Socket
 */

const server = require('http').Server(app);
const io = require('socket.io')(server);

/**
 * Socket
 */

io.on('connection', function(socket) {
  socket.on('message', function(message) {
    socket.broadcast.emit('message', message);
  });
});

/**
 * Express configuration.
 */

app.set('port', process.env.PORT || 3000);
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, '..')));

try {

  /**
   * Main routes.
   */
  app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
  });

} catch (error) {
  console.error(error.message);
}

/**
 * Start Express server.
 */

server.listen(app.get('port'), function() {
  console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
});

module.exports = app;
