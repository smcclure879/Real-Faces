/**
 * @author mrdoob / http://mrdoob.com/
 */
// WARNING: This vendor file has been heavily modified
// consider moving from vendor directory
THREE.PointerLockControls = function ( camera, sceneVars, positiveBoundaryX, negativeBoundaryX, positiveBoundaryZ, negativeBoundaryZ, wallList, mirrorCompatible) {

  var scope = this;

  camera.rotation.set( 0, 0, 0 );

  var pitchObject = new THREE.Object3D();
  pitchObject.add( camera );

  var yawObject = new THREE.Object3D();
  yawObject.position.y = sceneVars.playerStartHeight;
  //createPlayerScreen(yourID);
  yawObject.add( pitchObject );

  if (mirrorCompatible){
    var you = createYourPlayerScreen();
    var walking = false;
    yawObject.add(you);
  }


  var moveForward = false;
  var moveBackward = false;
  var moveLeft = false;
  var moveRight = false;
  var moveUp = false;
  var moveDown = false;
  var turnLeft = false;
  var turnRight = false;

  var isOnObject = false;
  var canJump = false;

  var prevTime = performance.now();

  var velocity = new THREE.Vector3();

  var PI_2 = Math.PI / 2;

  var getTranslation = function(){
    var position = {
      x: yawObject.position.x,
      y: yawObject.position.y,
      z: yawObject.position.z,
    }
    var rotation = {
      x: pitchObject.rotation.x,
      y: yawObject.rotation.y
    }

    //console.log('yaw/pitch objs',yawObject, pitchObject)

    return {position:position, rotation:rotation};
  };

  var rotated = false;
  
  
  
  
  
  var onOrientationMove = function ( event ) {  
	
	//some stuff we just cannot handle....
    //if ( scope.enabled === false ) return;
	var movement = event.detail;
	if (!movement) //non-existent...
		return;
	var margin = 0.04;  //too small...
	if (Math.abs(movement.dx + movement.dy) < margin)
		return;

	//else it's a "real" rotation		
	rotated = true;

	yawObject.rotation.y -= movement.dx * 0.002;
	pitchObject.rotation.x -= movement.dy * 0.002;

	pitchObject.rotation.x = Math.max( - PI_2, Math.min( PI_2, pitchObject.rotation.x ) );

  };


  //associate tablet buttons...
  //bugbug instead of all these move & turn binary variables, consider the logic in first version, which had a struct for what actions being done right now...
  associateButtons({	'textChat':
							function() { playerEvents.emitEvent('start_chat_typing'); },
						'moveLeft':
							function() { moveLeft=true; setTimeout( function(){ moveLeft=false; },80); },
						'moveRight':
							function() { moveRight=true; setTimeout( function(){ moveRight=false; },80); },
						'moveForward':
							function() { moveForward=true; setTimeout( function(){ moveForward=false; },80); },
						'moveBack':
							function() { moveBackward=true; setTimeout( function(){ moveBackward=false; },80); }
							
					});
  






  var onKeyDown = function ( event ) {

    switch ( event.keyCode ) {

      case 38: // up arrow
        turnUp = true;
        break;
      case 87: // w
        moveForward = true;
        break;

      case 37: // left arrow
        turnLeft = true;
        break;
      case 65: // a
        moveLeft = true;
        break;

      case 40: // down arrow
        turnDown = true;
        break;
      case 83: // s
        moveBackward = true;
        break;

      case 39: // right arrow
        turnRight = true;
        break;
      case 68: // d
        moveRight = true;
        break;

      case 32: // space
        if ( canJump === true ) velocity.y += 180;
          canJump = false;
        break;

      //press p to re-request webcam
      case 80: // p
        realFaces.webrtc.webrtc.startLocalVideo();
        break;
    }

  };

  var onKeyUp = function ( event ) {

    switch( event.keyCode ) {

      case 38: // up
        turnUp = false;
        break;
      case 87: // w
        moveForward = false;
        break;

      case 37: // left
        turnLeft = false;
        break;
      case 65: // a
        moveLeft = false;
        break;

      case 40: // down
        turnDown = false;
        break;
      case 83: // s
        moveBackward = false;
        break;

      case 39: // right
        turnRight = false;
        break;
      case 68: // d
        moveRight = false;
        break;

      case 84: //T for talk
        playerEvents.emitEvent('start_chat_typing');
        break;

    }

  };

  this.prepControls=function(canvas) {
      this.touchControl = new TouchControl(canvas);
	  canvas.addEventListener( 'mytouchmove', onOrientationMove, false);  //handles mouse also.  bugbug name event better?
  
	  
	  
	  document.addEventListener( 'keydown', onKeyDown, false );
	  document.addEventListener( 'keyup', onKeyUp, false );
  };

  this.enabled = false;

  this.getObject = function () {

    return yawObject;

  };

  this.isOnObject = function ( boolean ) {

    isOnObject = boolean;
    canJump = boolean;

  };



  //I believe this gets direction of other object relative to the camera
  this.getDirection = function() {

    // assumes the camera itself is not rotated

    var direction = new THREE.Vector3( 0, 0, -1 );
    var rotation = new THREE.Euler( 0, 0, 0, "YXZ" );

    return function( v ) {

      rotation.set( pitchObject.rotation.x, yawObject.rotation.y, 0 );

      v.copy( direction ).applyEuler( rotation );

      return v;

    }

  }();



  this.update = function () {


    var jumped = false;


    //if ( scope.enabled === false ) return;
    if (!realFaces) return;
    if (!realFaces.THREE) return;

    
    var time = performance.now();
    var delta = ( time - prevTime ) / 1000;


    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;

    velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

    //make sure character position is within boundary, reset it to outer edge if it is not
    // if ( yawObject.position.z > positiveBoundary){
    //   yawObject.position.z  = positiveBoundary;
    // } else if (yawObject.position.z < negativeBoundary ){
    //   yawObject.position.z  = negativeBoundary;
    // } else if ( yawObject.position.x > positiveBoundary){
    //   yawObject.position.x  = positiveBoundary;
    // } else if (yawObject.position.x < negativeBoundary ){
    //   yawObject.position.x  = negativeBoundary;
    // }

    //default is 400
    var speed = sceneVars.playerSpeed;
    //add velocity to your character if key is pressed
    if ( moveForward ) velocity.z -= speed * delta;
    if ( moveBackward ) velocity.z += speed * delta;

    if ( moveLeft )  velocity.x -= speed * delta;
    if ( moveRight ) velocity.x += speed * delta;
	

	//bugbug likely not needed
	if ( turnLeft ) 
	{
	
	
	}
	if (turnRight)
	{
	
	}
	

    // Min velocity is enabled to prevent insignificant movements from being broadcast
    // Max velocity is a work around for the after pause teleport bug in PointerLock vendor code
    if (Math.abs(velocity.x) < 0.001  || Math.abs(velocity.x) > 300 || Math.abs(velocity.x * delta) > 50) velocity.x = 0;
    if (Math.abs(velocity.y) < 0.001  || Math.abs(velocity.y) > 500 || Math.abs(velocity.y * delta) > 250) velocity.y = 0;
    if (Math.abs(velocity.z) < 0.001  || Math.abs(velocity.z) > 300 || Math.abs(velocity.z * delta) > 50) velocity.z = 0;

    if (mirrorCompatible){
      if (Math.abs(velocity.x) > 1 || Math.abs(velocity.y) > 100 || Math.abs(velocity.z) > 1){

        if (!walking){
          you.startWalking();
          walking = true;
        }

      }else{

        if(walking){
          you.stopWalking();
        }
        walking = false;
      }

      you.update();

    }


    if ( isOnObject === true ) {

      velocity.y = Math.max( 0, velocity.y );

    }

    var originalX = yawObject.position.x;
    var originalZ = yawObject.position.z;


    yawObject.translateX( velocity.x * delta );
    yawObject.translateY( velocity.y * delta );
    yawObject.translateZ( velocity.z * delta );

    

    var overlappedPlayerPosition = realFaces.THREE.findOtherPlayerCollision(yawObject.position.x, yawObject.position.z);

    if (overlappedPlayerPosition){

      //console.log('overlap', overlappedPlayerPosition);

      var xzTuple = realFaces.THREE.findCollisionZoneEdge(overlappedPlayerPosition, yawObject.position);

      yawObject.position.setX(xzTuple[0]);
      yawObject.position.setZ(xzTuple[1]);

    }

    var wallCollisionPoint = realFaces.THREE.isWallCollision(yawObject.position.x, yawObject.position.z, wallList);

    if (wallCollisionPoint){

      //console.log('mesh collision found')
      yawObject.position.setX(wallCollisionPoint[0]);
      yawObject.position.setZ(wallCollisionPoint[1]);

    }

    wallCollisionPoint = realFaces.THREE.isWallCollision(yawObject.position.x, yawObject.position.z, wallList);

    if (wallCollisionPoint){

      yawObject.position.setX(wallCollisionPoint[0]);
      yawObject.position.setZ(wallCollisionPoint[1]);

    }

    var crossedOuterBoundary = realFaces.THREE.isOutsideBoundary(yawObject.position.x, yawObject.position.z, positiveBoundaryX, negativeBoundaryX, positiveBoundaryZ, negativeBoundaryZ);

    if (crossedOuterBoundary){

      yawObject.position.setX(crossedOuterBoundary[0]);
      yawObject.position.setZ(crossedOuterBoundary[1]);

    }

    if ( yawObject.position.y < realFaces.THREE.sceneVars.playerStartHeight ) {

      velocity.y = 0;
      yawObject.position.y = realFaces.THREE.sceneVars.playerStartHeight;

      if (!canJump)
        jumped = true;

      canJump = true;

    }

    prevTime = time;

    if (velocity.x !== 0 || velocity.y !== 0 || velocity.z !== 0 || rotated || jumped){

      var translation = getTranslation();
      playerEvents.emitEvent('player_movement', [translation]);
      //socket.emit('movement', velocity);
      rotated = false;
    }

  };

};


