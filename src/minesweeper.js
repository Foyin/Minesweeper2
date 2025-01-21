const canvas = document.getElementById('myCanvas');
let ctx;
let mineImg;
let flagImg;
let mineHitImg;
let bombMarkedImg;
let timeValue;
let tiles;
let cols;
let rows;
let scale;
let xpos;
let ypos;
let numBombs = 9;
let timer = window.setInterval(onTimerTick, 1000);
let numFlags;
let maxFlags;
let minesLeft;
let gameState;
let flagsleft;
var start;


//Flags should always be less than bombs or mines
const EASY = {
  cols: 4,
  rows: 4,
  numBombs: 3,
  numFlags: 3
}
const NORMAL = {
  cols: 8,
  rows: 8,
  numBombs: 15,
  numFlags: 10

}
const HARD = {
  cols: 16,
  rows: 16,
  numBombs: 30,
  numFlags: 20
}

//Maybe useful later
//let bomb = Math.random() < 0.081;

function ellipse(x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.fill();
}

function setDifficulty(callback) {
    var difficultySelector = document.getElementById("difficulty");
    var difficulty = difficultySelector.selectedIndex;
    switch(difficulty) {
      case 0:
        cols = EASY.cols
        rows = EASY.rows
        numBombs = EASY.numBombs
        maxFlags = EASY.numFlags;
        scale = 40
        break;
      case 1:
        cols = NORMAL.cols
        rows = NORMAL.rows
        numBombs = NORMAL.numBombs
        maxFlags = NORMAL.numFlags;
        scale = 40
        break;
      case 2:
        cols = HARD.cols
        rows = HARD.rows
        numBombs = HARD.numBombs
        maxFlags = HARD.numFlags;
        scale = 40
        break;
      default:
        cols = EASY.cols
        rows = EASY.rows
        numBombs = EASY.numBombs
        //maxFlags = EASY.numFlags;
        scale = 40
        // code block
    }
    startTimer();
    callback();
}

function gameSetup(){
  start = Date.now();   

  numFlags = 0;
  flagsleft = 0;
  document.getElementById("mineCount").innerHTML = numBombs;
  document.getElementById("flagCount").innerHTML = maxFlags;
  document.getElementById("lose").style.visibility = "hidden";
  document.getElementById("win").style.visibility = "hidden";

  ctx = canvas.getContext('2d');
  gameState = "NEUTRAL"; // NEUTRAL, WIN or LOSE

  mineImg = new Image();
  flagImg = new Image();
  flagImg.src = "public/images/flag.png"; 
  mineHitImg = new Image();
  mineHitImg.src = "public/images/mine_hit.png";
  bombMarkedImg = new Image();
  bombMarkedImg.src = "public/images/mine_marked.png";
  //colorMode(RGB);
  //gridSet()
  ctx.canvas.width  = cols * scale;
  ctx.canvas.height = rows * scale;
  //createCanvas(cols * scale, rows * scale);
  tiles = make2DArray(cols, rows);
  for (var i = 0; i < cols; i++) {
    for (var j = 0; j < rows; j++) {
      tiles[i][j] = new tile(i, j);
    }
  }


  // Pick total Bomb spots
  var options = [];
  for (var i = 0; i < cols; i++) {
    for (var j = 0; j < rows; j++) {
      options.push([i, j]);
    }
  }


  for (var n = 0; n < numBombs; n++) {
    var index = Math.floor(Math.random() * options.length);
    var choice = options[index];
    var i = choice[0];
    var j = choice[1];
    // Deletes that spot so it's no longer an option
    options.splice(index, 1);
    tiles[i][j].isBomb = true;
  }


  for (var i = 0; i < cols; i++) {
    for (var j = 0; j < rows; j++) {
      tiles[i][j].countBombs();
    }
  }

  for (var i = 0; i < cols; i++) {
    for (var j = 0; j < rows; j++) {
      tiles[i][j].show(); 
      if(tiles[i][j].flagged && !tiles[i][j].isOpen){
        //ctx.fillStyle = "rgba(255, 0, 0)"
        //ellipse(tiles[i][j].x + tiles[i][j].w * 0.5, tiles[i][j].y + tiles[i][j].w * 0.5, tiles[i][j].w * 0.5);  
      }  
    }
  }
}

function startTimer() { 
    window.clearInterval(timer);
    timer = window.setInterval(onTimerTick, 500);
}

function stopTimer(){
  window.clearInterval(timer);
}

function onTimerTick() {
  var delta = Date.now() - start; // milliseconds elapsed since start
  //output(Math.floor(delta / 1000)); // in seconds
  // alternatively just show wall clock time:
  //var result = new Date().toUTCString()
  document.getElementById("timer").innerHTML = Math.floor(delta / 1000);
}

function make2DArray(cols, rows) {
  var arr = new Array(cols);
  for (var i = 0; i < arr.length; i++) {
    arr[i] = new Array(rows);
  }
  return arr;
}

function smileyDown() {
    var smiley = document.getElementById("smiley");
    smiley.classList.add("face_down");
    document.getElementById("win").style.visibility = "hidden";
    document.getElementById("myCanvas").style.visibility = "visible";
    setDifficulty(gameSetup);
}

