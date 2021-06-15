var boardData = {};
var boardSize = 4;

var currentScore = 0;

function tileKey(row, col) {
  return "row" + row + "col" + col;
}

function createBoard() {
  var boardDiv = document.querySelector("#board");

  // for i in range(boardSize)
  for (var row = 0; row < boardSize; row += 1) {
    var rowDiv = document.createElement("div");
    rowDiv.classList.add("row");
    boardDiv.appendChild(rowDiv);

    for (var col = 0; col < boardSize; col += 1) {
      // create new tile divs
      var key = tileKey(row, col);
      var tileDiv = document.createElement("div");
      tileDiv.id = key;
      tileDiv.classList.add("tile");
      rowDiv.appendChild(tileDiv);
    }
  }
}

function updateBoard() {
  for (var row = 0; row < boardSize; row += 1) {
    for (var col = 0; col < boardSize; col += 1) {
      var key = tileKey(row, col);
      var value = boardData[key];

      var tileDiv = document.querySelector("#" + key);
      tileDiv.className = "tile";
      if (value) {
        tileDiv.innerHTML = value;
        tileDiv.classList.add("tile-" + value);
      } else {
        tileDiv.innerHTML = "";
      }
    }
  }

  var currentScoreSpan = document.querySelector("#current-score");
  currentScoreSpan.innerHTML = currentScore;
}

function getEmptyTiles() {
  var emptyTiles = [];

  for (var row = 0; row < boardSize; row += 1) {
    for (var col = 0; col < boardSize; col += 1) {
      var key = tileKey(row, col);
      var value = boardData[key];

      if (!value) {
        emptyTiles.push(key);
      }
    }
  }

  return emptyTiles;
}

function generateRandomTile() {
  var emptyTiles = getEmptyTiles();
  var randomIndex = Math.floor(Math.random() * emptyTiles.length);
  var randomTileKey = emptyTiles[randomIndex];

  if (randomTileKey) {
    if (Math.random() < 0.1) { // 10% chance
      boardData[randomTileKey] = 4;
    } else {
      boardData[randomTileKey] = 2;
    }
  }
}

// assumes numbers is a list of only numbers (no blanks)
function combineTiles(numbers) {
  var newNumbers = [];

  while (numbers.length > 0) { // while numbers remain in the input list
    if (numbers.length == 1) { // if only one number remains
      // add first number to new list
      newNumbers.push(numbers[0]);
      // remove first number from input list
      numbers.splice(0, 1);
    } else if (numbers[0] == numbers[1]) { // if next two numbers match
      // add em up
      var sum = numbers[0] + numbers[1];
      // add combined number to new list
      newNumbers.push(sum);
      // remove both from input list
      numbers.splice(0, 2);
      // add to the current score
      currentScore += sum;
    } else { // if next two numbers don't match
      // add first number to new list
      newNumbers.push(numbers[0]);
      // remove first number from input list
      numbers.splice(0, 1);
    }
  }

  // restore blanks (pad end of newNumbers)
  while (newNumbers.length < boardSize) {
    newNumbers.push(undefined);
  }

  return newNumbers;
}

function getNumbersInRow(row) {
  var numbers = [];

  for (var col = 0; col < boardSize; col += 1) {
    var key = tileKey(row, col);
    var value = boardData[key];
    if (value) { // SKIP BLANKS!
      numbers.push(value);
    }
  }

  return numbers;
}

function getNumbersInCol(col) {
  var numbers = [];

  for (var row = 0; row < boardSize; row += 1) {
    var key = tileKey(row, col);
    var value = boardData[key];
    if (value) { // SKIP BLANKS!
      numbers.push(value);
    }
  }

  return numbers;
}

function setNumbersInRow(row, newNumbers) {
  for (var col = 0; col < boardSize; col += 1) {
    var key = tileKey(row, col);
    var value = newNumbers[col];
    boardData[key] = value;
  }
}

function setNumbersInCol(col, newNumbers) {
  for (var row = 0; row < boardSize; row += 1) {
    var key = tileKey(row, col);
    var value = newNumbers[row];
    boardData[key] = value;
  }
}

