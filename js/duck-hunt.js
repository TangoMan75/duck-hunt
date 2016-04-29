//==================================================
// DUCK HUNT
//==================================================

/**
 * @version        1.0.2
 * @lastmodified   20:03 21/03/2016
 * @author         Matthias Morin <matthias.morin@gmail.com>
 * @purpose        Duck Hunt is a remix of the famous vintage nintendo nes game in jQuery
 * @requires       jQuery
 * @link           http://icerpdc.free.fr
 */

// Defines possible coordonates to spawn ducks
var gintMaxX = $(window).width();
var gintMinX = 0;
var gintMaxY = $(window).height();
var gintMinY = 0;

$Screen = $("#screen");
$Screen.width(gintMaxX);
$Screen.height(gintMaxY);

// Redefines possible coordonates to spawn ducks on window resizing
$(window).resize(function(){
	var gintMaxX = $(window).width();
	var gintMaxY = $(window).height();
	$Screen.width(gintMaxX);
	$Screen.height(gintMaxY);
})

// Ducks are unselectable
$("body").addClass("unselectable");

// Initiates duck properties
var gintDuckWidth  = 130;
var gintDuckHeight = 104;
var gintDuckIndex  = 0;

// **************************************************
// Game settings
// **************************************************

// Sets player shots to 0
var gintShots = 0;

// Sets player hits to 0
var gintHits = 0;

// Sets player score to 0
var gintScore = 0;

// Sets player life to 3
var gintLife = 3;
$("#life").html("Life : " + gintLife);

// **************************************************

// Listening to click event on screen
$Screen.on("mousedown", function(){
	fnPlaySound();

	// Updates score hud
	$("#shots").html("Shots&nbsp;:&nbsp;" +(gintShots += 1));
});

// Listening to keypress event on screen
$(window).on("keypress", function(){
	fnDebug();
});

// **************************************************
// Init
// **************************************************

gintLevel = 0;
fnStartNewLevel();



//==================================================
// ANIMATIONS
//==================================================


//--------------------------------------------------
// fnFlyAway v1.0.4
//--------------------------------------------------


function fnFlyAway($Duck){
/**
 * @version        1.0.4
 * @lastmodified   22:58 19/03/2016
 * @category       Animations
 * @purpose        Makes duck fly away
 * @param          $Duck as jQuery object
 * @assumes        $("#life"), gintLife
 * @requires       jQuery
 * @uses           fnLookCorrectDirection, fnRandInt, fnGameOver, fnStartNewLevel
 * @note           When duck successfully flies away, player loses life, and hud is updated
 */

	// Exept if duck is dead
	if(!$Duck.hasClass("dead")){
		$Duck
			.stop()
			.addClass("flying-away");

		// Duck flies away randomly left or right
		intX = fnLeftOrRight($Duck);
		fnLookCorrectDirection($Duck, intX);

		// Duck flies away randomly up and down the y axis
		intY = fnRandInt(gintMinY, gintMaxY);
		intDuration = fnRandInt(1000, 4000);

		// Animates duck
		$Duck.animate({
			"left" : intX, 
			"top"  : intY,
		}, intDuration, "swing", function(){

			// When duck flies out of the screen
			$Duck.remove();

			// Player loses life
			$("#life").html("Life : " +(gintLife -= 1));

			// Game over when player life points gone
			if(gintLife <= 0){
				fnGameOver();

			// All ducks are gone but player still has life points left
			} else if (!$Screen.children().hasClass("alive")){
				fnStartNewLevel();
			}
		});
	}
}



//--------------------------------------------------
// fnKillDuck v1.0.3
//--------------------------------------------------


function fnKillDuck($Duck){
/**
 * @version        1.0.3
 * @lastmodified   23:00 19/03/2016
 * @category       Animations
 * @purpose        Kills duck, starts new level when no more ducks alive
 * @param          $Duck as jQuery object
 * @assumes        gintMaxY
 * @requires       jQuery, img/duck-dead.gif
 * @uses           fnStartNewLevel
 */

	// Changes duck properties
	$Duck
		.stop()
		.addClass("dead")
		.attr("src", "img/duck-dead.gif");
	
	// Makes duck fall
	$Duck.animate({
		"top" : gintMaxY + $Duck.height(),

	}, 1000, function(){

		// Kills and removes duck
		$Duck.removeClass("alive");
		$Duck.remove();

		// Starts new level when no more ducks alive
		if(!$Screen.children().hasClass("alive")){
			fnStartNewLevel();
		}
	});
}



