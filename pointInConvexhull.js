/*Code by Arvie Frydenlund, April 2nd 2012
 *
 *The visualization works by creating a set of frames, where each frame describes
 *the algorithm at a given point in time.
 *
 *The set of frames each come in pairs, where the first shows the algorithm with out the 
 *blackout the second shows the black out.
 *
 *when not in blackout mode, the vector of frames is just incremented by two elements
 *to skip over the blackout frames.
 *
 *The skip was done to avoid having multiple timeouts set at one time, since the 
 *other easy way to do this would to be only have one frame and then set a time out
 *for the non-blackout frame and a second timeout latter on for the blackout one
 *for every loop in the play recurance
 */

//The function called on load.
function start(){
    //set up buttons
    document.getElementById("pause").style.display = "none";
    document.getElementById("play").style.display = "inline";
    document.getElementById("controls").style.display = "none";
    document.getElementById("run").style.display = "none";

    /*
    * Global variables
    */
    canvas = document.getElementById("canvas");
    context = canvas.getContext("2d");
    canvas.style.border = "black 2px solid";
	
    //holds the points in a vector
    points = [];
    
    //holds the conhull points
    conHull = [];
    
    //holds the point to be found
    findPoint = 0;

    //holds the frames which define what the algorithm looks like at each step
    frames = [];
    //holds the current frame
    curFrame = 0;
    
    time = 1500; //time step
  
    // holds the setTimeOut ID
    timeOutID = 0;

    //used for when user input stops and algorithm runs.  This disables new points.
    running = false;
    //used for when in drawing the finding point state 
    drawFinding = false;
    
    //uses for when in black Out mode
    isBlackOut = true;
    
    //determines if we are in a paused or running state
    paused = true;
    
    //return value of algorithm
    returnVal = false;
	
		
    canvas.addEventListener('mousedown', function(evt){
        var mousePos = getMousePos(canvas, evt);	
        if(running == false){
            points.push(mousePos);
            var myPoints = points.slice();
            conHull = convexHull(myPoints);
            context.clearRect(0, 0, canvas.width, canvas.height);
            drawConHull(conHull);
            drawLabels(conHull);
        }
        if(drawFinding == true){
            findPoint = mousePos;
            context.clearRect(0, 0, canvas.width, canvas.height);
            drawFindPoint();
        }    		
    }, false);
};

//resets the variables
function myClear(){
    clearTimeout(timeOutID);
    context.clearRect(0, 0, canvas.width, canvas.height);
    document.getElementById("controls").style.display = "none";
    document.getElementById("drawFind").style.display = "inline";
    document.getElementById("run").style.display = "none";
    
    
    //set up buttons
    document.getElementById("pause").style.display = "none";
    document.getElementById("play").style.display = "inline";
    document.getElementById("controls").style.display = "none";
    
    //holds the points in a vector
    points = [];
    //holds the conhull points
    conHull = [];
    //holds the point to be found
    findPoint = 0;
    //holds the frames which define what the algorithm looks like at each step
    frames = [];
    //holds the current frame
    curFrame = 0;
    // holds the setTimeOut ID
    timeOutID = 0;
    //used for when user input stops and algorithm runs.  This disables new points.
    running = false; 
    //used for when in drawing the finding point state 
    drawFinding = false;  
    //uses for when in black Out mode
    isBlackOut = true; 
    //determines if we are in a paused or running state
    paused = true;  
    //return value of algorithm
    returnVal = false;
}

//code taken from http://www.html5canvastutorials.com/advanced/html5-canvas-mouse-coordinates/
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
}