function smileyUp() {
    var smiley = document.getElementById("smiley");
    document.getElementById("win").style.visibility = "hidden";
    smiley.classList.remove("face_down");
    smiley.classList.remove("face_limbo");
    smiley.classList.remove("face_win");
    smiley.classList.remove("face_lose");
}

function smileyWin() {
    var smiley = document.getElementById("smiley");
    document.getElementById("win").style.visibility = "visible";
    //document.getElementById("myCanvas").style.visibility = "hidden";
    smiley.classList.add("face_win");   
}

function smileyLose() {
    var smiley = document.getElementById("smiley");
    smiley.classList.add("face_lose");   
}


function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}

window.addEventListener('mouseup', draw);
function draw(e){
  //moveControl();
  //var mouse = getMousePos(canvas, e);
  for (var i = 0; i < cols; i++) {
    for (var j = 0; j < rows; j++) {
      tiles[i][j].show(); 
      if(tiles[i][j].flagged && !tiles[i][j].isOpen && numFlags <= maxFlags){
        //ctx.fillStyle = "rgba(255, 0, 0)"
        //ellipse(tiles[i][j].x + tiles[i][j].w * 0.5, tiles[i][j].y + tiles[i][j].w * 0.5, tiles[i][j].w * 0.5); 
        ctx.drawImage(flagImg, 
        tiles[i][j].x,
        tiles[i][j].y,
        tiles[i][j].w, 
        tiles[i][j].h);
        if(tiles[i][j].isBomb){
          ctx.drawImage(bombMarkedImg, 
            tiles[i][j].x,
            tiles[i][j].y,
            tiles[i][j].w, 
            tiles[i][j].h);
        }
      } 
    }
  }
}


window.addEventListener("mousedown", buttonControl);
function buttonControl(e) {
  var mouse = getMousePos(canvas, e);
  for (var i = 0; i < cols; i++) {
    for (var j = 0; j < rows; j++) {
      //check right
      if (e.button === 1 && !tiles[i][j].isOpen && tiles[i][j].inside(mouse)) {

        if(numFlags < maxFlags){
          if (tiles[i][j].flagged) {
            //console.log(numFlags);
            document.getElementById("flagCount").innerHTML = flagsleft;

            numFlags++;
            if(tiles[i][j].isBomb){
              numBombs++;
              numFlags++;
              document.getElementById("flagCount").innerHTML = flagsleft;
              document.getElementById("mineCount").innerHTML = numBombs;
            }
            tiles[i][j].flagged = false;
            numFlags--;
            ctx.fillStyle = "rgba(255, 255, 255)";
            ctx.fillRect(tiles[i][j].x, tiles[i][j].y, tiles[i][j].w, tiles[i][j].w);
            break;
          } 

          if (tiles[i][j].isBomb){
            numBombs--;
            document.getElementById("mineCount").innerHTML = numBombs;
          } 
          numFlags++;
          flagsleft =  maxFlags - numFlags;
          document.getElementById("flagCount").innerHTML = flagsleft;
          tiles[i][j].flagged = true;
        }
        else if(numFlags >= maxFlags){
          if (tiles[i][j].flagged) {
            //console.log(numFlags);
            if(tiles[i][j].isBomb){
              numBombs++;
              document.getElementById("flagCount").innerHTML = flagsleft;
              document.getElementById("mineCount").innerHTML = numBombs;
            }
            tiles[i][j].flagged = false;
            numFlags--;
            ctx.fillStyle = "rgba(255, 255, 255)";
            ctx.fillRect(tiles[i][j].x, tiles[i][j].y, tiles[i][j].w, tiles[i][j].w);
            break;
          }
        }
      }
      //check left
      else if (e.button === 0) {
        if (tiles[i][j].inside(mouse)) {
          if (tiles[i][j].flagged) {
            //tiles[i][j].flagged = false;
            break;
          }
          tiles[i][j].openTile();
          youWin();
          if (tiles[i][j].isBomb) {
            ctx.drawImage(mineHitImg, tiles[i][j].x , tiles[i][j].y, tiles[i][j].w, tiles[i][j].h);
            gameOver();
          } 
          
          else{
            break;
          }
        }

        switch(gameState){
          case "WIN":
            document.getElementById("win").style.visibility = "visible";
            document.getElementById("lose").style.visibility = "hidden";
            smileyWin();
          break;
          case "LOSE":
            document.getElementById("lose").style.visibility = "visible";
            document.getElementById("win").style.visibility = "hidden";
            smileyLose();
          break;
          case "NEUTRAL":
            document.getElementById("lose").style.visibility = "hidden";
            document.getElementById("win").style.visibility = "hidden";
          break;
        }
      }        
    }
  }
}

window.addEventListener("mousemove", moveControl);
function moveControl(e) {
    var mouse = getMousePos(canvas, e);
    var timeOut;
    var smiley = document.getElementById("smiley");
    smiley.classList.add("face_limbo");
    clearTimeout(timeOut);
    timeOut = setTimeout(function(){
                        smiley.classList.remove("face_limbo");
                        }, 2000);
}