//--------------------------------------------------
// fnLeftOrRight v1.0.4
//--------------------------------------------------


function fnLeftOrRight($Duck){
/**
 * @version        1.0.4
 * @lastmodified   23:01 19/03/2016
 * @category       Animations
 * @purpose        Spawns randomly duck on left or right side
 * @param          $Duck as jQuery object
 * @return         intX as Integer
 * @assumes        gintMaxX
 * @requires       jQuery
 */

	intLeftOrRight = Math.round(Math.random());

	// Left side
	if(intLeftOrRight == 0){
		intX =(intLeftOrRight*gintMaxX)-$Duck.width();
	}

	// Right side
	else{
		intX =(intLeftOrRight*gintMaxX)+$Duck.width();
	}
	return intX;
}



//--------------------------------------------------
// fnLookCorrectDirection v1.0.3
//--------------------------------------------------


function fnLookCorrectDirection($Duck, intX){
/**
 * @version        1.0.3
 * @lastmodified   00:35 21/03/2016
 * @category       Animations
 * @purpose        Makes duck look toward correct direction when moving
 * @param          $Duck as jQuery object, intX as Integer
 * @requires       jQuery, img/duck-right.gif, img/duck-left.gif
 */

	// Gets duck horizontal position (parseInt is required to convert value from string to integer)
	intOldX = parseInt($Duck.css("left"), 10);

	// Ducks look right when moving right
	if(intX > intOldX){
		$Duck.attr("src", "img/duck-right.gif");
	}
	// Ducks look left when moving left
	else{
		$Duck.attr("src", "img/duck-left.gif");
	}
}



//--------------------------------------------------
// fnMoveDuck v1.0.2
//--------------------------------------------------


function fnMoveDuck($Duck, intX, intY, intDuration){
/**
 * @version        1.0.2
 * @lastmodified   23:02 19/03/2016
 * @category       Animations
 * @purpose        Makes duck move around
 * @param          $Duck as jQuery object, intX as Integer, intY as Integer, intDuration as Integer
 * @requires       jQuery
 * @uses           fnLookCorrectDirection, fnRandomMove
 * @note           Call back
 */

	fnLookCorrectDirection($Duck, intX);

	$Duck.animate({
		"left" : intX, 
		"top"  : intY,
	}, intDuration, "swing", function(){

		// Duck will keep moving around randomly
		fnRandomMove($Duck)}
	);
}



//--------------------------------------------------
// fnRandomMove v1.0.3
//--------------------------------------------------


function fnRandomMove($Duck){
/**
 * @version        1.0.3
 * @lastmodified   23:03 19/03/2016
 * @category       Animations
 * @purpose        Moves duck to random coordonates on screen
 * @param          $Duck as jQuery object
 * @assumes        gintMaxX, gintMaxY
 * @requires       jQuery
 * @uses           fnRandInt, fnMoveDuck
 */

	// Defines max coordonates inside the screen according to duck size
	intMaxX = gintMaxX-$Duck.width();
	intMaxY = gintMaxY-$Duck.height();

	// Defines random coordonates
	intX = fnRandInt(gintMinX, intMaxX);
	intY = fnRandInt(gintMinY, intMaxY);

	// Sets random speed
	intDuration = fnRandInt(500, 2000);
	fnMoveDuck($Duck, intX, intY, intDuration);
}



//--------------------------------------------------
// fnSplatter v1.0.4
//--------------------------------------------------


