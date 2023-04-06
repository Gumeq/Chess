// Game Start
var colorToMove = "White";
document.getElementById("menuColorToMove").textContent = colorToMove;
loadPositionFromFen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");
var whiteKingId = parseInt(
	document.querySelector(".White.King").id.substring(1)
);
var blackKingId = parseInt(
	document.querySelector(".Black.King").id.substring(1)
);
// loadPositionFromFen("8/3p4/8/8/2P5/8/8/8");
Board.printBoard();
PrecomputedData();
