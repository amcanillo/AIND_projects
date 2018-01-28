// Mimic Me!
// Fun game where you need to express emojis being displayed

// --- Affectiva setup ---

// The affdex SDK Needs to create video and canvas elements in the DOM
var divRoot = $("#camera")[0];  // div node where we want to add these elements
var width = 640, height = 480;  // camera image size
var faceMode = affdex.FaceDetectorMode.LARGE_FACES;  // face mode parameter

// Initialize an Affectiva CameraDetector object
var detector = new affdex.CameraDetector(divRoot, width, height, faceMode);

// Enable detection of all Expressions, Emotions and Emojis classifiers.
detector.detectAllEmotions();
detector.detectAllExpressions();
detector.detectAllEmojis();
detector.detectAllAppearance();

// --- Utility values and functions ---

// Unicode values for all emojis Affectiva can detect
var emojis = [ 128528, 9786, 128515, 128524, 128527, 128521, 128535, 128539, 128540, 128542, 128545, 128563, 128561 ];

// Update target emoji being displayed by supplying a unicode value
function setTargetEmoji(code) {
  $("#target").html("&#" + code + ";");
}

// Convert a special character to its unicode value (can be 1 or 2 units long)
function toUnicode(c) {
  if(c.length == 1)
    return c.charCodeAt(0);
  return ((((c.charCodeAt(0) - 0xD800) * 0x400) + (c.charCodeAt(1) - 0xDC00) + 0x10000));
}

// Update score being displayed
function setScore(correct, total) {
  $("#score").html("Score: " + correct + " / " + total);
}

// Display log messages and tracking results
function log(node_name, msg) {
  $(node_name).append("<span>" + msg + "</span><br />")
}

// Display Timeleft counter : ADDED FUNCTION
function setTime(sec){
    $("#timeleft").html("Time Left: " + sec + " secs");
}
// --- Callback functions ---

// Start button
function onStart() {
  if (detector && !detector.isRunning) {
    $("#logs").html("");  // clear out previous log
    detector.start();  // start detector
  }
  log('#logs', "Start button pressed");
  
  //
    initializeGame(0);
}

// Stop button
function onStop() {
  log('#logs', "Stop button pressed");
  if (detector && detector.isRunning) {
    detector.removeEventListener();
    detector.stop();  // stop detector
  }
    if(timerSession){
        clearInterval(timerSession);
    }
};

// Reset button
function onReset() {
  log('#logs', "Reset button pressed");
  if (detector && detector.isRunning) {
    detector.reset();
  }
  $('#results').html("");  // clear out results
  $("#logs").html("");  // clear out previous log

  // TODO(optional): You can restart the game as well
  // <your code here>
    initializeGame(1);
};

// Add a callback to notify when camera access is allowed
detector.addEventListener("onWebcamConnectSuccess", function() {
  log('#logs', "Webcam access allowed");
});

// Add a callback to notify when camera access is denied
detector.addEventListener("onWebcamConnectFailure", function() {
  log('#logs', "webcam denied");
  console.log("Webcam access denied");
});

// Add a callback to notify when detector is stopped
detector.addEventListener("onStopSuccess", function() {
  log('#logs', "The detector reports stopped");
  $("#results").html("");
});

// Add a callback to notify when the detector is initialized and ready for running
detector.addEventListener("onInitializeSuccess", function() {
  log('#logs', "The detector reports initialized");
  //Display canvas instead of video feed because we want to draw the feature points on it
  $("#face_video_canvas").css("display", "block");
  $("#face_video").css("display", "none");

  // TODO(optional): Call a function to initialize the game, if needed
  // <your code here>
  initializeGame(0);
});

// Add a callback to receive the results from processing an image
// NOTE: The faces object contains a list of the faces detected in the image,
//   probabilities for different expressions, emotions and appearance metrics
detector.addEventListener("onImageResultsSuccess", function(faces, image, timestamp) {
  var canvas = $('#face_video_canvas')[0];
  if (!canvas)
    return;

  // Report how many faces were found
  $('#results').html("");
  log('#results', "Timestamp: " + timestamp.toFixed(2));
  log('#results', "Number of faces found: " + faces.length);
  if (faces.length > 0) {
    // Report desired metrics
    log('#results', "Appearance: " + JSON.stringify(faces[0].appearance));
    log('#results', "Emotions: " + JSON.stringify(faces[0].emotions, function(key, val) {
      return val.toFixed ? Number(val.toFixed(0)) : val;
    }));
    log('#results', "Expressions: " + JSON.stringify(faces[0].expressions, function(key, val) {
      return val.toFixed ? Number(val.toFixed(0)) : val;
    }));
    log('#results', "Emoji: " + faces[0].emojis.dominantEmoji);

    // Call functions to draw feature points and dominant emoji (for the first face only)
    drawFeaturePoints(canvas, image, faces[0]);
    drawEmoji(canvas, image, faces[0]);

    // TODO: Call your function to run the game (define it first!)
    // <your code here>
    drawScore(canvas,'yellow'); // ADDED TO HIGHLIGHT SCORE ON TOP LEFT OF CAMERA REGION
    playMatch(canvas, image, faces[0]);
  }
});


// --- Custom functions ---

