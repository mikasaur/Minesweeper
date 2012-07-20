// Michael Martin
// July 19 2012

function setupPage() {
    $(document).ready(function() {  // page is ready
        $("#newGame").click( function(event) {  // handle user clicking on "New Game"
            $("#lostMessage").addClass("hidden");   // Hide win/lose messages from last game
            $("#wonMessage").addClass("hidden");
            
            var gameStatus = "playing";             
            var gameBoard = new board(8, 10);       // create new board
            var boardHtml = gameBoard.boardHTML;
            
            if( $("#board").length == 0 ){          // insert board if first game
                $("#boardWrapper").append(boardHtml);
            }
            else {
             $("#board").replaceWith(boardHtml);    // otherwise replace the old one
            }
            
            $("td.unclicked").click( function(event) {  // bind click events to all tiles
                if( gameStatus == "playing" ) {
                    var tileId = $(this).attr('id');    // grab id from tile clicked
                    var xPos = tileId.split("_")[0];
                    var yPos = tileId.split("_")[1];
                    var clickedTile = getTileFromBoard(gameBoard, xPos, yPos);  // use it to get the relevant tile object
                    
                    clickTile(xPos, yPos, gameBoard);       // and click the tile
                    gameStatus = getGameStatus(clickedTile);    // check if we've won or lost
                    
                    if( gameStatus == "lost" ) {                // if we've lost...
                        $("#lostMessage.hidden").removeClass("hidden"); // unhide losing message element :(
                    }
                }
            });
            
            $("#validate").click( function(event) {    // handle user clicking "validate" during game
                gameStatus = checkIfBoardIsWinner(gameBoard);   //see if they've won or lost
                
                if( gameStatus == "lost" ) {
                    $("#lostMessage.hidden").removeClass("hidden"); // display lost message
                }
                else if( gameStatus == "won" ) {
                    $("#wonMessage.hidden").removeClass("hidden"); // display won message!
                }
            });
        });
        $("#cheat").click( function(event) {
            $(".bomb").addClass("cheating");    // apply cheating class to tile elements; made red by CSS
        });
        
    });
}


// BOARD OBJECT
// boardArray: a 2d array of Tile objects
// boardHTML: initial HTML representation of the board
function board(size, difficulty) { // board object
    this.size = size;
    this.difficulty = difficulty;
    
    var initialBoardArray = buildBoardArray(this, size);    // build blank board
    this.boardArray = populateBombs(initialBoardArray, difficulty); // add bombs for good measure
    this.boardHTML = buildBoardHTML(this);  // build HTML representation of board
}

// buildBoardArray
// input:
//          parentBoard - Board object
//          size - length of one side of board
// returns:
//          a 2d array of Tile objects
function buildBoardArray(parentBoard, size) {
    var boardArray = new Array(size);
    for( var i=0; i<size; i++ ) {
        boardArray[i] = new Array(size);
    }
    
    for( var i=0; i<size; i++ ) {       // initially populate board entirely with blanks
        for( var j=0; j<size; j++ ) {
            boardArray[i][j] = new tile(i, j, "blank", "unclicked", parentBoard);
        }
    }
    
    return boardArray;
}

// populateBombs
// input:
//          boardArray - 2d array of Tile objects
//          difficulty - number of tiles to be placed (MUST BE LESS THAN TOTAL SIZE OF BOARDARRAY)
// returns:
//          boardArray - the input array, but now some tiles have bombs in them!
function populateBombs(boardArray, difficulty) {
    
    for( var i=0; i<difficulty; i++ ) {     // iterate over your "pile" of bombs
        var convertedBombTile = convertRandomBombTile(boardArray);  // get back a random Tile that's been converted to a bomb tile
        var x = convertedBombTile.x;
        var y = convertedBombTile.y;
        
        boardArray[x][y] = convertedBombTile;   // and displace the current tile
    }
    
    return boardArray;
}

// convertRandomBombTile (recursive)
// input:
//          boardArray - a 2d array of Tile objects
// returns:
//          a Tile that has been converted to a bomb tile
// note:
//          may never return if it keeps randomly picking a bomb tile
//          runtime increases non-linearly with difficulty
function convertRandomBombTile(boardArray) {
    xPos = Math.floor(Math.random() * boardArray.length);   // pick a tile at random
    yPos = Math.floor(Math.random() * boardArray.length);
    
    var pickedTile = boardArray[xPos][yPos];
    var tileType = pickedTile.type;
    
    if( tileType == "bomb" ) {      // if that tile is already a bomb, pick again
        return convertRandomBombTile(boardArray);
    }
    else {
        pickedTile.type = "bomb";
        return pickedTile;
    }
}