function combineRowLeft(row) {
  var numbers = getNumbersInRow(row);
  var newNumbers = combineTiles(numbers);
  setNumbersInRow(row, newNumbers);
}

function combineRowRight(row) {
  var numbers = getNumbersInRow(row);
  numbers = numbers.reverse();
  var newNumbers = combineTiles(numbers);
  newNumbers = newNumbers.reverse();
  setNumbersInRow(row, newNumbers);
}

function combineColUp(col) {
  var numbers = getNumbersInCol(col);
  var newNumbers = combineTiles(numbers);
  setNumbersInCol(col, newNumbers);
}

function combineColDown(col) {
  var numbers = getNumbersInCol(col);
  numbers = numbers.reverse();
  var newNumbers = combineTiles(numbers);
  newNumbers = newNumbers.reverse();
  setNumbersInCol(col, newNumbers);
}

function didBoardChange(oldBoard) {
  var changed = false;

  for (var row = 0; row < boardSize; row += 1) {
    for (var col = 0; col < boardSize; col += 1) {
      var key = tileKey(row, col);
      if (oldBoard[key] != boardData[key]) {
        changed = true;
      }
    }
  }

  return changed;
}

function combineDirection(direction) {
  // make a deep copy of the board data
  var oldBoard = Object.assign({}, boardData);

  for (var i = 0; i < boardSize; i++) {
    if (direction == "left") {
      combineRowLeft(i);
    } else if (direction == "up") {
      combineColUp(i);
    } else if (direction == "right") {
      combineRowRight(i);
    } else if (direction == "down") {
      combineColDown(i);
    }
  }

  if (didBoardChange(oldBoard)) {
    generateRandomTile();
    updateBoard();
  }
  saveGame();
}





document.onkeydown = function (event) {
  // detect a key press (key down, not up)
  if (event.which == 37) {
    combineDirection("left");
  } else if (event.which == 38) {
    combineDirection("up");
  } else if (event.which == 39) {
    combineDirection("right");
  } else if (event.which == 40) {
    combineDirection("down");
  }
};


function saveGame() {
  localStorage.setItem("currentScore", currentScore);
  localStorage.setItem("boardData", JSON.stringify(boardData));
}


function loadGame() {
  currentScore = parseInt(localStorage.getItem("currentScore"), 10);
  boardData = JSON.parse(localStorage.getItem("boardData"));
  updateBoard();
}




function startNewGame() {
  boardData = {};
  currentScore = 0;
  generateRandomTile();
  generateRandomTile();
  updateBoard();
}

var newGameButton = document.querySelector("#new-game");
newGameButton.onclick = function () {
  startNewGame();
};

var getScoresButton = document.querySelector("#get-scores");
getScoresButton.onclick = function () {
  console.log("get high scores");

  fetch("https://highscoreapi.herokuapp.com/scores").then(function (response) {
  // this function runs in the future!


    response.json().then(function (data) {
      console.log("data from the server:", data);

      var scoreList = document.querySelector("#high-scores");
      scoreList.innerHTML = "";

      
      data.forEach(function (score) {
        // Create a new DOM element

        
        var scoreItem = document.createElement("li");
        // Assign content from score variable
        scoreItem.innerHTML = score.name + ": " + score.score;
        // Append created DOM element to parent element
        scoreList.appendChild(scoreItem);  
      });
    });
  });
};








var submitScoreButton = document.querySelector("#submit-score");
submitScoreButton.onclick = function () {
  console.log("submit score");


  var name = prompt("Enter your initials:");
  console.log(name, currentScore);

  var data = {
    "name": name,
    "score": currentScore
  };

  fetch("https://highscoreapi.herokuapp.com/scores", {
    // Options for Fetch
    method: "POST",
    body: JSON.stringify(data), 
    headers: {
      "Content-Type": "application/json"
    }
  }).then(function (response) {
    // Response handler function
    console.log("Successfully submitted score to server.");
  });
};






createBoard();

if (localStorage.getItem("currentScore")) {
  loadGame();
} else {
startNewGame();
}