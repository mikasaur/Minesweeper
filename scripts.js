function setupPage() {
    $(document).ready(function() {
        $("#newGame").click( function(event) {
            $("#lostMessage").addClass("hidden");
            $("#wonMessage").addClass("hidden");
            
            var gameStatus = "playing";
            var gameBoard = new board(8, .75);
            var boardHtml = gameBoard.boardHTML;
            
            if( $("#board").length == 0 ){
                $("#boardWrapper").append(boardHtml);
            }
            else {
             $("#board").replaceWith(boardHtml);
            }
            
            $("td.unclicked").click( function(event) {
                if( gameStatus == "playing" ) {
                    var tileId = $(this).attr('id');
                    var xPos = tileId.split("_")[0];
                    var yPos = tileId.split("_")[1];
                    var clickedTile = getTileFromBoard(gameBoard, xPos, yPos);
                    
                    clickTile(xPos, yPos, gameBoard);
                    gameStatus = getGameStatus(clickedTile);
                    
                    if( gameStatus == "lost" ) {
                        $("#lostMessage.hidden").removeClass("hidden");
                    }
                }
            });
            
            $("#validate").click( function(event) {
                gameStatus = checkIfBoardIsWinner(gameBoard);
                
                if( gameStatus == "lost" ) {
                    $("#lostMessage.hidden").removeClass("hidden");
                }
                else if( gameStatus == "won" ) {
                    $("#wonMessage.hidden").removeClass("hidden");
                }
            });
        });
        $("#cheat").click( function(event) {
            $(".bomb").addClass("cheating");
        });
        
    });
}

function board(size, difficulty) { // how to incorporate OOP?
    this.size = size;
    this.difficulty = difficulty;
    this.boardArray = buildBoardArray(this, size, difficulty);
    this.boardHTML = buildBoardHTML(this);
}

function buildBoardArray(parentBoard, size, difficulty) {
    var boardArray = new Array(size);
    for( var i=0; i<size; i++ ) {
        boardArray[i] = new Array(size);
    }
    
    for( var i=0; i<size; i++ ) {
        for( var j=0; j<size; j++ ) {
            var randomNumber = Math.random();
            if( randomNumber > difficulty ){
                boardArray[i][j] = new tile(i, j, "bomb", "unclicked", parentBoard);
            }
            else {
                boardArray[i][j] = new tile(i, j, "blank", "unclicked", parentBoard);
            }
        }
    }
    
    return boardArray;
}

function buildBoardHTML(parentBoard) {
    var boardArray = parentBoard.boardArray;
    
    var myBoardHTML = "";
    
    myBoardHTML += "<table id='board' border='1'>";
    
    for( var i=0; i<boardArray.length; i++ ) {
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

function getTileFromBoard( parentBoard, x, y ) {
    return parentBoard.boardArray[x][y];
}

function tile(x, y, type, status, parentBoard) { // how to incorporate OOP?
    this.x = x;
    this.y = y;
    this.type = type;
    this.status = status;
    this.bombCount = 0;
}

function countNeighborBombs(tile, parentBoard) {
    var bombCount = 0;
    
    var x = tile.x;
    var y = tile.y;
    
    var boardArray = parentBoard.boardArray;
    
    for( var i=-1; i<=1; i++ ) {
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

function clickTile(x, y, parentBoard) {
    var clickedTile = getTileFromBoard(parentBoard, x, y);
    var bombCount = clickedTile.bombCount;
    var tileType = clickedTile.type;
    clickedTile.status = "clicked";
    
    $("#"+x+"_"+y).addClass("clicked");
    $("#"+x+"_"+y).removeClass("unclicked");
    if( tileType == "blank" ) {
        $("#"+x+"_"+y).html(bombCount);
    }
    else {
        $(".bomb.hidden").removeClass("hidden");
    }
}

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