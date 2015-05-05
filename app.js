// VARIABLES GLOBALES
var WIDTH,              // width of the canvas area
    HEIGHT,             // height of the canvas area
    canvasElement,      // the canvas element
    context,            // the 2D drawing context for the canvas
    targetElement,      // the target element
    targets = new Array(),  // the live targets
    targetId = 0,       // the current target ID
    redrawInterval,     // interval ID of the redraw interval
    messages = new Array(), // on-screen messages
    messageId = 0,      // the current message ID
    fps = 60.0;         // how frequently do we update?

// define the messages to show
var hitMessages = new Array();
hitMessages[0] = "MISS";
hitMessages[1] = "HIT!"; 
hitMessages[2] = "DOUBLE HIT!!";
hitMessages[3] = "HAT-TRICK!!!";
hitMessages[4] = "UN~BELIEVABLE!!!!";
hitMessages[5] = "OH MY GOSH!!";

// define the Target 'class' to represent an on-screen target
var Target = new Class({
    initialize: function (x, y, radius, dx, dy) {
        var _id, _x, _y, _radius, _dx, _dy, is;

        _id = targetId++;

        // the X and Y coordinate of the top left corner
        _x = x;
        _y = y;

        // the radius of the target
        _radius = radius;

        // the rate of movement in the X and Y direction
        if (dx) {
            _dx = dx;
        } else {
            _dx = Math.ceil(Math.random() * 10);
        }
        if (dy) {
            _dy = dy;
        } else {
            _dy = Math.ceil(Math.random() * 10);
        }

        // getters
        this.getId = function () {
            return _id;
        }

        this.getX = function () {
            return _x;
        };

        this.getY = function () {
            return _y;
        };

        this.getRadius = function () {
            return _radius;
        };

        // move the target to its position for the next frame
        this.move = function () {
            _x += _dx;
            _y += _dy;

            // change direction in X if it 'hits' the border
            if ((_x + _radius * 2) >= WIDTH || _x <= 0) {
                _dx *= -1;
            }

            // change direction in Y if it 'hits' the border
            if ((_y + _radius * 2) >= HEIGHT || _y <= 0) {
                _dy *= -1;
            }
        };

        // draws the target on the canvas
        this.draw = function () {
            context.drawImage(targetElement, _x, _y);
        };

        // hit the target!
        this.hit = function () {
            for (var i = 0; i < targets.length; i++) {
                var target = targets[i];

                if (target.getId() == _id) {
                    targets.splice(i, 1);
                    var puntuacion = document.getElementById("puntuacion").innerHTML = "Puntuación: " + (20-targets.length);
                    break;
                }

            }

            
        };
    }
});

// define the Message 'class' to represent an on-screen message
var Message = new Class({
    initialize: function (x, y, message, duration) {
        var _id, _x, _y, _message, _duration;

        _id = messageId++;

        // X, Y coordinates of where to display the message
        _x = x;
        _y = y;

        // the message
        _message = message;

        // how many frames to display the message for
        _duration = duration;

        this.getId = function () {
            return _id;
        }

        this.draw = function () {
            if (_duration >= 0) {
                context.textBaseline = "middle";
                context.textAlign = "center";
                context.fillStyle = "#FFF";
                context.strokeStyle = "#000";
                context.font = "bold 140px arial";

                // draw the message at the specified X, Y coordinates
                context.fillText(_message, _x, _y);

                _duration--;
            } else {
                // remove the message
                for (var i = 0; i < messages.length; i++) {
                    var message = messages[i];

                    if (message.getId() == _id) {
                        messages.splice(i, 1);
                        break;
                    }
                }
            }
        }
    }
});

// Add targets to the game
function createTargets() {
    var targetRadius = targetElement.width / 2;

    for (var i = 0; i < 20; i++) {
        targets[i] = new Target(0, 0, targetRadius);
    }
}

