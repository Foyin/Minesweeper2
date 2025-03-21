# Minesweeper2
Classic minesweeper game web app with AWS cloud based sign on capabilities and a leaderboard. Users can play the game without signing in or create an account and sign in to save their score on the leaderboard for others to see. Only the top ten scores are saved and displayed.

Made using: TypeScript, ReactJS, CSS, Canvas API, AWS API Gateway, AWS DynamoDB, AWS Cognito, AWS Amplify

[Live Demo](https://main.d2ysmtqiejbryk.amplifyapp.com/)
## How To Play

- Adjacent is defined by the 8 tiles surrounding the target tile, on the diagonal, horizontal, and vertical planes.
- A left click reveals a tile, if not flagged.
- A right click flags a tile or unflags a tile if already flagged.
- A tile opened without a bomb under it reveals the number of adjacent tiles with bombs under them.
- A middle click reveals all hidden, unflagged, and adjacent tiles (Click roller on mouse to set flag, if you are not using a mouse you may not be able to use this feature).  
  **This only works if:**
  1. The tile clicked on is revealed.
  2. The tile clicked on has a number on it.
  3. The number of adjacent flags matches the number on the tile clicked on.
- A tile will not be revealed by any means (middle click or left click) if the tile is flagged.
- There are a limited number of flags that can be set at each level.
- A revealed tile will display a number indicating how many mines it is adjacent to.
- Setting a flag on a tile with a bomb under it marks the mine location and shows you the mine without ending the game.
- If a tile is revealed and is not adjacent to any mines, it will reveal all adjacent tiles. This includes adjacent tiles with numbers on them.
- A timer will keep track of how long the user has been playing, this impacts the player score.
- A counter will show how many mines are left, relative to the number of flags planted.
- When all of the non-mine tiles are revealed, the game is over. A player does not need to flag all of the mines to win.
- When a player reveals a mine, the game is over.
- Left click the smiley to reset the game and timer.
- After choosing a new difficulty, left click the smiley to start a new game.
- Your final score = (timeToReset - totalSeconds) * scoreMultiplier.
- ScoreMultiplier is higher the harder the difficulty.
- Game automatically resets after 5 minutes.

