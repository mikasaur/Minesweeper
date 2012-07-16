function setupPage() {
    $(document).ready(function() {
        $("#newGame").click( function(event) {
           var gameBoard = new board(10, .75);
           var boardHtml = gameBoard.boardHTML;
           
           if( $("#board").length == 0 ){
                $("#boardWrapper").append(boardHtml);
            }
            else {
                $("#board").replaceWith(boardHtml);
            }
            
            $("td.unclicked").click( function(event) {
                $(this).removeClass("unclicked");
                $(this).addClass("clicked");
            });
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
                myBoardHTML += "<td class='bomb unclicked'><img src='mine_image.png' /></td>";
            }
            else {
                var numberOfNeighborBombs = countNeighborBombs(currentTile, parentBoard);
                myBoardHTML += "<td class='blank unclicked'>" + numberOfNeighborBombs + "</td>";
            }
        }
        myBoardHTML += "</tr>";
    }

    myBoardHTML += "</table>";
    return myBoardHTML;
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