function fnSplatter($Duck){
/**
 * @version        1.0.4
 * @lastmodified   00:35 21/03/2016
 * @category       Animations
 * @purpose        Displays a blood slatter on duck coordonates
 * @param          $Duck as jQuery object
 * @assumes        $Screen
 * @requires       jQuery, img/blood.gif
 * @uses           fnMakeUnselectable, fnRandInt
 */

	// Locates duck and appends blood sprite to screen
	intWidth  = $Duck.width();
	intHeight = $Duck.height();

	// parseInt is required to convert value from string to integer
	intX = parseInt($Duck.css("left"), 10)+(intWidth/2);
	intY = parseInt($Duck.css("top"), 10)+(intHeight/2);

	$Blood = $("<img>");
	fnMakeUnselectable($Blood);

	$Blood
		.addClass("splatter")
		.addClass("image")
		.attr("src", "img/blood.gif");

	// Sets Blood size
	intSize = fnRandInt(50, 150)
	$Blood.css({
		"width"  : intSize,
		"height" : intSize,
	});

	// Sets Blood position
	$Blood.css({
		"left" : intX,
		"top"  : intY,
	});

	$Screen.append($Blood);

	// Blood fade out
	$Blood.fadeOut(500, function(){
		$Blood.remove();
	});
}



//==================================================
// AUDIO
//==================================================


//--------------------------------------------------
// fnPlaySound v1.0.2
//--------------------------------------------------


function fnPlaySound(){
/**
 * @version        1.0.2
 * @lastmodified   23:03 19/03/2016
 * @category       Audio
 * @purpose        Plays gunshot sound
 */

	var gobjSound = new Audio();
	gobjSound.src = "sounds/gunshot.mp3";
	gobjSound.play();
}



//==================================================
// DEBUG
//==================================================


//--------------------------------------------------
// fnDebug v1.0.1
//--------------------------------------------------


function fnDebug(){
/**
 * @version        1.0.1
 * @lastmodified   23:04 19/03/2016
 * @category       Debug
 * @purpose        Allows to kill all ducks on screen
 * @assumes        $Screen
 * @requires       jQuery
 * @uses           fnKillDuck
 */

	$Screen.children(".alive").each(function(){
		fnKillDuck($(this));
	});
}



//==================================================
// DIALOGS
//==================================================


//--------------------------------------------------
// fnBubble v1.0.2
//--------------------------------------------------


function fnBubble($Duck, strClass, strMessage){
/**
 * @version        1.0.2
 * @lastmodified   23:04 19/03/2016
 * @category       Dialogs
 * @purpose        Displays bubble message on ducks coordonates
 * @param          $Duck as jQuery object, strClass as String, strMessage as String
 * @requires       jQuery
 */

	// Locates duck and appends sprite to screen
	intX = parseInt($Duck.css("left"), 10);
	intY = parseInt($Duck.css("top"), 10);

	// Creates bubble
	$Bubble = $("<div>");
	$Bubble
		.addClass(strClass)
		.html(strMessage);

	// Centers bubble according to duck width
	if(strClass != "bubble"){
		intX +=($Duck.width()/2)-($Bubble.width()/2);
	}

	// Sets dialog position
	$Bubble.css({
		"left" : intX,
		"top"  : intY,
	});

	// Appends bubble to screen
	$Screen.append($Bubble);

	// Changes animation according to dialog type
	switch(strClass){
		case "bubble":
			intUp = 10;
			break;
		case "score":
			intUp = 20;
			break;
		case "combo":
			intUp = 30;
			break;
		case "bonus":
			intUp = 40;
			break;
	}

	$Bubble.animate({
		"top" : intY-intUp,
	}, 500);
	$Bubble.fadeOut(700, function(){
		$Bubble.remove();
	});
}



//--------------------------------------------------
// fnDisplay v1.0.2
//--------------------------------------------------


function fnDisplay(strMessage){
/**
 * @version        1.0.2
 * @lastmodified   23:04 19/03/2016
 * @category       Dialogs
 * @purpose        Displays jumbo message
 * @param          strMessage as String
 * @assumes        $Screen
 * @requires       jQuery
 */

	intScreenHeight = $Screen.height()
	intScreenWidth  = $Screen.width()

	$Display = $("<div>");
	$Display
		.height(intScreenHeight)
		.width(intScreenWidth)
		.addClass("display")
		.css({
			"font-size" : 200,
		})
		.html(strMessage);

	$Screen.append($Display);

	// dialog animation
	$Display.animate({
		"font-size" : 200,
	}, 600);
	$Display.fadeOut(600, function(){
		$Display.remove();
	});
}