function cancelBubble(e) {
  var evt = e ? e:window.event;
  if (evt.stopPropagation)    
	evt.stopPropagation();
  if (evt.cancelBubble!=null) 
	evt.cancelBubble = true;
}



function associateButtons(buttonMap)
{
	for (var buttonName in buttonMap)
	{
		var action=buttonMap[buttonName];
		document.getElementById(buttonName).addEventListener('click',action);
	}
}




//-----------------  new file ??  bugbug
//class...
function TouchControl(canvas)
{
	var that = this;
	canvas.addEventListener( 'touchstart', that.onTouchStart.bind(that), false );
	canvas.addEventListener( 'touchmove', that.onTouchMove.bind(that), false );
	canvas.addEventListener( 'touchend', that.onTouchEnd.bind(that), false );
	canvas.addEventListener( 'mousemove', that.onMouseMove.bind(that), false);
	
	//atempt to remove those nasty context menus on the right mouse, since it's orientation instead
	//var ignoreRightMouse = that.ignoreRightMouse.bind(that);  //bugbug think the global is OK???
	canvas.addEventListener( 'mousedown', ignoreRightMouse, false ); 
	canvas.addEventListener( 'mouseup', ignoreRightMouse, false );
	canvas.addEventListener( 'click', ignoreRightMouse, false );
	
	this.tracker = {};
	this.canvas = canvas;
}