//conhull algorithm
function convexHull(myPoints){
	
    if(myPoints.length < 4){
        return myPoints;
    }
	
    //lexographical sort
    myPoints.sort(lexoComp);
    
    var upper = [];
    var lower = [];
    
    //add first two points to upper conhull
    upper.push(myPoints[0]);
    upper.push(myPoints[1]);
    
    var i = 2;
    for(i=2; i < myPoints.length; i++){
        upper.push(myPoints[i]);
        var upSize = upper.length-1;
        while(upper.length > 2 && notRight(upper[upSize-2], upper[upSize-1], upper[upSize]) <= 0){
            //remove middle of three points
            var temp = upper[upSize];
            upper.pop();
            upper.pop();
            upper.push(temp);
            upSize = upper.length-1;
        }
    }
    
    //add first two points to lower conhull
    lower.push(myPoints[myPoints.length-1]);
    lower.push(myPoints[myPoints.length-2]);
		
    //points.length-1-2, for two points in
    i = myPoints.length-3;
    for(i = myPoints.length-3; i >= 0; i--){
        lower.push(myPoints[i]);
        var lowSize = lower.length-1;
        while(lower.length > 2 && notRight(lower[lowSize-2], lower[lowSize-1], lower[lowSize]) <= 0){
            //remove middle of three points
            var temp = lower[lowSize];
            lower.pop();
            lower.pop();
            lower.push(temp);
            lowSize = lower.length-1;
        }
    }
    
    //remove first and last of lower
    lower.shift();
    lower.pop();
    
    //update list as the conhull
    var myConHull = upper.concat(lower);  //what algorithm normally returns
    return myConHull;	     
}

function run(){
    document.getElementById("controls").style.display = "inline";
    document.getElementById("run").style.display = "none";
    drawFinding = false;
    arr = conHull.slice();
    returnVal = find(arr);
    
    //draw the last frame
    curFrame = frames.length-1;
    drawCurFrame();
    curFrame = 0;
}

//this is exactly the same as the convexhull notRight function
//semantics are slightly differnt, which may justify the rename 
function crossProduct(p1, p2, p3){
    return (p2.x - p1.x)*(p3.y - p1.y) - (p2.y - p1.y)*(p3.x - p1.x);   
}

//detrmine if point is in triangle
function inTriangle(arr){
    var c1 = crossProduct(arr[0], findPoint, arr[1]);
    var c2 = crossProduct(arr[1], findPoint, arr[2]);
    var c3 = crossProduct(arr[2], findPoint, arr[0]);
    if(c1*c2 >= 0 && c2*c3 >= 0 && c3*c1 >= 0){
        return true;
    }else{
        return false;
    }
}

//main algorithm, see site for a more intuitive understanding
function find(arr){
    var mid = Math.floor(arr.length/2);
    
    addFrame(arr, arr[mid]); //add in the new frame
    
    if(arr.length < 3){  //should never happen
        return false;
    }
    
    if(arr.length == 3){ //basecase
        return inTriangle(arr);
    }
    var newArr = [];
    
    var cp = crossProduct(arr[0], findPoint, arr[mid]);
    if(cp == 0){ //coliner so point is on line
        return true;
    }else if(cp < 0){
        newArr = arr.slice(mid, arr.length-1);
        newArr.push(arr[arr.length-1]);
        newArr.unshift(arr[0]);
        return find(newArr);
    }else{
        newArr = arr.slice(0, mid);
        newArr.push(arr[mid]);
        return find(newArr);
    } 
}


//adds a new frame to the array of frames
function addFrame(arr, mid){
    var f = new Frame(arr, mid);
    frames.push(f);
    
    var f = new Frame(arr, mid);  //same as first, but black will be drawn
    frames.push(f);
}


//A fame object.  It describes what the algorithm looks like at a given step.
function Frame(nArr, nMid){
    this.arr = nArr.slice(); //shallow copy of array\
    this.mid = nMid;
    var P = extendLine(this.arr[0], this.mid);
    
    if(frames.length > 0){
        this.polyArr = frames[frames.length-1].polyArr.slice();
    }else{
        this.polyArr = [];
    }
    this.polyArr.push(P);
}

//switches blackout mode
function blackOut(){
    if(curFrame % 2 == 1)
        curFrame = curFrame-1;
    isBlackOut = !isBlackOut;
}

//control buttons
function pause(){
    clearTimeout(timeOutID);
    paused = true;
    document.getElementById("play").style.display = "inline";
    document.getElementById("pause").style.display = "none"; 
    document.getElementById("backward").style.display = "inline";
    document.getElementById("forward").style.display = "inline";
}

function play(){
    paused = false;
    document.getElementById("pause").style.display = "inline";
    document.getElementById("play").style.display = "none";
    document.getElementById("backward").style.display = "none";
    document.getElementById("forward").style.display = "none";
    curFrame = 0;
    playRun();
}

function reset(){
    clearTimeout(timeOutID);
    pause();
    curFrame = 0;   
}