// Draw the target canvas element, and initialise the global 
// variables so that they can be used here after
function initialize() {    
    canvasElement = document.getElementById("canvas");
    context = canvasElement.getContext("2d");

    WIDTH = canvasElement.width;
    HEIGHT = canvasElement.height;

    // initialise the target canvas
    targetElement = document.getElementById("target");
    initializeTargetCanvas(targetElement);


    $("#canvas").mousedown(function (mouseEvent) {
        // get the coordinates of the click inside the canvas
        var position = getPosition(mouseEvent, this);

        // find out which targets were hit
        var hitTargets = hitTest(position);

        // hit the targets
        for (var i = 0; i < hitTargets.length; i++) {
            hitTargets[i].hit();
        }

        // use one of the defined messages if possible, otherwise use a default
        var hitMessage = hitMessages[hitTargets.length];
        if (hitMessage == undefined)
        {
            hitMessage = "TOO GOOOOOOOOD..";
        }

        messages.push(new Message(WIDTH/2, HEIGHT/2, hitMessage, 30));
        
    });

    // put the moving targets onto the scene
    createTargets();


    // clear the canvas and start the game with a frame rate of roughly 60fps!
    clear();
    redrawInterval = setInterval(draw, 1000/fps);
}

// Draws the target canvas
function initializeTargetCanvas(element) {
    var baseX = 1.5, baseY = 1.5;

    // get the width and height of the element
    var width = (element.width - baseX * 2) / 2,
        height = (element.height - baseY * 2) / 2;

    // work out the necessary metrics to draw the target
    var radius = Math.min(width, height),
        centreX = baseX + radius,
        centreY = baseY + radius,
        ringWidth = radius / 10;

    // get the 2D context to start drawing the target!
    var context = element.getContext("2d");
    context.lineWidth = "2";

    // define function to draw a ring
    var drawRing = function (fillStyle, ringRadius) {
        context.fillStyle = fillStyle;

        // draw the circle
        context.beginPath();
        context.arc(centreX, centreY, ringRadius, 0, Math.PI * 2, true);
        context.closePath();

        context.stroke();
        context.fill();
    };

    // draw the rings for each score
    drawRing("#000", radius);
    drawRing("#FFF", radius -= (ringWidth * 2));
    drawRing("#000", radius -= (ringWidth * 2));
    drawRing("#FFF", radius -= (ringWidth * 2));
    drawRing("#000", radius -= (ringWidth * 2));
    drawRing("red", radius -= ringWidth);
}

// clear the canvas page
function clear() {
    context.fillStyle = "green";
    context.fillRect(0, 0, WIDTH, HEIGHT);
}

// redraw the target boards on the canvas
function draw() {
    // clear the canvas page first
    clear();

    // stop the redraw interval once all targets are taken out
    if (targets.length == 0 && messages.length == 0) {
        //clearInterval(redrawInterval);
    } else {
        for (var i = 0; i < targets.length; i++) {
            targets[i].move();
            targets[i].draw();
        }

        for (var i = 0; i < messages.length; i++) {
            messages[i].draw();
        }
    }
}

// works out the X, Y position of the click INSIDE the canvas from the X, Y 
// position on the page
function getPosition(mouseEvent, element) {
    var x, y;
    if (mouseEvent.pageX != undefined && mouseEvent.pageY != undefined) {
        x = mouseEvent.pageX;
        y = mouseEvent.pageY;
    } else {
        x = mouseEvent.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        y = mouseEvent.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }

    return { X: x - element.offsetLeft, Y: y - element.offsetTop };
}

// check if the player managed to hit any of the live targets
function hitTest(position) {
    var hitTargets = new Array();

    // check if the position is within the bounds of any of the live targets
    for (var i = 0; i < targets.length; i++) {
        var target = targets[i];

        var targetCentreX = target.getX() + target.getRadius(),
            targetCentreY = target.getY() + target.getRadius();

        // work out the distance between the position and the target's centre
        var xdiff = position.X - targetCentreX,
            ydiff = position.Y - targetCentreY,
            dist = Math.sqrt(Math.pow(xdiff, 2) + Math.pow(ydiff, 2));

        // if that distance is less than the radius of the target then the
        // position is inside the target
        if (dist <= target.getRadius()) {
            hitTargets.push(target);
        }
    }

    return hitTargets;
}