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
    //holds the conhull points
    conHull = [];
    
    //holds antipodal pairs
    apPairs = [];

    //holds the frames which define what the algorithm looks like at each step
    frames = [];
    //holds the current frame
    curFrame = 0;
    //hold the current extended frame
    curFrameEx = 0;
    
    //extended set of frames
    framesEx = [];
    
    time = 130; //time step
  
    // holds the setTimeOut ID
    timeOutID = 0;
    //used for when user input stops and algorithm runs.  This disables new points.
    running = false;
    //determines if we are in a paused or running state
    paused = true;
 
    //last user input was forward
    lastForward = false;
    
		
    canvas.addEventListener('mousedown', function(evt){
        var mousePos = getMousePos(canvas, evt);	
        if(running == false && tooCloseToEdge(mousePos)){
            points.push(mousePos);
            var myPoints = points.slice();
            conHull = convexHull(myPoints);
            context.clearRect(0, 0, canvas.width, canvas.height);
            drawConHull(conHull);
        }   
        
    //debug.innerHTML = points.length+" ("+points[0].x+","+points[0].y+")";		
    }, false);
};

//resets the site
function myClear(){
    clearTimeout(timeOutID);
    context.clearRect(0, 0, canvas.width, canvas.height);
    document.getElementById("controls").style.display = "none";
    document.getElementById("run").style.display = "inline";
    
    //set up buttons
    document.getElementById("pause").style.display = "none";
    document.getElementById("play").style.display = "inline";
    document.getElementById("controls").style.display = "none";
    
    //holds the points in a vector
    points = [];
    //holds the conhull points
    conHull = []; 
    //holds antipodal pairs
    apPairs = [];
    //holds the frames which define what the algorithm looks like at each step
    frames = [];
    //holds the current frame
    curFrame = 0;   
    //hold the current extended frame
    curFrameEx = 0;
    //extended set of frames
    framesEx = [];
    // holds the setTimeOut ID
    timeOutID = 0;
    //used for when user input stops and algorithm runs.  This disables new points.
    running = false;
    //determines if we are in a paused or running state
    paused = true;
    //last user input was forward
    lastForward = false;
}

//because points to close to the edge look bad
function tooCloseToEdge(mousePos){
    if(mousePos.x <= 10 || mousePos.x >= canvas.width-10)
        return false;
    if(mousePos.y <= 10 || mousePos.y >= canvas.height-10)
        return false;
    
    return true;   
}

//gets the mouse positions
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

