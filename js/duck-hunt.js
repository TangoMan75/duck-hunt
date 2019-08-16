//==================================================
// DUCK HUNT
//==================================================

/**
 * @version       1.0.4
 * @lastmodified  01:52 05/03/2019
 * @author        Matthias Morin <matthias.morin@gmail.com>
 * @purpose       Duck Hunt is a remix of the famous vintage nintendo nes game in jQuery
 * @requires      jQuery
 * @link          https://github.com/TangoMan75/duck-hunt
 */

// Preloads sound file
var audio = new Audio();
audio.src = 'sounds/gunshot.mp3';

// Defines possible coordonates to spawn ducks
var windowsMaxWidth = $(window).width();
var windowsMaxHeight = $(window).height();

$Screen = $('#screen');
$Screen.width(windowsMaxWidth);
$Screen.height(windowsMaxHeight);

// Redefines possible coordonates to spawn ducks on window resizing
$(window).resize(function () {
    var windowsMaxWidth = $(window).width();
    var windowsMaxHeight = $(window).height();
    $Screen.width(windowsMaxWidth);
    $Screen.height(windowsMaxHeight);
})

// Ducks are unselectable
$('body').addClass('unselectable');

// Initiates duck properties
var duckWidth  = 130;
var duckHeight = 104;
var duckIndex  = 0;

//==================================================
// Game settings
//==================================================

// Sets player shots to 0
var shots = 0;

// Sets player hits to 0
var hits = 0;

// Sets player score to 0
var score = 0;

// Sets player life to 3
var life = 3;
$('#life').html('Life : ' + life);

//==================================================

// Listening to click event on screen
$Screen.on('mousedown', function () {
    playSound();

    // Updates score hud
    $('#shots').html('Shots&nbsp;:&nbsp;' + (shots += 1));
});

// Listening to keypress event on screen
$(window).on('keypress', function () {
    debug();
});

//==================================================
// Init
//==================================================

level = 0;
start();

//==================================================
// ANIMATIONS
//==================================================

/**
 * @category  Animations
 * @purpose   Makes duck fly away
 * @param     Duck as jQuery object
 * @assumes   life'), life
 * @uses      flipX, randInt, gameOver, start
 * @note      When duck successfully flies away, player loses life, and hud is updated
 */
function flyAway($Duck) {
    // Exept if duck is dead
    if (!$Duck.hasClass('dead')) {
        $Duck
        .stop()
        .addClass('flying-away');

        // Duck flies away randomly left or right
        intX = side($Duck);
        flipX($Duck, intX);

        // Duck flies away randomly up and down the y axis
        intY        = randInt(0, windowsMaxHeight);
        intDuration = randInt(1000, 4000);

        // Animates duck
        $Duck.animate({
            'left': intX,
            'top': intY,
        }, intDuration, 'swing', function () {

            // When duck flies out of the screen
            $Duck.remove();

            // Player loses life
            $('#life').html('Life : ' + (life -= 1));

            // Game over when player life points gone
            if (life <= 0) {
                gameOver();

                // All ducks are gone but player still has life points left
            } else if (!$Screen.children().hasClass('alive')) {
                start();
            }
        });
    }
}

/**
 * @category  Animations
 * @purpose   Kills duck, starts new level when no more ducks alive
 * @param     Duck as jQuery object
 * @assumes   windowsMaxHeight
 * @uses      start
 */
function killDuck($Duck) {
    // Changes duck properties
    $Duck
    .stop()
    .addClass('dead')
    .attr('src', 'img/duck-dead.gif');

    // Makes duck fall
    $Duck.animate({
        'top': windowsMaxHeight + $Duck.height(),

    }, 1000, function () {

        // Kills and removes duck
        $Duck.removeClass('alive');
        $Duck.remove();

        // Starts new level when no more ducks alive
        if (!$Screen.children().hasClass('alive')) {
            start();
        }
    });
}

/**
 * @category  Animations
 * @purpose   Spawns randomly duck on left or right side
 * @param     Duck as jQuery object
 * @return    intX as Integer
 * @assumes   windowsMaxWidth
 */
