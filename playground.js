function board(size, difficulty) { // how to incorporate OOP?
    this.size = size;
    this.difficulty = difficulty;
    this.boardArray = buildBoardArray(this, size, difficulty);
    this.boardHTML = buildBoardHTML();
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
    
    for( var i=-1; i<=1; i++ ) {
        for( var j=-1; j<=1; j++ ) {
            if( i != 0 && j != 0 && (x+i) >= 0 && (y+j) >= 0 ) {    // don't look at self, don't look at out of bounds
                var neighborTile = parentBoard.boardArray[x+i][y+j];
                
                if( neighborTile.type == "bomb" ) {
                    bombCount += 1;
                }
            }
        }
    }
    
    return bombCount;
}