//recurence funtion for the animation
function playRun(){   
    if(curFrame < frames.length && paused == false){
        drawCurFrame();
        timeOutID = setTimeout(playRun, time);   
    }
}

//steps one frame forward
function forward(){
    if(curFrame <= frames.length-1)
        drawCurFrame();
}


//setps one frame back
function backward(){
    //alert("cur "+curFrame);
    if(curFrame == 0){
        if(!isBlackOut){
            curFrame = frames.length-1;
        }else if(isBlackOut){
            curFrame = frames.length;
        }
    }
    
    if(!isBlackOut && curFrame >= 3){
        curFrame = curFrame-4;
        drawCurFrame();
    }else if(isBlackOut && curFrame >= 2){
        curFrame = curFrame-2;
        drawCurFrame();
    }
}

function drawCurFrame(){
    context.clearRect(0, 0, canvas.width, canvas.height);
    

    //steps over blackout frames
    if(!isBlackOut){
        curFrame = curFrame+1;
    }
    
    
    context.strokeStyle = "lavender";  
    context.fillStyle = "lavender";  
    context.beginPath();
    context.moveTo(frames[curFrame].arr[0].x, frames[curFrame].arr[0].y);
    for(var i = 1; i < frames[curFrame].arr.length; i++){
            context.lineTo(frames[curFrame].arr[i].x, frames[curFrame].arr[i].y); 
    }
    context.closePath();
    context.fill();
    context.stroke();
    context.fillStyle = "rgb(0,0,0)";  
    
    if(frames[curFrame].arr.length != 3){
        context.strokeStyle = "rgb(0,0,200)"; 
        context.beginPath();
        context.moveTo(frames[curFrame].arr[0].x, frames[curFrame].arr[0].y);
        context.lineTo(frames[curFrame].mid.x, frames[curFrame].mid.y); 
        context.stroke();
    }
    
    
    if(isBlackOut && (curFrame % 2 == 1)){ //curFrame is odd
        context.strokeStyle = "black";  
        context.fillStyle = "black";  
        for(var j = 0; j < frames[curFrame].polyArr.length; j++){
            P = frames[curFrame].polyArr[j];
            context.beginPath();
            context.moveTo(P[0].x, P[0].y);
            for(var i = 1; i < P.length; i++){
                context.lineTo(P[i].x, P[i].y); 
            }
            context.closePath();
            context.fill();
            context.stroke();
        }
    }
    
    drawFindPoint();
    
    //handles drawing the last frame which says "true" or "false"
    if(curFrame >= frames.length-2){
        drawReturnVal()
        
        if(isBlackOut && curFrame == frames.length-1){
            //colours out extra area on last frame
            if(returnVal == true){
                var arr = [];
                var poly1 = extendLine(frames[curFrame].arr[0], frames[curFrame].arr[1]);
                var poly2 = extendLine(frames[curFrame].arr[1], frames[curFrame].arr[2]);
                var poly3 = extendLine(frames[curFrame].arr[2], frames[curFrame].arr[0]);
                arr.push(poly1);
                arr.push(poly2);
                arr.push(poly3);
                
                context.fillStyle = "black";  
                for(var j = 0; j < arr.length; j++){
                    P = arr[j];
                    context.beginPath();
                    context.moveTo(P[0].x, P[0].y);
                    for(var i = 1; i < P.length; i++){
                        context.lineTo(P[i].x, P[i].y); 
                    }
                    context.closePath();
                    context.fill();
                    context.stroke();
                }
                
                drawFindPoint();
                drawReturnVal();
            }else{
                context.fillStyle = "black";  
                context.beginPath();
                context.moveTo(frames[curFrame].arr[0].x, frames[curFrame].arr[0].y);
                context.lineTo(frames[curFrame].arr[1].x, frames[curFrame].arr[1].y);
                context.lineTo(frames[curFrame].arr[2].x, frames[curFrame].arr[2].y);
                context.closePath();
                context.fill();
                context.stroke();
                drawFindPoint();
                drawReturnVal();
            }
                
            reset();
            return;
        }else if(!isBlackOut){
            reset();
            return;
        }
    }
    curFrame = curFrame+1;
}

//draws "true" or "false" on the last frame
function drawReturnVal(){
    context.strokeStyle = "rgb(200,0,0)";  
    context.font = '18pt Calibri';
    var cent = centroid();
    context.strokeText(returnVal.toString(), Math.floor(cent.x), Math.floor(cent.y)); 
    context.strokeStyle = "rgb(0,0,0)";  
}