function side($Duck) {
    random = Math.round(Math.random());

    // Left side
    if (random == 0) {
        intX = (random * windowsMaxWidth) - $Duck.width();
    }

    // Right side
    else {
        intX = (random * windowsMaxWidth) + $Duck.width();
    }
    return intX;
}

/**
 * @category  Animations
 * @purpose   Flips duck toward correct direction when moving
 * @param     Duck as jQuery object, intX as Integer
 */
function flipX($Duck, intX) {
    // Gets duck horizontal position (parseInt is required to convert value from string to integer)
    intOldX = parseInt($Duck.css('left'), 10);

    // Ducks face right when moving right
    if (intX > intOldX) {
        $Duck.attr('src', 'img/duck-right.gif');
    }
    // Ducks face left when moving left
    else {
        $Duck.attr('src', 'img/duck-left.gif');
    }
}

/**
 * @category  Animations
 * @purpose   Makes duck move around
 * @param     Duck as jQuery object, intX as Integer, intY as Integer, intDuration as Integer
 * @uses      flipX, randomMove
 * @note      Call back
 */
function moveDuck($Duck, intX, intY, intDuration) {
    flipX($Duck, intX);

    $Duck.animate({
            'left': intX,
            'top': intY,
        }, intDuration, 'swing', function () {

            // Duck will keep moving around randomly
            randomMove($Duck)
        }
    );
}

/**
 * @category  Animations
 * @purpose   Moves duck to random coordonates on screen
 * @param     Duck as jQuery object
 * @assumes   windowsMaxWidth, windowsMaxHeight
 * @uses      randInt, moveDuck
 */
function randomMove($Duck) {
    // Defines max coordonates inside the screen according to duck size
    intMaxX = windowsMaxWidth - $Duck.width();
    intMaxY = windowsMaxHeight - $Duck.height();

    // Defines random coordonates
    intX = randInt(0, intMaxX);
    intY = randInt(0, intMaxY);

    // Sets random speed
    intDuration = randInt(500, 2000);
    moveDuck($Duck, intX, intY, intDuration);
}

/**
 * @category  Animations
 * @purpose   Displays a blood slatter on duck coordonates
 * @param     Duck as jQuery object
 * @assumes   Screen
 * @uses      makeUnselectable, randInt
 */
function splatter($Duck) {
    // Locates duck and appends blood sprite to screen
    intWidth  = $Duck.width();
    intHeight = $Duck.height();

    // parseInt is required to convert value from string to integer
    intX = parseInt($Duck.css('left'), 10) + (intWidth / 2);
    intY = parseInt($Duck.css('top'), 10) + (intHeight / 2);

    $Blood = $('<img>');
    makeUnselectable($Blood);

    $Blood
    .addClass('splatter')
    .addClass('image')
    .attr('src', 'img/blood.gif');

    // Sets Blood size
    intSize = randInt(50, 150)
    $Blood.css({
        'width': intSize,
        'height': intSize,
    });

    // Sets Blood position
    $Blood.css({
        'left': intX,
        'top': intY,
    });

    $Screen.append($Blood);

    // Blood fade out
    $Blood.fadeOut(500, function () {
        $Blood.remove();
    });
}

//==================================================
// AUDIO
//==================================================

/**
 * @category  Audio
 * @purpose   Plays gunshot sound
 */
function playSound() {
    var audio = new Audio();
    audio.src = 'sounds/gunshot.mp3';
    audio.play();
}

//==================================================
// DEBUG
//==================================================

/**
 * @category  Debug
 * @purpose   Allows to kill all ducks on screen
 * @assumes   Screen
 * @uses      killDuck
 */
function debug() {
    $Screen.children('.alive').each(function () {
        killDuck($(this));
    });
}

//==================================================
// DIALOGS
//==================================================

/**
 * @category  Dialogs
 * @purpose   Displays bubble message on ducks coordonates
 * @param     Duck as jQuery object, strClass as String, strMessage as String
 */
