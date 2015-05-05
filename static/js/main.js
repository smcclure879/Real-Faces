//construct main app object
//can load its own webRTC dependency
var RealFaces = function(sceneName){
  //will load webRTC deps on event, set to be called when THREE.js scene is done rendering
  this.roomName = location.pathname;


  //document.getElementById('roomURL').innerHTML = "realfaces.org" + location.pathname + " <br> Share this URL with your friends so they can join your room!"


  playerEvents.addListener('start_webRTC', this.initWebRTC);

  //construct THREE.js renderer
  if(sceneName === 'ArtGallery'){
    this.THREE = new RealTHREE(-150, 100, -100, 50, true);
  }else{
    this.THREE = new RealTHREE();
  }

  //activate pointer lock
  //this.THREE.pointerLock();

  //construct scene based on url
  this.THREE.createScene(sceneName);
  //e.g.
  //realFaces.THREE.createSceneOutdoor();
  //realFaces.THREE.createSceneUnionSquare();

  //start animations
  this.THREE.animate(this.THREE);

  this.socket = new RealSocket(this);

  playerEvents.addListener('new_player', this.socket.createPlayerScreen);

  playerEvents.addListener('remove_player', this.socket.removePlayer);

  playerEvents.addListener('teleport_other_player', this.socket.teleportPlayer);

  playerEvents.addListener('move_other_player', this.socket.movePlayer);

  playerEvents.addListener('player_movement', this.socket.storePlayerTranslation);

  //after event listeners are set, tell server to send back self data
  this.socket.socketio.emit('player_join');
};

RealFaces.prototype.initWebRTC = function(clientID, context){
  context.webrtc = new RealWebRTC(clientID);
};





//bugbugSOON
//with no wifi...look what happens... dev issue mainly...
// Failed to load resource: net::ERR_INTERNET_DISCONNECTED
// 2http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js Failed to load resource: net::ERR_INTERNET_DISCONNECTED
// http://localhost:8081/js/libs/jquery-1.7.1.min.js Failed to load resource: the server responded with a status of 404 (Not Found)

// LIKELY SUSPECTS.....
// views\layout.jade:30:        script(src='//ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js')
// views\pages\ArtGalleryLayout.jade:28:        script(src='//ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.m
// in.js')
// views\pages\layout.jade:29:        script(src='//ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js')
// views\pages\OutdoorsLayout.jade:28:        script(src='//ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min
// .js')
// views\pages\UnionSquareLayout.jade:28:        script(src='//ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.
// min.js')


