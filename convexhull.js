//The function called on load.
function start(){
    //set up buttons
    document.getElementById("pause").style.display = "none";
    document.getElementById("play").style.display = "inline";
    document.getElementById("controls").style.display = "none";

    /*
    * Global variables
    */
    canvas = document.getElementById("canvas");
    context = canvas.getContext("2d");
    canvas.style.border = "black 2px solid";
	
    //holds the points in a vector
    points = [];
    upper = []; //stores points in upper portion of conhull
    lower = []; //stores points in lower portion of conhull

    //holds the frames which define what the algorithm looks like at each step
    frames = [];
    //holds the current frame
    curFrame = 0;
    
    time = 700; //time step
  
    // holds the setTimeOut ID
    timeOutID = 0;

    //used for when user input stops and algorithm runs.  This disables new points.
    running = false;
    
    //determines if we are in a paused or running state
    paused = true;
	
		
    canvas.addEventListener('mousedown', function(evt){
        var mousePos = getMousePos(canvas, evt);	
        if(running == false){
            points.push(mousePos);
            drawPoint( mousePos);
        }	
    //debug.innerHTML = points.length+" ("+points[0].x+","+points[0].y+")";		
    }, false);
	


};

function myClear(){
    clearTimeout(timeOutID);
    context.clearRect(0, 0, canvas.width, canvas.height);
    document.getElementById("controls").style.display = "none";
    document.getElementById("runhull").style.display = "inline";
    
    
    //set up buttons
    document.getElementById("pause").style.display = "none";
    document.getElementById("play").style.display = "inline";
    document.getElementById("controls").style.display = "none";
    
    //holds the points in a vector
    points = [];
    upper = []; //stores points in upper portion of conhull
    lower = []; //stores points in lower portion of conhull

    //holds the frames which define what the algorithm looks like at each step
    frames = [];
    //holds the current frame
    curFrame = 0;
    
    time = 700; //time step
  
    // holds the setTimeOut ID
    timeOutID = 0;

    //used for when user input stops and algorithm runs.  This disables new points.
    running = false;
    
    //determines if we are in a paused or running state
    paused = true;
}

function drawPoint( mousePos){
    context.beginPath(); 
    context.arc(mousePos.x, mousePos.y, 4, 0, 2 * Math.PI, true); 
    context.fill();
}


function getMousePos(canvas, evt){
    // get canvas position
    var obj = canvas;
    var top = 0;
    var left = 0;
    while (obj && obj.tagName != 'BODY') {
        top += obj.offsetTop;
        left += obj.offsetLeft;
        obj = obj.offsetParent;
    }
 
    // return relative mouse position
    var mouseX = evt.clientX - left + window.pageXOffset;
    var mouseY = evt.clientY - top + window.pageYOffset;
    return {
        x: mouseX,
        y: mouseY
    };
}


//runs conhull for the first time
function runHull(){
    document.getElementById("controls").style.display = "inline";
    document.getElementById("runhull").style.display = "none";
    running = true;
    conHull();
}

//lexographic compair for sort
function lexoComp(p1, p2){
    if(p1.x < p2.x){
        return -1;
    }else if(p1.x == p2.x && p1.y < p2.y){
        return -1;
    }
    return 1;
}

//doesn't take a right turn
function notRight(p1, p2, p3){
    return (p2.x - p1.x)*(p3.y - p1.y) - (p2.y - p1.y)*(p3.x - p1.x);
};

//conhull algorithm
function conHull(){
	
    if(points.length < 4){
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.font = '18pt Calibri';
        context.fillStyle = 'black';
        context.fillText("Need 4 or more points for the algorithm to be intresting!", 10, 25);
        return; //do something here
    }
	
    //lexographical sort
    points.sort(lexoComp);
    
    addFrame();  //add frame for visualization
    
    //add first two points to upper conhull
    upper.push(points[0]);
    upper.push(points[1]);
    
    addFrame();
    
    
    var i = 2;
    for(i=2; i < points.length; i++){
        upper.push(points[i]);
        var upSize = upper.length-1;
        addFrame();
        while(upper.length > 2 && notRight(upper[upSize-2], upper[upSize-1], upper[upSize]) <= 0){
            //remove middle of three points
            var temp = upper[upSize];
            upper.pop();
            upper.pop();
            upper.push(temp);
            upSize = upper.length-1;
            addFrame();
        }
    }
    
    //add first two points to lower conhull
    lower.push(points[points.length-1]);
    lower.push(points[points.length-2]);
    addFrame();

		
    //points.length-1-2, for two points in
    i = points.length-3;
    for(i = points.length-3; i >= 0; i--){
        lower.push(points[i]);
        var lowSize = lower.length-1;
        addFrame();
        while(lower.length > 2 && notRight(lower[lowSize-2], lower[lowSize-1], lower[lowSize]) <= 0){
            //remove middle of three points
            var temp = lower[lowSize];
            lower.pop();
            lower.pop();
            lower.push(temp);
            lowSize = lower.length-1;
            addFrame();
        }
    }
    
    //remove first and last of lower
    lower.shift();
    lower.pop();
    
    addFrame();
    
    //update list as the conhull
    var conHull = upper.concat(lower);  //what algorithm normally returns
	 
    drawLast(); //dram the last frame
    
}