function bubble($Duck, strClass, strMessage) {
    // Locates duck and appends sprite to screen
    intX = parseInt($Duck.css('left'), 10);
    intY = parseInt($Duck.css('top'), 10);

    // Creates bubble
    $Bubble = $('<div>');
    $Bubble
    .addClass(strClass)
    .html(strMessage);

    // Centers bubble according to duck width
    if (strClass != 'bubble') {
        intX += ($Duck.width() / 2) - ($Bubble.width() / 2);
    }

    // Sets dialog position
    $Bubble.css({
        'left': intX,
        'top': intY,
    });

    // Appends bubble to screen
    $Screen.append($Bubble);

    // Changes animation according to dialog type
    switch (strClass) {
        case 'bubble':
            intUp = 10;
            break;
        case 'score':
            intUp = 20;
            break;
        case 'combo':
            intUp = 30;
            break;
        case 'bonus':
            intUp = 40;
            break;
    }

    $Bubble.animate({
        'top': intY - intUp,
    }, 500);
    $Bubble.fadeOut(700, function () {
        $Bubble.remove();
    });
}

/**
 * @category  Dialogs
 * @purpose   Displays jumbo message
 * @param     strMessage as String
 * @assumes   Screen
 */
function display(strMessage) {
    intScreenHeight = $Screen.height()
    intScreenWidth  = $Screen.width()

    $Display = $('<div>');
    $Display
    .height(intScreenHeight)
    .width(intScreenWidth)
    .addClass('display')
    .css({
        'font-size': 200,
    })
    .html(strMessage);

    $Screen.append($Display);

    // dialog animation
    $Display.animate({
        'font-size': 200,
    }, 600);
    $Display.fadeOut(600, function () {
        $Display.remove();
    });
}

/**
 * @category  Dialogs
 * @purpose   Returns random dialog
 * @return    strDialog as String
 * @uses      randInt
 */
function randomDialog() {
    switch (randInt(1, 5)) {
        case 1:
            strDialog = 'Bye !';
            break;
        case 2:
            strDialog = 'See you !';
            break;
        case 3:
            strDialog = 'Catch me if you can !';
            break;
        case 4:
            strDialog = 'Hasta la vista baby !';
            break;
        case 5:
            strDialog = 'Ciao !';
            break;
    }
    return strDialog;
}

/**
 * @category  Dialogs
 * @purpose   Computes score according to duck size and updates score hud
 * @param     Duck as jQuery object
 * @return    intScore as Integer
 * @assumes   score'), score, $('#hits'), hits
 */
function score($Duck) {
    // Gets duck size
    intHeight = $Duck.height();
    intScore  = Math.floor(13000 / intHeight);

    // Updates score hud
    $('#score').html('Score&nbsp;:&nbsp;' + (score += intScore));
    $('#hits').html('Hits&nbsp;:&nbsp;' + (hits += 1));
    return intScore;
}

/**
 * @category  DOM
 * @purpose   Make jQuery objects unselectable
 * @param     objTarget as Object
 * @return    false
 */
function makeUnselectable(objTarget) {
    objTarget
    .addClass('unselectable')       // All these attributes are inheritable
    .attr('unselectable', 'on')     // For IE9 - This property is not inherited, needs to be placed onto everything
    .attr('draggable', 'false')     // For moz and webkit, although Firefox 16 ignores this when -moz-user-select: none; is set, it's like these properties are mutually exclusive, seems to be a bug.
    .on('dragstart', function () {
        return false;
    });     // Needed since Firefox 16 seems to ingore the 'draggable' attribute we just applied above when '-moz-user-select: none' is applied to the CSS

    objTarget                           // Apply non-inheritable properties to the child elements
    .find('*')
    .attr('draggable', 'false')
    .attr('unselectable', 'on');
}

/**
 * @category  DOM
 * @purpose   Stops event from bubbleling to parent
 * @param     e as DOM Object
 */
function stopPropagation(e) {
    e.stopPropagation();
}

//==================================================
// GAME
//==================================================

