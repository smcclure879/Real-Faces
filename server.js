var express = require("express"),
   server = express(),
   http = require("http").createServer(server),
   bodyParser = require("body-parser"),
   io = require("socket.io").listen(http),
   // _ = require("underscore"),
   port = (process.env.PORT || 8081);
   

/* Server config */

//Server's IP address
server.set("ipaddr", "0.0.0.0");

//Server's port number
server.set("port", port);

//Specify the views folder
server.set("views", __dirname + "/views");

//View engine is Jade
server.set("view engine", "jade");

//Specify where the static content is
server.use(express.static("static", __dirname + "/static"));

//Tells server to support JSON requests
server.use(bodyParser.json());

///////////////////////////////////////////
//              Socket.io                //
///////////////////////////////////////////

//translations middleware file: create event listeners at /translations namespace
require('./sockets/translations.js')(io);

//rtc signalmaster middleware file: create event listeners at /signalmaster namespace
require('./sockets/signalmaster.js')(io);

///////////////////////////////////////////
//              Routes                   //
///////////////////////////////////////////

server.get('/', function(req,res){
  console.log('about to use index !!!!! ip='+req.connection.remoteAddress);
  res.render('index.jade', {
    locals : {
              title : 'Your Page Title'
             ,description: 'Your Page Description'
             ,author: 'Your Name'
             ,analyticssiteid: 'XXXXXXX'
            }
  });
});

server.get('/About', function(req,res){
  res.render('pages/About.jade', {
    locals : {
              title : 'About'
             ,description: 'About Real Faces'
             ,author: 'Your Name'
             ,analyticssiteid: 'XXXXXXX'
            }
  });
});

server.get('/Problems', function(req,res){
  res.render('pages/Problems.jade', {
    locals : {
              title : 'Problems'
             ,description: 'About Real Faces'
             ,author: 'Your Name'
             ,analyticssiteid: 'XXXXXXX'
            }
  });
});

server.get('/Contact', function(req,res){
  res.render('pages/Contact.jade', {
    locals : {
              title : 'Contact'
             ,description: 'About Real Faces'
             ,author: 'Your Name'
             ,analyticssiteid: 'XXXXXXX'
            }
  });
});


server.get('/Outdoors', function(req,res){
  console.log('in normal')

  res.render('pages/Outdoors.jade', {
    locals : {
              title : 'Your Page Title'
             ,description: 'Your Page Description'
             ,author: 'Your Name'
             ,analyticssiteid: 'XXXXXXX'
            }
  });
});

server.get('/Outdoors-*', function(req,res){
    console.log('in private');
    console.log('bugbug steve it worked!!');
    res.render('pages/Outdoors.jade', {
    	locals : {
            title : 'Your Page Title'
            ,description: 'Your Page Description'
            ,author: 'Your Name'
            ,analyticssiteid: 'XXXXXXX'
        }
    });
});

server.get('/UnionSquare', function(req,res){
    res.render('pages/UnionSquare.jade', {
	locals : {
            title : 'Your Page Title'
            ,description: 'Your Page Description'
            ,author: 'Your Name'
            ,analyticssiteid: 'XXXXXXX'
        }
    });
});

server.get('/UnionSquare-*', function(req,res){
    res.render('pages/UnionSquare.jade', {
	locals : {
            title : 'Your Page Title'
            ,description: 'Your Page Description'
            ,author: 'Your Name'
            ,analyticssiteid: 'XXXXXXX'
        }
    });
});

server.get('/ArtGallery', function(req,res){
    res.render('pages/ArtGallery.jade', {
	locals: {
            title : 'Your Page Title'
            ,description: 'Your Page Description'
            ,author: 'Your Name'
            ,analyticssiteid: 'XXXXXXX'
	}
    });
});

server.get('/ArtGallery-*', function(req,res){
  res.render('pages/ArtGallery.jade', {
    locals : {
              title : 'Your Page Title'
             ,description: 'Your Page Description'
             ,author: 'Your Name'
             ,analyticssiteid: 'XXXXXXX'
            }
  });
});





server.post('/ENTRY*', function(req,res){

    console.log('received update from another meshite');
    console.log(req.body);

    res.render('pages/Contact.jade', {     //FOR NOW A WRONG PAGE, bugbug
    locals : {
              title : 'bugbug'
             ,description: 'bugbug'
             ,author: 'bugbug'
             ,analyticssiteid: 'bugbug'
            }
  });
});





//A Route for Creating a 500 Error (Useful to keep around)
server.get('/500', function(req, res){
    throw new Error('This is a 500 Error');
});

//The 404 Route (ALWAYS Keep this as the last route)
server.get('/*', function(req, res){
    res.data = "hi there bugbug";
    console.log(req.data);
    console.log("that was req.data, this is 404 route bugbug");
    console.log(req.url);
    //throw new NotFound(req);  //bugbug ignore for now
});

function NotFound(msg){
    this.name = 'NotFound';
    console.log('notfound'+msg)
    Error.call(this, msg);
    Error.captureStackTrace(this, arguments.callee);
}

http.listen(server.get("port"), server.get("ipaddr"), function() {
  console.log("Server up and running. Go to http://" + server.get("ipaddr") + ":" + server.get("port"));
});