//--------------------------------------------------
// fnRandomDialog v1.0.3
//--------------------------------------------------


function fnRandomDialog(){
/**
 * @version        1.0.4
 * @lastmodified   22:29 04/04/2016
 * @category       Dialogs
 * @purpose        Returns random dialog
 * @return         strDialog as String
 * @requires       jQuery
 * @uses           fnRandInt
 */

	switch(fnRandInt(1, 5)){
		case 1:
			strDialog = "Bye !";
			break;
		case 2:
			strDialog = "See you !";
			break;
		case 3:
			strDialog = "Catch me if you can !";
			break;
		case 4:
			strDialog = "Hasta la vista baby !";
			break;
		case 5:
			strDialog = "Ciao !";
			break;
	}
	return strDialog;
}



//--------------------------------------------------
// fnScore v2.0.2
//--------------------------------------------------


function fnScore($Duck){
/**
 * @version        2.0.2
 * @lastmodified   23:06 19/03/2016
 * @category       Dialogs
 * @purpose        Computes score according to duck size and updates score hud
 * @param          $Duck as jQuery object
 * @return         intScore as Integer
 * @assumes        $("#score"), gintScore, $("#hits"), gintHits
 * @requires       jQuery
 */

	// Gets duck size 
	intHeight = $Duck.height();
	intScore  = Math.floor(13000/intHeight);

	// Updates score hud
	$("#score").html("Score&nbsp;:&nbsp;" +(gintScore += intScore));
	$("#hits").html("Hits&nbsp;:&nbsp;" +(gintHits += 1));
	return intScore;
}



//==================================================
// DOM
//==================================================


//--------------------------------------------------
// fnMakeUnselectable v1.0.3
//--------------------------------------------------


function fnMakeUnselectable(objTarget){
/**
 * @version        1.0.3
 * @lastmodified   23:07 19/03/2016
 * @category       DOM
 * @purpose        Make jQuery objects unselectable
 * @param          objTarget as Object
 * @return         false
 * @requires       jQuery
 */

	objTarget
		.addClass('unselectable')		// All these attributes are inheritable
		.attr('unselectable', 'on')		// For IE9 - This property is not inherited, needs to be placed onto everything
		.attr('draggable', 'false')		// For moz and webkit, although Firefox 16 ignores this when -moz-user-select: none; is set, it's like these properties are mutually exclusive, seems to be a bug.
		.on('dragstart', function(){ return false; });		// Needed since Firefox 16 seems to ingore the 'draggable' attribute we just applied above when '-moz-user-select: none' is applied to the CSS 

    objTarget							// Apply non-inheritable properties to the child elements
		.find('*')
		.attr('draggable', 'false')
		.attr('unselectable', 'on'); 
}



//--------------------------------------------------
// fnStopPropagation v1.0.1
//--------------------------------------------------


function fnStopPropagation(e){
/**
 * @version        1.0.1
 * @lastmodified   22:30 19/03/2016
 * @category       DOM
 * @purpose        Stops event from bubbleling to parent
 * @param          e as DOM Object
 */

	e.stopPropagation();
}



//==================================================
// GAME
//==================================================


//--------------------------------------------------
// fnGameOver v1.0.3
//--------------------------------------------------


function fnGameOver(){
/**
 * @version        1.0.3
 * @lastmodified   23:09 19/03/2016
 * @category       Game
 * @purpose        Displays game over message and stops game
 * @return         false
 * @assumes        $Screen
 * @requires       jQuery
 * @uses           fnDisplay
 */

	// Unsets mousedown event on screen
	$Screen.off("mousedown");

	// Unsets events on all remaining ducks
	$Screen.children(".alive").off();

	// Keeps them unselectable
	$Screen.children(".alive").on('dragstart', function(){ return false; });

	// Unsets timeouts on all remaining ducks
	$Screen.children(".alive").each(function(){
		window.clearTimeout($(this).attr("data-timeout"));
	});

	// Stops animation for all ducks on screen
	$Screen.children(".alive").clearQueue().stop();

	// Empties screen of all remaining ducks
	// $Screen.empty();

	// Displays "Game Over" message
	fnDisplay("GAME OVER !");
}



