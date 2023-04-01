// Values assigned to pieces are such that each piece and each color can be represented in binary:
// The last 3 digits will be the type of piece and the first 2 will be the color of it.

const Piece = {
	None: 0,

	King: [1],
	Pawn: [2],
	Knight: [3],
	Bishop: [4, (isSliding = true)],
	Rook: [5, (isSliding = true)],
	Queen: [6, (isSliding = true)],

	White: [8, (isColor = "White")],
	Black: [16, (isColor = "Black")],
};

var pieceTypeFromSymbol = {
	k: [Piece.King[0], "King"],
	p: [Piece.Pawn[0], "Pawn"],
	n: [Piece.Knight[0], "Knight"],
	b: [Piece.Bishop[0], "Bishop"],
	r: [Piece.Rook[0], "Rook"],
	q: [Piece.Queen[0], "Queen"],
};

function pieceIndexToClasses(pieceIndex) {
	let remainder;
	let pieceClasses = [];
	if (pieceIndex % Piece.Black[0] <= 6) {
		remainder = pieceIndex % Piece.Black[0];
		pieceClasses[0] = "Black";
	} else {
		pieceClasses[0] = "White";
		remainder = pieceIndex % Piece.White[0];
	}
	if (remainder == 1) {
		pieceClasses[1] = "King";
	} else if (remainder == 2) {
		pieceClasses[1] = "Pawn";
	} else if (remainder == 3) {
		pieceClasses[1] = "Knight";
	} else if (remainder == 4) {
		pieceClasses[1] = "Bishop";
	} else if (remainder == 5) {
		pieceClasses[1] = "Rook";
	} else if (remainder == 6) {
		pieceClasses[1] = "Queen";
	}
	return pieceClasses;
}

function placePiece(pieceIndex, cPosition, rank, file) {
	if (cPosition != 0) {
		cPosition = cPosition.substring(1);
		rank = Math.floor((63 - cPosition) / 8);
		file = cPosition % 8;
	}
	Board.ChessBoard[rank][file] = pieceIndex;
	let place_cell_num = 64 - 8 * (rank + 1) + file;
	let place_cell_id = "c" + place_cell_num;
	let img = document.createElement("img");
	img.setAttribute("id", "p" + (64 - 8 * (rank + 1) + file));
	img.src = "./pieces/p" + pieceIndex.toString() + ".svg";
	img.classList.add(
		pieceIndexToClasses(pieceIndex)[0],
		pieceIndexToClasses(pieceIndex)[1]
	);
	let x = document.getElementById(place_cell_id);
	x.appendChild(img);
	Board.movesMade += 1;
}

function loadPositionFromFen(fen) {
	let file = 0,
		rank = 0,
		pieceColor,
		pieceType;
	for (let symbol of fen) {
		if (symbol == "/") {
			rank = 0;
			file = file + 1;
		} else {
			if (parseInt(symbol) >= "0") {
				rank = parseInt(symbol, 10) + rank;
			} else {
				if (symbol == symbol.toUpperCase()) {
					pieceColor = Piece.White[0];
				} else {
					pieceColor = Piece.Black[0];
				}
				pieceType = pieceTypeFromSymbol[symbol.toLowerCase()][0];
				var finalPiece = pieceColor + pieceType;
				placePiece(finalPiece, 0, file, rank);
				rank = rank + 1;
			}
		}
	}
}