//adds a new frame to the array of frames
function addFrame(){
    var f = new Frame(upper, lower);
    frames.push(f);
}


//A fame object.  It describes what the algorithm looks like at a given step.
function Frame(upperN, lowerN){
    this.upper = upperN.slice(0); //shallow copy of array
    this.lower = lowerN.slice(0);
}

//steps one frame forward
function forward(){
    clearTimeout(timeOutID);
    if(paused == true){
        if(curFrame <= frames.length-1)
            drawCurFrame();
    }else{
        if(curFrame <= frames.length-1){
            playRun();
        }
    }
}


//setps one frame back
function backward(){
    clearTimeout(timeOutID);
    if(curFrame > 1)
        curFrame = curFrame-2;
    else if(curFrame == 1)
        curFrame = 0;
    else if(curFrame == 0)
        curFrame = frames.length-2;
    if(paused == true){
        drawCurFrame(frames[curFrame]);
    }else{
        playRun();
    }
}



function pause(){
    clearTimeout(timeOutID);
    paused = true;
    document.getElementById("play").style.display = "inline";
    document.getElementById("pause").style.display = "none"; 
}

function play(){
    paused = false;
    document.getElementById("pause").style.display = "inline";
    document.getElementById("play").style.display = "none";
    playRun();
}

function reset(){
    pause();
    curFrame = 0;   
}

function playRun(){
    drawCurFrame();
    if(curFrame < frames.length && curFrame != 0){
        timeOutID = setTimeout(playRun, time);
    }
}

function drawCurFrame(){
    if(curFrame == frames.length-1){
       drawLast(); //connect upper and lower hulls
       reset();
    }else{
        drawFrame(frames[curFrame]);
        curFrame = curFrame+1;
    }
}

function drawLast(){
    drawPoints();
    context.strokeStyle = "rgb(0,0,200)";  
    context.beginPath();
    context.moveTo(frames[frames.length-1].upper[0].x, frames[frames.length-1].upper[0].y);
    context.lineTo(frames[frames.length-1].lower[lower.length-1].x, frames[frames.length-1].lower[lower.length-1].y); 
    context.stroke();
    context.beginPath();
    context.moveTo(frames[frames.length-1].upper[upper.length-1].x, frames[frames.length-1].upper[upper.length-1].y);
    context.lineTo(frames[frames.length-1].lower[0].x, frames[frames.length-1].lower[0].y); 
    context.stroke();
    //redram frame so it looks nice
    drawLines(frames[frames.length-1].upper, false);
    colourPoints(frames[frames.length-1].upper, true);
    drawLines(frames[frames.length-1].lower, false);
    colourPoints(frames[frames.length-1].lower, false);  
}

function drawFrame(f){
    context.clearRect(0,0,canvas.width,canvas.height);
    drawPoints();
    if(f.upper.length > 0){
        drawLines(f.upper, false);
        colourPoints(f.upper, true);
    }
    if(f.lower.length > 0){
        drawLines(f.lower, false);
        colourPoints(f.lower, false);
    }
}

function drawLines(vec, close){
    context.strokeStyle = "rgb(0,0,200)";  
    context.beginPath();
    context.moveTo(vec[0].x, vec[0].y);
    for(var i = 1; i < vec.length; i++){
        context.lineTo(vec[i].x, vec[i].y); 
    }
    if(close){
        context.closePath();
    }
    context.stroke();
}

function  colourPoints(vec, upper){
	
    if(upper){    
        context.fillStyle = "rgb(200,0,0)";
    }else{
        context.fillStyle = "rgb(0,200,0)";
    }
    for(var i = 0; i < vec.length; i++){
        context.beginPath(); 
        context.arc(vec[i].x, vec[i].y, 4, 0, 2 * Math.PI, true); 
        context.fill();
    }
    context.fillStyle = "rgb(0,0,0)";
}

function  drawPoints(){
	 
    context.fillStyle = "rgb(0,0,0)";
    for(var i = 0; i < points.length; i++){
        context.beginPath(); 
        context.arc(points[i].x, points[i].y, 4, 0, 2 * Math.PI, true); 
        context.fill();
    }	
}