/**
 * @category  Game
 * @purpose   Displays game over message and stops game
 * @return    false
 * @assumes   Screen
 * @uses      display
 */
function gameOver() {
    // Unsets mousedown event on screen
    $Screen.off('mousedown');

    // Unsets events on all remaining ducks
    $Screen.children('.alive').off();

    // Keeps them unselectable
    $Screen.children('.alive').on('dragstart', function () {
        return false;
    });

    // Unsets timeouts on all remaining ducks
    $Screen.children('.alive').each(function () {
        window.clearTimeout($(this).attr('data-timeout'));
    });

    // Stops animation for all ducks on screen
    $Screen.children('.alive').clearQueue().stop();

    // Empties screen of all remaining ducks
    // $Screen.empty();

    // Displays 'Game Over' message
    display('GAME OVER !');
}

/**
 * @category  Game
 * @purpose   Appends duck to screen, sets timeout and makes it clickable
 * @param     Duck as jQuery object, intSize as Integer, intDuration as Integer
 * @assumes   Screen, duckWidth, duckHeight, 0, windowsMaxHeight
 * @uses      makeUnselectable, side, randInt, randomMove, flyAway, bubble, randomDialog, score, killDuck
 * @note      This is the main part of the game architecture
 */
function spawnDuck($Duck, intSize, intDuration) {
    // Creates duck and appends to screen
    $Duck = $('<img>');
    $Duck.addClass('image');
    $Duck.addClass('alive');
    makeUnselectable($Duck);
    $Screen.append($Duck);

    // Sets random duck size
    $Duck.css({
        'width': duckWidth * intSize,
        'height': duckHeight * intSize,
    });

    // Duck spawns randomly left or right
    intX = side($Duck);

    // Duck spawns randomly up and down the y axis
    intY = randInt(0, windowsMaxHeight);

    // Sets duck position
    $Duck.css({
        'left': intX,
        'top': intY,
    });

    // Duck will move inside screen and then go away after a random amount of time
    randomMove($Duck);
    objTimeout = window.setTimeout(function () {
        flyAway($Duck);
        bubble($Duck, 'bubble', randomDialog());
    }, intDuration);

    // Stores timeout id into $Duck attribute
    $Duck.attr('data-timeout', objTimeout);

    // Listens to click event on ducks
    $Duck.on('mousedown', function () {

        // Gets timeOut id from $Duck attribute
        objTimeout = $Duck.attr('data-timeout');
        window.clearTimeout(objTimeout);

        splatter($Duck);
        bubble($Duck, 'score', score($Duck));
        if ($Duck.hasClass('flying-away')) {
            score($Duck);
            bubble($Duck, 'bonus', score($Duck));
        }
        if ($Duck.hasClass('dead')) {
            bubble($Duck, 'combo', 'COMBO HIT !');
        }
        else {
            killDuck($Duck);
        }
    });
}

/**
 * @category  Game
 * @purpose   Builds new level
 * @assumes   Screen, $('#level'), level, duckIndex
 * @uses      display, spawnDuck, randInt
 * @note      This is another big chunk of the game architecture
 */
function start() {
    // Clears screen for unremoved elements if any
    $Screen.empty();
    level++;

    // Updates level in hud
    $('#level').html('Level : ' + level);
    display('Level&nbsp;' + level);

    // Spawns ducks
    for (i = 0; i < level; i++) {

        // Each duck need a unique name for reference
        duckIndex += 1;
        intDuckSize = 1 + Math.random();
        intTemp     = 30000 / level;
        intDuration = Math.round(randInt(intTemp, intTemp * 2));

        // The duckIndex hack is kind of a weird behavior of javascript/jQuery. Allows to target each individual duck on callback functions.
        spawnDuck(duckIndex, intDuckSize, intDuration);
    }
}

//==================================================
// MATH
//==================================================

/**
 * @category  Math
 * @purpose   Returns random integer
 * @param     intMax as Integer, intMin as Integer
 * @return    Integer
 */
function randInt(intMax, intMin) {
    return Math.floor(Math.random() * (intMax - intMin) + intMin);
}