//this switches to the mode where the user should be drawing the point
//"drawFind" is a horrible names since it could be confused with the other draw functions
function drawFind(){
    if(points.length < 3){  //safety case
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.font = '18pt Calibri';
        context.fillStyle = 'black';
        context.fillText("Need 3 or more points for the algorithm to be intresting!", 10, 25);
        return;
    }
    
    
    document.getElementById("run").style.display = "inline";
    document.getElementById("drawFind").style.display = "none";
    running = true;
    drawFinding = true;
}




function drawConHull(vec){
    context.strokeStyle = "rgb(0,0,0)";  
    context.beginPath();
    context.moveTo(vec[0].x, vec[0].y);
    for(var i = 1; i < vec.length; i++){
        context.lineTo(vec[i].x, vec[i].y); 
    }
    context.closePath();
    context.stroke();
    
    //fill in Points
    for(var i = 0; i < vec.length; i++){
        context.beginPath(); 
        context.arc(vec[i].x, vec[i].y, 4, 0, 2 * Math.PI, true); 
        context.fill();
    }
}

//draws the labels for the order of points on the conhull
function drawLabels(vec){
    context.strokeStyle = "rgb(0,200,0)";  
    context.font = '18pt Calibri';
    for(var i = 0; i < vec.length; i++){
        context.strokeText(i.toString(), vec[i].x, vec[i].y); 
    } 
    context.strokeStyle = "rgb(0,0,0)";  
}

//draws the point to be found
function drawFindPoint(){
    drawConHull(conHull);
    drawLabels(conHull);
    context.fillStyle = "rgb(200,0,0)";
    context.beginPath(); 
    context.arc(findPoint.x, findPoint.y, 4, 0, 2 * Math.PI, true); 
    context.fill();
    context.fillStyle = "rgb(0,0,0)";
}

//finds the centroid of the points on the conhull
//this is where the return value message will be written
function centroid(){
    var xc = 0;
    var yc = 0;
    for(var i = 0; i < conHull.length; i++){
        xc += conHull[i].x;
        yc += conHull[i].y;
    }
    xc = xc/conHull.length;
    yc = yc/conHull.length;
    return {
       x: xc,
       y: yc
    };
}

//this extends the mid line to the ends of the canvas
//this is how the blackout polygon is determined
//just figures out the line equation and sees which sides of the canvas
//that line intersects, and where it intersects
//then it finds the the corner points on the canvas which are on the
//wrong side of the mide line.  This makes a polygon
function extendLine(p1, p2){
    //y = mx+b
    var m = (p2.y-p1.y)/(p2.x-p1.x);
    var b = p1.y - m*p1.x;
    var P = [];
    // 0, 0, canvas.width, canvas.height
    if(b >= 0 && b <= canvas.height){
        var newB = Math.floor(b);
        P.push({x:0, y:newB});
    }
    var temp = m*canvas.width+b;
    if(temp >= 0 && temp <= canvas.height){
        var newB = Math.floor(temp);
        P.push({x:canvas.width, y:newB});
    }
    //x = (y-b)/m
    temp = (b*-1)/m; 
    if(temp >= 0 && temp <= canvas.width){
        var newB = Math.floor(temp);
        P.push({x:newB, y:0});
    }
    temp = (canvas.width-b)/m; 
    if(temp >= 0 && temp <= canvas.width){
        var newB = Math.floor(temp);
        P.push({x:newB, y:canvas.height});
    }
    
    //finds corner points on wrong side of midline
    var cp = crossProduct(p1, findPoint, p2);
    var corners = [];
    corners.push({x:0, y:0});
    corners.push({x:0, y:canvas.height});
    corners.push({x:canvas.width, y:canvas.height});
    corners.push({x:canvas.width, y:0});
    for(var i = 0 ; i < corners.length; i++){
        if(cp < 0){
            if(crossProduct(p1, corners[i], p2) > 0){
                P.push(corners[i]);
            }
        }
        if(cp > 0){
            if(crossProduct(p1, corners[i], p2) < 0){
                P.push(corners[i]);
            }
        }
    }
    
    return convexHull(P); //reorders points so that I can draw lines and fill in the shape
}