// Draw the detected facial feature points on the image
function drawFeaturePoints(canvas, img, face) {
  // Obtain a 2D context object to draw on the canvas
  var ctx = canvas.getContext('2d');

  // TODO: Set the stroke and/or fill style you want for each feature point marker
  // See: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D#Fill_and_stroke_styles
  // <your code here>
  ctx.strokeStyle =  'cyan'//
  ctx.lineWidth = 2;
    
  // Loop over each feature point in the face
  for (var id in face.featurePoints) {
    var featurePoint = face.featurePoints[id];

    // TODO: Draw feature point, e.g. as a circle using ctx.arc()
    // See: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/arc
    // <your code here>
    ctx.beginPath();
    ctx.arc(featurePoint['x'],featurePoint['y'],2,0,2 * Math.PI,true);
    ctx.stroke();
//    ctx.fillText(id, featurePoint['x'],featurePoint['y']); // to find the index of left point to position the emoji
  }
}

// Draw the dominant emoji on the image
function drawEmoji(canvas, img, face) {
  // Obtain a 2D context object to draw on the canvas
  var ctx = canvas.getContext('2d');

  // TODO: Set the font and style you want for the emoji
  // <your code here>
    ctx.textBaseline ="hanging";
    ctx.strokeStyle = 'red';
    ctx.font = '64px serif';
  // TODO: Draw it using ctx.strokeText() or fillText()
  // See: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillText
  // TIP: Pick a particular feature point as an anchor so that the emoji sticks to your face
  // <your code here>
    point = face.featurePoints[10]; // stick the emoji to the left of the face
    ctx.fillText(face.emojis.dominantEmoji, point['x']+20, point['y']-20);
}

// TODO: Define any variables and functions to implement the Mimic Me! game mechanics
// Global variables
var emoji_ss = [128563, 128521, 128535, 9786, 128561, 128542]; // A small set of emojis that are comparitively easier to mimic
var emoji_idx = 0;
var cur_emoji = emoji_ss[emoji_idx];
var total = 1;
var correct = 0;
var timerSession;
// NOTE:
// - Remember to call your update function from the "onImageResultsSuccess" event handler above
// - You can use setTargetEmoji() and setScore() functions to update the respective elements
// - You will have to pass in emojis as unicode values, e.g. setTargetEmoji(128578) for a simple smiley
// - Unicode values for all emojis recognized by Affectiva are provided above in the list 'emojis'
// - To check for a match, you can convert the dominant emoji to unicode using the toUnicode() function

// Optional:
// - Define an initialization/reset function, and call it from the "onInitializeSuccess" event handler above
// - Define a game reset function (same as init?), and call it from the onReset() function above

// <your code here>

// Custome function that stops timer
function stopTimer(val) {
    clearInterval(val);
    setTime('00');
}

// Custom function that initiates the game
// called while init and reset
function initializeGame(isReset){
    // initialize the variables
    resetVars();
    // console.log(emoji_ss);
    // start setting the target emoji in timely interval
    setTarget(cur_emoji);
    setScore(correct, total);
    
    // Run the timer only when it is started
    if (isReset==0){
        var timer = 60; // set the game to 1 minute
        display = document.querySelector('#timeleft'); // 'timeleft' is the id added to HTML file
        timerSession = setInterval(function () {
            minutes = parseInt(timer / 60, 10)
            seconds = parseInt(timer % 60, 10);
            
            minutes = minutes < 10 ? "0" + minutes : minutes;
            seconds = seconds < 10 ? "0" + seconds : seconds;
            // Sets the time display at the html
            display.textContent = "Time Left: " + seconds +" secs";
            
            if (--timer < 0) {
                  stopTimer(timerSession);
                      alert("GAME OVER. You scored:"+correct+". Press Reset to play again");
            }
            }, 1000);
    }
}
// Custom function to setting target emoji
function setTarget(code) {
    setTargetEmoji(code);
}
// Custom function to init/reset the variables
function resetVars(){
    this.reset;
    emoji_idx=0;
    cur_emoji=emoji_ss[emoji_idx];
    total=1;
    correct=0;
    if(timerSession) {
        stopTimer(timerSession);
    }
}
// Custom function that plays the game of capturing mimic
function playMatch(canvas, img, face){
    // get the canvas context
    var ctx = canvas.getContext('2d');
    
    // check face match
    if (toUnicode(face.emojis.dominantEmoji) == cur_emoji) {
        console.log("Hurrey, Match");
        drawScore(canvas,'green');
        correct++;
        setScore(correct,total);
        if (emoji_idx < 5){
            emoji_idx++;
        } else {
            emoji_idx = 0;
        }
        cur_emoji = emoji_ss[emoji_idx];
        setTarget(cur_emoji);
        total++;
        setScore(correct, total);
    }
}
// Custom function that draws the score & visually indicates when the mimic matches the target.
// Also draws the current score on top of the circle drawn
function drawScore(canvas, color){
    // Obtain a 2D context object to draw on the canvas
    var ctx = canvas.getContext('2d');
    // draw the circle (banner)
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(20,20,20,0,2 * Math.PI,false);
    ctx.fill();
    // draw the Score on top of the banner
    ctx.strokeStyle = 'black';
    ctx.font = '20px serif';
    ctx.strokeText(correct,15,10);
}
