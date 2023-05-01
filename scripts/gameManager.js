// Game Start
var colorToMove = "White";
// Starting FEN String

loadPositionFromFen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");
// loadPositionFromFen("7k/8/5pp1/8/8/8/1PP5/5K2");
var whiteKingId = parseInt(
	document.querySelector(".White.King").id.substring(1)
);
var blackKingId = parseInt(
	document.querySelector(".Black.King").id.substring(1)
);
Board.printBoard();
precomputedData();
calculateMoves();