// buildBoardHTML
// input:
//          parentBoard - a Board object
// returns:
//          myBoardHTML - a string representing the HTML representation of the parentBoard input; HTML table-based
function buildBoardHTML(parentBoard) {
    var boardArray = parentBoard.boardArray;    // grab the boardArray from parentBoard
    
    var myBoardHTML = "";
    
    myBoardHTML += "<table id='board' border='1'>"; // start building an HTML table
    
    for( var i=0; i<boardArray.length; i++ ) {      // iterate over all of the boardArray
        myBoardHTML += "<tr>";
        for( var j=0; j<boardArray.length; j++ ) {
            var currentTile = boardArray[i][j];
            var isBomb = currentTile.type == "bomb";
            if( isBomb ) {
                myBoardHTML += "<td class='bomb unclicked' id='" + i + "_" + j + "'><img class='hidden bomb' src='mine_image.png' /></td>";
            }
            else {
                var numberOfNeighborBombs = countNeighborBombs(currentTile, parentBoard);
                currentTile.bombCount = numberOfNeighborBombs;
                myBoardHTML += "<td class='blank unclicked' id='" + i + "_" + j + "'></td>";
            }
        }
        myBoardHTML += "</tr>";
    }

    myBoardHTML += "</table>";
    return myBoardHTML;
}

// getTileFromBoard
// inputs:
//          parentBoard -- a Board object
//          x -- number: x position of desired Tile
//          y -- number: y position of desired Tile
// returns:
//          the Tile object at the specified location
function getTileFromBoard( parentBoard, x, y ) {
    return parentBoard.boardArray[x][y];
}

// Tile object
// x -- x position of Tile
// y -- y position of Tile
// type: "blank" or "bomb"
// status: "clicked" or "unclicked"
// parentBoard: the Board object that this tile is a part of
function tile(x, y, type, status, parentBoard) { 
    this.x = x;
    this.y = y;
    this.type = type;
    this.status = status;
    this.bombCount = 0;
}

// countNeighborBombs
// inputs:
//          tile: a Tile object for which you wish to find the number of neighboring bombs
//          parentBoard: the Board object where the tile lives (not necessary?)
// returns:
//          bombCount -- a number: number of neighboring bombs to this tile
function countNeighborBombs(tile, parentBoard) {
    var bombCount = 0;
    
    var x = tile.x;
    var y = tile.y;
    
    var boardArray = parentBoard.boardArray;
    
    for( var i=-1; i<=1; i++ ) {        //iterate over all neighbors
         for( var j=-1; j<=1; j++ ) {
            if( !(i == 0 && j == 0) && (x+i) >=0 && (y+j) >=0 && (x+i) < boardArray.length && (y+j) < boardArray.length ) {    // don't look at self, don't look at out of bounds
                var neighborTile = boardArray[x+i][y+j];
                
                if( neighborTile.type == "bomb" ) {
                    bombCount += 1;
                }
            }
        }
    }
    
    return bombCount;
}

// clickTile
// inputs:
//          x -- x position of Tile to click
//          y -- y position of Tile to click
//          parentBoard -- the Board object associated with the tile to be clicked
// clicks a tile by adjusting the HTML on the page largely through jQuery
function clickTile(x, y, parentBoard) {
    var clickedTile = getTileFromBoard(parentBoard, x, y);
    var bombCount = clickedTile.bombCount;      // get the bombCount for this tile
    var tileType = clickedTile.type;
    clickedTile.status = "clicked"; 
    
    $("#"+x+"_"+y).addClass("clicked");         // adjust HTML
    $("#"+x+"_"+y).removeClass("unclicked");
    if( tileType == "blank" ) {
        $("#"+x+"_"+y).html(bombCount);
    }
    else {
        $(".bomb.hidden").removeClass("hidden");
    }
}

// getGameStatus
// inputs:
//          tile -- a Tile object (just clicked on)
// returns:
//          "lost" -- the Tile is a bomb type with a clicked status
//          "playing" -- the Tile is a blank
function getGameStatus(tile) {
    var type = tile.type;
    var status = tile.status;
    
    if( type == "bomb" && status == "clicked" ) {
        return "lost";
    }
    else {
        return "playing";
    }
}

// checkIfBoardIsWinner
// inputs:
//          board -- a Board object
// returns:
//          "lost" -- user has not clicked on all blank tiles
//          "won" -- all blank tiles clicked
// this is called when user validates game
function checkIfBoardIsWinner(board) {
    var boardArray = board.boardArray;
    
    for(var i=0; i<boardArray.length; i++) {
        for(var j=0; j<boardArray.length; j++) {
            var tileToCheck = boardArray[i][j];
            if( tileToCheck.type == "blank" && tileToCheck.status == "unclicked" ) {
                return "lost";
            }
        }
    }
    
    return "won";
}