function gameOver() {
  for (var i = 0; i < cols; i++) {
    for (var j = 0; j < rows; j++) {
      tiles[i][j].isOpen = true;   
    }
  }
  if( gameState === "NEUTRAL"){
    gameState = "LOSE";
    stopTimer();
  }
  
}

function youWin() {
  //noLoop();
  winCount = 0;
  for (var i = 0; i < cols; i++) {
    for (var j = 0; j < rows; j++) {
      if (tiles[i][j].isOpen && !tiles[i][j].isBomb) {
        winCount++;
      }
    }
  }
  if (winCount === ((cols * rows) - numBombs) && gameState === "NEUTRAL") {
    gameState = "WIN";
    stopTimer();
    smileyWin();
  }  
  else{
    return;
  }
}

function tile(i, j) {
  this.i = i;
  this.j = j;
  this.w = 40;
  this.h = 40;
  this.x = i * this.w;
  this.y = j * this.w;
  this.numNeighbour = 0;
  this.flagged = false;
  this.isBomb = false;
  this.isOpen = false;

  this.show = function() {
    mineImg.src = "public/images/mine.png"; 
    
    ctx.beginPath();
    ctx.rect(this.x, this.y, this.w, this.h);
    ctx.fillStyle = "rgba(127, 127, 127)";
    ctx.fill();
    ctx.lineWidth = "2";
    ctx.strokeStyle = "white";
    ctx.stroke();

    if (this.isOpen) {
      if (this.isBomb) {
          ctx.drawImage(mineImg, this.x , this.y, this.w, this.h);
      }
      else {
        ctx.beginPath();
        ctx.fillStyle = "rgba(230, 230, 230)";
        ctx.fillRect(this.x, this.y, this.w, this.w);
        if (this.numNeighbour > 0) {
          ctx.textAlign = "center";
          ctx.font = "30px Arial";
          switch(this.numNeighbour) {
            case 1:
              ctx.fillStyle = "rgba(0, 0, 180)";
              ctx.fillText(this.numNeighbour, this.x + this.w * 0.5, this.y + this.w - 6);
              break;
            case 2:
              ctx.fillStyle = "rgba(0, 120, 0)";
              ctx.fillText(this.numNeighbour, this.x + this.w * 0.5, this.y + this.w - 6);
              break;
            case 3:
              ctx.fillStyle = "rgba(255, 0, 0)";
              ctx.fillText(this.numNeighbour, this.x + this.w * 0.5, this.y + this.w - 6);
              break;
            case 4:
              ctx.fillStyle = "rgba(0, 0, 255)";
              ctx.fillText(this.numNeighbour, this.x + this.w * 0.5, this.y + this.w - 6);
              break;
            case 5:
              ctx.fillStyle = "rgba(170, 0, 0)";
              ctx.fillText(this.numNeighbour, this.x + this.w * 0.5, this.y + this.w - 6);
              break;
            case 6:
              ctx.fillStyle = "rgba(100, 0, 0)";
              ctx.fillText(this.numNeighbour, this.x + this.w * 0.5, this.y + this.w - 6);
              break;
            case 7:
              ctx.fillStyle = "rgba(0, 0, 0)";
              ctx.fillText(this.numNeighbour, this.x + this.w * 0.5, this.y + this.w - 6);
              break;
            case 8:
              ctx.fillStyle = "rgba(170, 80, 20)";
              ctx.fillText(this.numNeighbour, this.x + this.w * 0.5, this.y + this.w - 6);
              break;
            default:
               // code block
          }
        }
      }
    }
  }

  this.inside = function(mouse) {
    if (mouse.x > this.x && mouse.x < this.x + this.w && mouse.y > this.y && mouse.y < this.y + this.h) {
      return true;
    } else {
      return false;
    }
  }

  this.openTile = function() {
    this.isOpen = true;
    if (this.numNeighbour == 0) {
      // flood fill time
      this.floodFill();
    }
  }

  this.floodFill = function() {
    for (var xOffset = -1; xOffset <= 1; xOffset++) {
      var i = this.i + xOffset;
      if (i < 0 || i >= cols) continue;

      for (var yOffset = -1; yOffset <= 1; yOffset++) {
        var j = this.j + yOffset;
        if (j < 0 || j >= rows) continue;

        var neighbor = tiles[i][j];
        // Note the neighbor.bee check was not required.
        // See issue #184
        if (!neighbor.isOpen) {
          neighbor.openTile();
        }
      }
    }
  }

  this.countBombs = function() {
    if (this.isBomb) {
      this.numNeighbour = -1;
      return;
    }
    var total = 0;
    for (var xOffset = -1; xOffset <= 1; xOffset++) {
      var i = this.i + xOffset;
      if (i < 0 || i >= cols) continue;

      for (var yOffset = -1; yOffset <= 1; yOffset++) {
        var j = this.j + yOffset;
        if (j < 0 || j >= rows) continue;

        var neighbor = tiles[i][j];
        if (neighbor.isBomb) {
          total++;
        }
      }
    }
    this.numNeighbour = total;
  }
}