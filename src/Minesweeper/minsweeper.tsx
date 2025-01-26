
import { useRef, useState, useEffect } from "react"; 
import axios from "axios";
import { winner } from "../winnerInterface";

//@ts-ignore
import confetti from 'https://cdn.skypack.dev/canvas-confetti'; 

interface MinesweeperProps{
  username: string;
}

const Minesweeper = ( { username }: MinesweeperProps ) => {
  const [winnerList, setWinnerList] = useState<winner[]>([])

  const canvas = useRef<HTMLCanvasElement>(null)
  let ctx;

  let mineImg;
  let flagImg;
  let mineHitImg;
  let bombMarkedImg;
  let cols;
  let rows;
  let scale;
  let numBombs;
  let numFlags;
  let maxFlags;

  let tiles;
  let gameState;
  let flagsleft;
  var start;
  let currPlayerTime = 0;
  let timer;
  let score;
  let scoreMultiplier;
  let formattedTime;

  function addWinner(user: string, score: number){
    if(winnerList.length <= 10){
      setWinnerList([...winnerList, {
        username: user,
        score: score
      }])
    } else {
      const lowestSccoreWinner = winnerList.reduce((min, user) => user.score < min.score ? user : min).username
      deleteWinnerFromLeaderboard(lowestSccoreWinner);
      setWinnerList(winnerList.filter(user => user.username !== lowestSccoreWinner));
      setWinnerList([...winnerList, {
        username: user,
        score: score
      }])
    }
    
  }

  function getLeaderboard(  ){
      axios.get(import.meta.env.VITE_DB_ENDPOINT)
     .then(function (response) {
       // handle success
       setWinnerList(response.data);
       // get player with lowest score to delete
       setDifficulty(gameSetup);
       console.log(response.data);
     })
     .catch(function (error) {
       // handle error
       console.log(error);
     })
   }

  function addWinnerToLeaerboard (username: string, score: number){
    axios({
      method: 'put',
      url: import.meta.env.VITE_DB_ENDPOINT,
      data: {
        username: username,
        score: score
      }
    })
    .then(function (response) {
      addWinner(username, score);
      // handle success
      console.log(response);
    })
    .then(function() { 
      getLeaderboard()
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    })
  }

  function deleteWinnerFromLeaderboard (username: string){
    axios.delete(`${import.meta.env.VITE_DB_ENDPOINT}/"${username}"`)
    .then(function (response) {
      // handle success
      console.log(response);
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    })
  }
  
  function setDifficulty ( callback: () => void )  {
      var difficultySelector = document.getElementById("difficulty") as HTMLSelectElement;
      if(difficultySelector){
        //Flags should always be less than bombs or mines
        const EASY = {
          cols: 4,
          rows: 4,
          numBombs: 1,
          numFlags: 3,
          scoreMultiplier: 2560
        }
        const NORMAL = {
          cols: 8,
          rows: 8,
          numBombs: 15,
          numFlags: 10,
          scoreMultiplier: 5140
        }
        const HARD = {
          cols: 16,
          rows: 16,
          numBombs: 30,
          numFlags: 20,
          scoreMultiplier: 10240
        }
        var difficulty = difficultySelector.selectedIndex;
        switch(difficulty) {
          case 0:
            cols = EASY.cols
            rows = EASY.rows
            numBombs = EASY.numBombs
            maxFlags = EASY.numFlags;
            scoreMultiplier = EASY.scoreMultiplier
            scale = 40
            break;
          case 1:
            cols = NORMAL.cols
            rows = NORMAL.rows
            numBombs = NORMAL.numBombs
            maxFlags = NORMAL.numFlags;
            scoreMultiplier = NORMAL.scoreMultiplier
            scale = 40
            break;
          case 2:
            cols = HARD.cols
            rows = HARD.rows
            numBombs = HARD.numBombs
            maxFlags = HARD.numFlags;
            scoreMultiplier = HARD.scoreMultiplier
            scale = 40
            break;
          default:
            cols = EASY.cols
            rows = EASY.rows
            numBombs = EASY.numBombs
            maxFlags = EASY.numFlags;
            scale = 40
            // code block
        }
      }
      callback();
   }

  
  //const [currPlayerTime, setCurrPlayerTime] = useState<number>(0)


  //Maybe useful later
  //let bomb = Math.random() < 0.081;

  function ellipse(x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
  }



  function gameSetup( ){
      start = Date.now();   
      startTimer()
      console.log(canvas)

      numFlags = 0;
      flagsleft = 0;
      document.getElementById("mineCount").innerHTML = " " + numBombs.toString();
      document.getElementById("flagCount").innerHTML = " " + maxFlags.toString();
      document.getElementById("lose").style.visibility = "hidden";
      document.getElementById("win").style.visibility = "hidden";

      if(canvas.current){

            ctx = canvas.current.getContext('2d');
            
            gameState = "NEUTRAL"; // NEUTRAL, WIN or LOSE

            mineImg = new Image();
            flagImg = new Image();
            flagImg.src = "images/flag.png"; 
            mineHitImg = new Image();
            mineHitImg.src = "images/mine_hit.png";
            bombMarkedImg = new Image();
            bombMarkedImg.src = "images/mine_marked.png";
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
                var i: number = choice[0];
                var j: number = choice[1];
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
  }

// Helper function to format time as MM:SS
  function formatTime(minutes, seconds) {
    // Add leading zeros if necessary
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;

    return `${formattedMinutes}:${formattedSeconds}`;
  }

  function updateTimerDisplay(){
    
  }

  useEffect(() => {
    return () => {
      getLeaderboard()
      //clearInterval(timer);
    };
  }, []);

  function  startTimer() { 
    console.log("start")
    clearInterval(timer);
    //setTimeout(() => clearInterval(timer), 1000)
    timer = setInterval(onTimerTick, 1000);
  }

  function resetTimer(){
    if (timer){
      clearInterval(timer);
    }
    timer = setInterval(onTimerTick, 1000);
  }

  function stopTimer(){
    clearInterval(timer);
  }

  function onTimerTick() {
    let delta = Date.now() - start; 
    // milliseconds elapsed since start
    //output(Math.floor(delta / 1000)); // in seconds
    // alternatively just show wall clock time:
    //var result = new Date().toUTCString()
      // Calculate the time in seconds and minutes
    const totalSeconds = Math.floor(delta / 1000);
    const minutes = Math.floor(totalSeconds / 60); // Total minutes
    const seconds = totalSeconds % 60; // Remaining seconds
    const timeToReset = 300;
    score = (timeToReset - totalSeconds) * scoreMultiplier;

    // Format the time as MM:SS
    formattedTime = formatTime(minutes, seconds);
    //console.log(formattedTime)

    if (totalSeconds >= timeToReset) {
      setDifficulty(gameSetup)
    }
    // Update the timer display in the DOM
    const timerDivElement = document.getElementById("timer");
    if (timerDivElement) {
        timerDivElement.innerHTML = " " + formattedTime.toString();
    }
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
      if(canvas.current){
          var rect = canvas.current.getBoundingClientRect();
          return {
              x: evt.clientX - rect.left,
              y: evt.clientY - rect.top
          };
      }
  }

  window.addEventListener('mouseup', draw);
  function draw(e){
    //moveControl();
    var mouse = getMousePos(canvas, e);
    if(ctx){
      if(mouse){
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
    }
  }


  window.addEventListener("mousedown", buttonControl);
  function buttonControl(e) {
    var mouse = getMousePos(canvas, e);
      if(ctx){
        if(mouse){
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
                      document.getElementById("mineCount").innerHTML = numBombs.toString();
                      }
                      tiles[i][j].flagged = false;
                      numFlags--;
                      ctx.fillStyle = "rgba(255, 255, 255)";
                      ctx.fillRect(tiles[i][j].x, tiles[i][j].y, tiles[i][j].w, tiles[i][j].w);
                      break;
                  } 

                  if (tiles[i][j].isBomb){
                      numBombs--;
                      document.getElementById("mineCount").innerHTML = numBombs.toString();
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
                        document.getElementById("mineCount").innerHTML = numBombs.toString();
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
      }
  }

  window.addEventListener("mousemove", moveControl);
  function moveControl(e) {
      var mouse = getMousePos(canvas, e);
      var timeOut;
      var smiley = document.getElementById("smiley") as HTMLSelectElement;
      if(mouse){
        if(smiley){
          smiley.classList.add("face_limbo");
          clearTimeout(timeOut);
          timeOut = setTimeout(function(){
                              smiley.classList.remove("face_limbo");
                              }, 2000);
        }
      }
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
    let winCount = 0;
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
      if(username){
        addWinnerToLeaerboard(username, score)        
      }
      confetti({
        particleCount: 225,
        startVelocity: 10,
        spread: 360,
        origin: {
          x: Math.random(),
          // since they fall down, start a bit higher than random
          y: Math.random() - 0.2
        }
      });
      confetti({
        particleCount: 350,
        startVelocity: 25,
        spread: 360,
        origin: {
          x: Math.random(),
          // since they fall down, start a bit higher than random
          y: Math.random() - 0.2
        }
      });
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
      mineImg.src = "images/mine.png"; 

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


      return (
          <div>
          <title>Minesweeper</title>
          <link type="image/x-icon" href="public/mine.ico?"  />
          <meta charSet="utf-8"/>


          <div>
          <h1> Minesweeper </h1>

          <div onLoad={() => setDifficulty(gameSetup)}>
            <div className="gameInfoSection">
              <select id="difficulty" >
                <option value="0">Easy</option>
                <option value="1">Normal</option>
                <option value="2">Hard</option>
              </select>
              
              <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
              <span><img className="icons" src="images/mine.png"/></span>
              <span id="mineCount" className="gameData"> </span>
              
              <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
              <span><img className="icons" src="images/flag.png"/></span>
              <span id="flagCount" className="gameData"> </span>
              
              <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
              <span>
                  <img src="images/timer.png" className="icons"/>
              </span>
              <span id="timer" className="gameData"> </span>
              <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
              </div>
          </div>
          
          <div id="smiley" className="smiley" onMouseDown={() => smileyDown()} onMouseUp={() =>  smileyUp()}  ></div>
          <div className="winLoseBanner">
              <div id="win" className="winLose">
                  <b>You Win!</b>
              </div>

              <div id="lose" className="winLose">
              <b> You Lose!</b>
              </div>
          </div>
          <div id="minefield">
              <div id="gameArea">
                  <canvas ref={canvas} id="myCanvas"></canvas>
                  <div id="infoSection">
                      <div>    
                          <h2>How To Play</h2>
                          <ul>
                              <li>Adjacent is defined by the 8 tiles surrounding the target tile, on the diagonal, horizontal, and vertical planes</li>
                              <li>A left click reveals a tile, if not flagged</li>
                              <li>A right click flags a tile or unflag a tile if already flagged</li>
                              <li>An tile opened without a bomb under it reveals the number of adjacent tiles with bombs under them, under it. </li>
                              <li>A middle click reveals all hidden, unflagged, and adjacent tiles (Click roller on mouse to set flag, if you are not using a mouse you may not be able to use this feature)
                                  <span> This only works if:
                                      <ol>
                                          <li>The tile clicked on is revealed</li>
                                          <li>The tile clicked on has a number on it</li>
                                          <li>The number of adjacent flags matches the number on the tile clicked on</li>
                                      </ol>
                                  </span>
                              </li>
                              <li>A tile will not be revealed by any means (middle click or left click) if the tile is flagged</li>
                              <li>There are limited number of flags that can be set at each level</li>
                              <li>A revealed tile will display a number indicating how many mines it is adjacent to it</li>
                              <li>Setting a flag on a tile with a bomb under it marks the mine location and shows you mine without ending game</li>
                              <li>If a tile is revealed and is not adjacent to any mines, it will reveal all adjacent tiles. This includes adjacent tiles with numbers on them</li>
                              <li>A timer will keep track of the how long the user has been playing, this impacts the player score</li>
                              <li>A counter will show how many mines are left, relative to the number of flags planted</li>
                              <li>When all of the non-mine tiles are revealed the game is over. A player does not need to flag all of the mines to win</li>
                              <li>When a player reveals a mine, the game is over</li>
                              <li>Left click smiley to reset game and timer</li>
                              <li>After choosing new difficulty, left click smiley to start new game </li>
                              <li>You final score = (timeToReset - totalSeconds) * scoreMultiplier</li>
                              <li>ScoreMultiplier is higher the harder the difficulty</li>
                              <li>Game automatically resets after 5 minutes</li>


                          </ul>
                      </div>
                      <div>
                          <h2> Leaderboard  </h2>
                          <div className={"winnerList"}>
                          {
                            winnerList.length !== 0 ? 
                              winnerList?.sort((a, b) => (b.score - a.score)).map((item: winner, index) => 
                                {return (
                                          <div key={index} className="winner">
                                            <div>{item.username}</div>
                                            <div>{item.score}</div>
                                          </div>
                                )
                                }
                              )
                              : <div></div>  
                          }
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
          </div>
      );
}

export default Minesweeper;
