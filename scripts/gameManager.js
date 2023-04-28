// Game Start
var colorToMove = "White";
// Starting FEN String

loadPositionFromFen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");
// loadPositionFromFen("8/4k3/8/8/1N6/3Q1R2/6B1/K7");
var whiteKingId = parseInt(
	document.querySelector(".White.King").id.substring(1)
);
var blackKingId = parseInt(
	document.querySelector(".Black.King").id.substring(1)
);
Board.printBoard();
precomputedData();