//--------------------------------------------------
// fnSpawnDuck v1.0.3
//--------------------------------------------------


function fnSpawnDuck($Duck, intSize, intDuration){
/**
 * @version        1.0.3
 * @lastmodified   23:12 19/03/2016
 * @category       Game
 * @purpose        Appends duck to screen, sets timeout and makes it clickable
 * @param          $Duck as jQuery object, intSize as Integer, intDuration as Integer
 * @assumes        $Screen, gintDuckWidth, gintDuckHeight, gintMinY, gintMaxY
 * @requires       jQuery
 * @uses           fnMakeUnselectable, fnLeftOrRight, fnRandInt, fnRandomMove, fnFlyAway, fnBubble, fnRandomDialog, fnScore, fnKillDuck
 * @note           This is the main part of the game architecture
 */

	// Creates duck and appends to screen
	$Duck = $("<img>");
	$Duck.addClass("image");
	$Duck.addClass("alive");
	fnMakeUnselectable($Duck);
	$Screen.append($Duck);

	// Sets random duck size
	$Duck.css({
		"width"  : gintDuckWidth*intSize,
		"height" : gintDuckHeight*intSize,
	});

	// Duck spawns randomly left or right
	intX = fnLeftOrRight($Duck);

	// Duck spawns randomly up and down the y axis
	intY = fnRandInt(gintMinY, gintMaxY);

	// Sets duck position
	$Duck.css({
		"left" : intX,
		"top"  : intY, 
	});

	// Duck will move inside screen and then go away after a random amount of time
	fnRandomMove($Duck);
	objTimeout = window.setTimeout(function(){
		fnFlyAway($Duck);
		fnBubble($Duck, "bubble", fnRandomDialog());
	}, intDuration);

	// Stores timeout id into $Duck attribute
	$Duck.attr("data-timeout", objTimeout);

	// Listens to click event on ducks
	$Duck.on("mousedown", function(){

		// Gets timeOut id from $Duck attribute
		objTimeout = $Duck.attr("data-timeout");
		window.clearTimeout(objTimeout);

		fnSplatter($Duck);
		fnBubble($Duck, "score", fnScore($Duck));
		if($Duck.hasClass("flying-away")){
			fnScore($Duck);
			fnBubble($Duck, "bonus", fnScore($Duck));
		}
		if($Duck.hasClass("dead")){
			fnBubble($Duck, "combo", "COMBO HIT !");
		}
		else{
			fnKillDuck($Duck);
		}
	});
}



//--------------------------------------------------
// fnStartNewLevel v1.0.4
//--------------------------------------------------


function fnStartNewLevel(){
/**
 * @version        1.0.4
 * @lastmodified   23:13 19/03/2016
 * @category       Game
 * @purpose        Builds new level
 * @assumes        $Screen, $("#level"), gintLevel, gintDuckIndex
 * @requires       jQuery
 * @uses           fnDisplay, fnSpawnDuck, fnRandInt
 * @note           This is another big chunk of the game architecture
 */

	// Clears screen for unremoved elements if any
	$Screen.empty();
	gintLevel++;

	// Updates level in hud
	$("#level").html("Level : " + gintLevel);
	fnDisplay("Level&nbsp;" + gintLevel);

	// Spawns ducks
	for(i=0; i<gintLevel; i++){

		// Each duck need a unique name for reference
		gintDuckIndex += 1;
		intDuckSize   = 1+Math.random();
		intTemp       = 30000/gintLevel;
		intDuration   = Math.round(fnRandInt(intTemp, intTemp*2));

		// The gintDuckIndex hack is kind of a weird behavior of javascript/jQuery. Allows to target each individual duck on callback functions.
		fnSpawnDuck(gintDuckIndex, intDuckSize, intDuration);
	}
}



//==================================================
// MATH
//==================================================


//--------------------------------------------------
// fnRandInt v1.0.3
//--------------------------------------------------


function fnRandInt(intMax, intMin){
/**
 * @version        1.0.3
 * @lastmodified   23:20 19/03/2016
 * @category       Math
 * @purpose        Returns random integer
 * @param          intMax as Integer, intMin as Integer
 * @return         Integer
 */

	return Math.floor(Math.random()*(intMax - intMin)+ intMin);
}