TouchControl.prototype.onTouchStart = function ( event )
{
	event.preventDefault();
	var tch = event.changedTouches[0];
	this.updatePosition(tch);
}

TouchControl.prototype.onTouchMove = function ( event )
{
	event.preventDefault();
	var tch = event.changedTouches[0];
	var id = this.getId(tch);
	var old = this.tracker[id];
	var detail = {dx:tch.pageX-old.x, dy:tch.pageY-old.y};	
	var event = new CustomEvent('mytouchmove',{detail:detail});
	this.updatePosition(tch);
	this.canvas.dispatchEvent(event);
}

TouchControl.prototype.onTouchEnd = function ( event )
{
	//bugbug consolidate code with other base-level touch event handlers
	event.preventDefault();
	var tch = event.changedTouches[0];
	var id = this.getId(tch);
	var old = this.tracker[id];
	var detail = {dx:tch.pageX-old.x, dy:tch.pageY-old.y};	
	var event = new CustomEvent('mytouchmove',{detail:detail});
	//this.updatePosition(tch);
	this.canvas.dispatchEvent(event);
	delete this.tracker[event.id];
}


TouchControl.prototype.onMouseMove = function ( event ) {
	//if not exactly the right mouse down, then ignore
	if ( event.button != 2 ) 
		return;
	
	var detail = interpretMouseMovement(event);
	var event = new CustomEvent('mytouchmove',{detail:detail});
	
	this.canvas.dispatchEvent(event);
};



  
//bugbug make internal??
TouchControl.prototype.updatePosition = function ( tch ) 
{
    //a touch from touchEvent.changedTouches[0]
	var id = this.getId(tch);
	this.tracker[id] = {x:tch.pageX, y:tch.pageY};
}


// var interpretTouchMovement = function ( event ) {
  // return {
			// x: event.changedTouches[0].pageX,
			// y: event.changedTouches[0].pageY
		// };  
// };


// function Movement(x,y)
// {
	// this.x=x;
	// this.y=y;
// }

// function MovementFromEvent(event)
// {
	
// }


  
TouchControl.prototype.getId = function (tch) {
	return tch.identifier;
}


var interpretMouseMovement = function ( event ) {
	return {					
			dx: event.movementX || event.mozMovementX || event.webkitMovementX || 0,
			dy: event.movementY || event.mozMovementY || event.webkitMovementY || 0
		};  
};


var ignoreRightMouse = function ( event ) {

if (event.button==2)
{
	cancelBubble(event);
	event.preventDefault();
	return false;
}

};