function run(){
    document.getElementById("controls").style.display = "inline";
    document.getElementById("run").style.display = "none";
    document.getElementById("backward").style.display = "inline";
    document.getElementById("forward").style.display = "inline";
    running = true;
    antipodals();
    extendFrames();
    
    curFrame = frames.length-1;
    drawCurFrame();
    curFrame = 0;  
    curFrameEx = 0;
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

//gets the next clockwise point
function getNext(ind){
    if(ind == conHull.length-1)
        return 0;
    else
        return ind+1;
}

//angle between two vectors
function getAngle(p1, p2, p3){

    //package up vectors
    var a = {
        x:p1.x - p2.x, 
        y: p1.y - p2.y
    };
    var b = {
        x: p1.x - p3.x,
        y: p1.y - p3.y
    };
    
    var dp = a.x*b.x + a.y*b.y; //dot product
    
    var aa1 = Math.sqrt(a.x*a.x + a.y*a.y); //vector lengths
    var ab2 = Math.sqrt(b.x*b.x + b.y*b.y);
 
    //bad things happen check
    if(isNaN(Math.acos(dp/(aa1*ab2)))){
        alert("dp "+dp+" ab2 "+ab2);
        alert("angle "+dp/(aa1*ab2)+",  "+Math.acos(dp/(aa1*ab2)));
    }
    return Math.acos(dp/(aa1*ab2));  
}

function crossProduct(p1, p2, p3){
    return (p2.x - p1.x)*(p3.y - p1.y) - (p2.y - p1.y)*(p3.x - p1.x);
}

//returns the closest point on a line to another point
//not neccissary but I liked doing it
function getPointOnLine(p1, p2, p3){    
    var u = ((p3.x-p1.x)*(p2.x-p1.x)+(p3.y-p1.y)*(p2.y-p1.y))/((p2.x-p1.x)*(p2.x-p1.x)+(p2.y-p1.y)*(p2.y-p1.y));
    var xN = p1.x+(u*(p2.x-p1.x));
    var yN = p1.y+(u*(p2.y-p1.y))
    return {x:xN, y:yN};
}
    
function antipodals(){
    //Conhull already found
    //find x-min and y-min
    var p1 = 0;
    var p2 = 0;
    for(var i = 1; i < conHull.length; i++){
        if(conHull[i].y < conHull[p1].y)
            p1 = i;
        if(conHull[i].y > conHull[p2].y)
            p2 = i;       
    }
    var yMin = p1;
    var yMax = p2;

    var newPair = new Pair(p1, p2);
    apPairs.push(newPair);
    
    //could make y-values all different
    
    var slope = 0; //parallel to x-axis
    
    do{
        //infinite slope
        if(! isFinite(slope)){
            slope = 10000000.0;
        }   
        
        var p1N = getNext(p1);     
        var l1b = conHull[p1].y - (slope*conHull[p1].x);
        var l10 = {
          x: 0,
          y: l1b
        };
        var l1 = getPointOnLine(conHull[p1], l10, conHull[p1N]);
        
        
        var p2N = getNext(p2);
        var l2b = conHull[p2].y - (slope*conHull[p2].x);
        var l20 = {
          x: 0,
          y: l2b
        };
        var l2 = getPointOnLine(conHull[p2], l20, conHull[p2N]);

        
        var l1Angle = getAngle(conHull[p1], l1, conHull[p1N]); 
        var l2Angle = getAngle(conHull[p2], l2, conHull[p2N]); 
        
        if(crossProduct(conHull[p1], l1, conHull[p1N]) < 0)
            l1Angle = Math.acos(-1)-l1Angle;
        if(crossProduct(conHull[p2], l2, conHull[p2N]) < 0)
            l2Angle = Math.acos(-1)-l2Angle;
        
        var supLine1 = new Pair(l1, conHull[p1]);
        var supLine2 = new Pair(l2, conHull[p2]);
        addFrame(p1, p2, supLine1, supLine2, l1Angle, l2Angle, slope)

        
        if(l1Angle > l2Angle){
            slope = (conHull[p2N].y-conHull[p2].y)/(conHull[p2N].x-conHull[p2].x);
            p2 = p2N;
            newPair = new Pair(p1, p2);
            apPairs.push(newPair);
            
        }else if(l1Angle < l2Angle){
            slope = (conHull[p1N].y-conHull[p1].y)/(conHull[p1N].x-conHull[p1].x);
            p1 = p1N;
            newPair = new Pair(p1, p2);
            apPairs.push(newPair);
            
        }else{  //parellel lines

            newPair = new Pair(p1, p2N);
            apPairs.push(newPair);
            newPair = new Pair(p1N, p2);
            apPairs.push(newPair);
            newPair = new Pair(p1N, p2N);
            apPairs.push(newPair);
            
            slope = (conHull[p1N].y-conHull[p1].y)/(conHull[p1N].x-conHull[p1].x);
            p1 = p1N;
            p2 = p2N;
        }
        
        
    }while(!(p1 == yMax && p2 == yMin));
    
    
    
    //just for adding in the last two frames
    
    
    if(! isFinite(slope)){
        slope = 10000000.0;
    }   
    p1N = getNext(p1);     
    l1b = conHull[p1].y - (slope*conHull[p1].x);
    l10 = {
        x: 0,
        y: l1b
    };
    l1 = getPointOnLine(conHull[p1], l10, conHull[p1N]);
    p2N = getNext(p2);
    l2b = conHull[p2].y - (slope*conHull[p2].x);
    l20 = {
        x: 0,
        y: l2b
    };
    l2 = getPointOnLine(conHull[p2], l20, conHull[p2N]); 
    
    l1Angle = getAngle(conHull[p1], l1, conHull[p1N]); 
    l2Angle = getAngle(conHull[p2], l2, conHull[p2N]); 
        
    if(crossProduct(conHull[p1], l1, conHull[p1N]) < 0)
        l1Angle = Math.acos(-1)-l1Angle;
    if(crossProduct(conHull[p2], l2, conHull[p2N]) < 0)
        l2Angle = Math.acos(-1)-l2Angle;
    
    var angle = Math.atan(slope)*-1;
    
    supLine1 = new Pair(l1, conHull[p1]);
    supLine2 = new Pair(l2, conHull[p2]);
    addFrame(p1, p2, supLine1, supLine2, angle, angle, slope)
    
    //last frame back to slope of 0
    var p1s = {
        x: 0,
        y: conHull[p1].y
    };
    var p2s = {
        x: 0,
        y: conHull[p2].y
    };
    
    supLine1 = new Pair(p1s, conHull[p1]);
    supLine2 = new Pair(p2s, conHull[p2]);
    addFrame(p1, p2, supLine1, supLine2, 0, 0, 0)
}

function Pair(p1N, p2N){
    this.p1 = p1N;
    this.p2 = p2N;
}

//adds a new frame to the array of frames
function addFrame(p1, p2, supLine1, supLine2, l1Angle, l2Angle, slope){
    var pairs = apPairs.slice();
    var f = new Frame(p1, p2, supLine1, supLine2, l1Angle, l2Angle, slope, pairs);
    frames.push(f);
}

//adds a new frame to the array of extended frames
function addFrameEx(p1, p2, supLine1, supLine2, l1Angle, l2Angle, slope, pairs){
    var f = new Frame(p1, p2, supLine1, supLine2, l1Angle, l2Angle, slope, pairs);
    framesEx.push(f);
}


//A fame object.  It describes what the algorithm looks like at a given step.
function Frame(p1N, p2N, supLine1N, supLine2N, l1Angle, l2Angle, slopeN, pairsN){
    //the new anitpodal pair
    this.antiP = {
        p1: p1N,
        p2: p2N
    };

    this.supLine1 = supLine1N;
    this.supLine2 = supLine2N;
    this.pairs = pairsN;
    this.idx = frames.length;
    this.idxEx = framesEx.length;
    
    this.a1 = l1Angle;
    this.a2 = l2Angle;
    
    this.slope = slopeN;
    
}

//extends the frames so that the support lines rotate by a degree each frame
function extendFrames(){
    for(var i = 0; i < frames.length-1; i++){
        var f1 = frames[i];
        f1.idxEx = framesEx.length;
        framesEx.push(f1);
        
        var pairs = f1.pairs;

        var slopeAngle1 = f1.a1;
        if(f1.a1 > f1.a2)
            slopeAngle1 = f1.a2;
         
        var angle = Math.floor(Math.abs(slopeAngle1*(180/Math.PI)));

        for(var j = 1; j < angle; j++){
            var temp = Math.atan(f1.slope)*(180/Math.PI)+j;
 
            var slope = Math.tan(temp*(Math.PI/180));
            
            if(! isFinite(slope)){
                slope = 10000000.0;
            } 
            

            var p1 = f1.antiP.p1;
            var p2 = f1.antiP.p2;
        
            var p1N = getNext(p1);     
            var l1b = conHull[p1].y - (slope*conHull[p1].x);
            var l10 = {
                x: 0,
                y: l1b
            };
            var l1 = getPointOnLine(conHull[p1], l10, conHull[p1N]);
        
        
            var p2N = getNext(p2);
            var l2b = conHull[p2].y - (slope*conHull[p2].x);
            var l20 = {
                x: 0,
                y: l2b
            };
            var l2 = getPointOnLine(conHull[p2], l20, conHull[p2N]);

        
            var supLine1 = new Pair(l1, conHull[p1]);
            var supLine2 = new Pair(l2, conHull[p2]);
            addFrameEx(p1, p2, supLine1, supLine2, 0, 0, slope, pairs);
            framesEx[framesEx.length-1].idx = f1.idx;
            
        }
        
    }
    //alert(framesEx.length)
    frames[frames.length-1].idxEx = framesEx.length;
    framesEx.push(frames[frames.length-1]);
}

function play(){
    lastForward = false;
    paused = false;
    document.getElementById("pause").style.display = "inline";
    document.getElementById("play").style.display = "none";
    document.getElementById("backward").style.display = "none";
    document.getElementById("forward").style.display = "none";
    playRun();
}

function pause(){
    lastForward = false;
    clearTimeout(timeOutID);
    paused = true;
    document.getElementById("play").style.display = "inline";
    document.getElementById("pause").style.display = "none"; 
    document.getElementById("backward").style.display = "inline";
    document.getElementById("forward").style.display = "inline";
}

function playRun(){
    drawCurFrame();
    if(curFrameEx < framesEx.length && curFrameEx != 0){
        timeOutID = setTimeout(playRun, time);
    }
}

function forward(){
    lastForward = true;
    if(curFrame < frames.length-1){
        drawCurFrame();
        curFrameEx = frames[curFrame].idxEx;
        curFrame = curFrame+1;
 
    }else if(curFrame == frames.length-1){
        drawCurFrame();
        curFrame = 0;
        curFrameEx = 0;
    }else{
        curFrame = 0;
        curFrameEx = 0;
        drawCurFrame();
    }
}


//setps one frame back
function backward(){
    if(curFrame == 0){
        curFrame = frames.length;
    }
    if(lastForward == true){
        curFrame = curFrame-1;
    }
    
    lastForward = false;
    if(curFrame >= 1){
        curFrame = curFrame-1;
        curFrameEx = frames[curFrame].idxEx;
        drawCurFrame();
    }else{
        curFrame = 0;
        curFrameEx = frames[curFrame].idxEx;
        drawCurFrame();
    }
}

function reset(){
    clearTimeout(timeOutID);
    curFrame = 0;
    curFrameEx = 0;
    pause(); 
}

function drawCurFrame(){
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    if(paused == true){
        var f = frames[curFrame];
    }else{
        var f = framesEx[curFrameEx];
        curFrame = framesEx[curFrameEx].idx+1;
        curFrameEx = curFrameEx+1;
    } 
    
    drawConHull(conHull);
    drawAntipodals(f.pairs);
    drawPoints();
    
    var p1N = getNext(f.antiP.p1);
    var p2N = getNext(f.antiP.p2);
    context.fillStyle = "darkviolet";  
    context.beginPath(); 
    context.arc(conHull[p1N].x, conHull[p1N].y, 4, 0, 2 * Math.PI, true); 
    context.fill();
    context.beginPath(); 
    context.arc(conHull[p2N].x, conHull[p2N].y, 4, 0, 2 * Math.PI, true); 
    context.fill();
    context.fillStyle = "rgb(0,0,0)";  
    
    
    drawSupLine(f.supLine1.p1, f.supLine1.p2);
    drawSupLine(f.supLine2.p1, f.supLine2.p2);
    
    
    
    
    if(curFrame == frames.length && paused == true)
        reset();
    
    if(curFrameEx == framesEx.length && paused == false)
        reset();
    
}

function drawSupLine(p1, p2){
    P = extendLine(p1, p2);
    
    context.strokeStyle = "rgb(200,0,0)";  
    context.beginPath();
    context.moveTo(P[0].x, P[0].y);
    context.lineTo(P[1].x, P[1].y); 
    context.stroke();
    context.strokeStyle = "rgb(0,0,0)";  
    
    context.fillStyle = "rgb(200,0,0)";  
    context.beginPath(); 
    context.arc(p2.x, p2.y, 4, 0, 2 * Math.PI, true); 
    context.fill();
    context.fillStyle = "rgb(0,0,0)";  
    
}

function drawAntipodals(CurApPairs){
    context.strokeStyle = "rgb(0,200,0)";  
    context.beginPath();
    //alert("DB1 "+apPairs.length);
    for(var i = 0; i < CurApPairs.length; i++){
        context.moveTo(conHull[CurApPairs[i].p1].x, conHull[CurApPairs[i].p1].y);
        context.lineTo(conHull[CurApPairs[i].p2].x, conHull[CurApPairs[i].p2].y); 
        //alert(apPairs[i].p1.x+" "+apPairs[i].p1.y+" "+apPairs[i].p2.x+" "+apPairs[i].p2.y);
        context.stroke();
    }  
    context.strokeStyle = "rgb(0,0,0)";  
    //alert("DB2");
}

function  drawPoints(){
	 
    context.fillStyle = "rgb(0,0,0)";
    for(var i = 0; i < conHull.length; i++){
        context.beginPath(); 
        context.arc(conHull[i].x, conHull[i].y, 4, 0, 2 * Math.PI, true); 
        context.fill();
    }	
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
        var newB = temp;
        P.push({x:canvas.width, y:newB});
    }
    //x = (y-b)/m
    temp = (b*-1)/m; 
    if(temp >= 0 && temp <= canvas.width){
        var newB = temp;
        P.push({x:newB, y:0});
    }
    temp = (canvas.width-b)/m; 
    if(temp >= 0 && temp <= canvas.width){
        var newB = temp;
        P.push({x:newB, y:canvas.height});
    }
    
    return P;
}