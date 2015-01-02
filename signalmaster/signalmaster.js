var yetify = require('yetify'),
    // config = require('getconfig'),
    uuid = require('node-uuid'),
    crypto = require('crypto'),
    port = parseInt(process.env.PORT || 3000);

io.sockets.on('connection', function (client) {

  function describeRoom(name) {
    var clients = io.sockets.clients(name);
    var result = {
        clients: {}
    };
    clients.forEach(function (client) {
        result.clients[client.id] = client.resources;
    });
    return result;
  }

  function safeCb(cb) {
      if (typeof cb === 'function') {
          return cb;
      } else {
          return function () {};
      }
  }

  function removeFeed(type) {
      if (client.room) {
          io.sockets.in(client.room).emit('remove', {
              id: client.id,
              type: type
          });
          if (!type) {
              client.leave(client.room);
              client.room = undefined;
          }
      }
  }

   function join(name, cb) {
      // sanity check
      if (typeof name !== 'string') return;
      // leave any existing rooms
      removeFeed();
      safeCb(cb)(null, describeRoom(name));
      client.join(name);
      client.room = name;
    }

    client.resources = {
        screen: false,
        video: true,
        audio: false
    };

    // pass a message to another id
    client.on('message', function (details) {
        if (!details) return;

        var otherClient = io.sockets.sockets[details.to];
        if (!otherClient) return;

        details.from = client.id;
        otherClient.emit('message', details);
    });

    client.on('shareScreen', function () {
        client.resources.screen = true;
    });

    client.on('unshareScreen', function (type) {
        client.resources.screen = false;
        removeFeed('screen');
    });

    client.on('join', function(name, callback){
      join(name, callback);
    });

    // we don't want to pass "leave" directly because the
    // event type string of "socket end" gets passed too.
    client.on('disconnect', function () {
        removeFeed();
    });
    client.on('leave', function () {
        removeFeed();
    });

    client.on('create', function (name, cb) {
      console.log('--------> create')
        if (arguments.length == 2) {
            cb = (typeof cb == 'function') ? cb : function () {};
            name = name || uuid();
        } else {
            cb = name;
            name = uuid();
        }
        // check if exists
        if (io.sockets.clients(name).length) {
            safeCb(cb)('taken');
        } else {
            join(name);
            safeCb(cb)(null, name);
        }
    });


    var config = {
    "isDev": true,
    "logLevel": 3,
    "server": {
        "port": 3000
    },
    "stunservers" : [
        {"url": "stun:stun.l.google.com:19302"}
    ],
    "turnservers" : [
        /*
        { "url": "turn:192.158.29.39:3478?transport=udp",
          "secret": "turnserversharedsecret"
          "expiry": 86400 }
          */
    ]
    }


    // tell client about stun and turn servers and generate nonces
    client.emit('stunservers', config.stunservers || []);

    // create shared secret nonces for TURN authentication
    // the process is described in draft-uberti-behave-turn-rest
    // var credentials = [];
    // config.turnservers.forEach(function (server) {
    //     var hmac = crypto.createHmac('sha1', server.secret);
    //     // default to 86400 seconds timeout unless specified
    //     var username = Math.floor(new Date().getTime() / 1000) + (server.expiry || 86400) + "";
    //     hmac.update(username);
    //     credentials.push({
    //         username: username,
    //         credential: hmac.digest('base64'),
    //         url: server.url
    //     });
    // });
    var credentials = [];
    credentials.push({
      username: '28224511:1379330808',
      credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
      url: 'turn:192.158.29.39:3478?transport=udp'
    })
    client.emit('turnservers', credentials);
});

// if (config.uid) process.setuid(config.uid);
// console.log(yetify.logo() + ' -- signal master is running at: http://localhost:' + port);
//====SOCKET.IO SERVER server==============================
