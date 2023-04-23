const Piece = {
	None: 0,
	King: 1,
	Pawn: 2,
	Knight: 3,
	Bishop: 4,
	Rook: 5,
	Queen: 6,
	White: 8,
	Black: 16,
};

const pieceTypeFromSymbol = {
	k: [Piece.King, "King"],
	p: [Piece.Pawn, "Pawn"],
	n: [Piece.Knight, "Knight"],
	b: [Piece.Bishop, "Bishop"],
	r: [Piece.Rook, "Rook"],
	q: [Piece.Queen, "Queen"],
};

// Convert piece index to color and piece classes
function pieceIndexToClasses(pieceIndex) {
	const remainder = pieceIndex % (Piece.Black * 2);
	const color = remainder < Piece.Black ? "White" : "Black";
	const pieceType = remainder % 8;

	if (pieceType === 0) {
		return [];
	}

	return [
		color,
		pieceTypeFromSymbol[Object.keys(pieceTypeFromSymbol)[pieceType - 1]][1],
	];
}

// Place a piece on the board
function placePiece(pieceIndex, cPosition, rank, file) {
	if (cPosition !== 0) {
		cPosition = cPosition.substring(1);
		rank = Math.floor((63 - cPosition) / 8);
		file = cPosition % 8;
	}

	Board.ChessBoard[rank][file] = pieceIndex;
	const place_cell_num = 64 - 8 * (rank + 1) + file;
	const place_cell_id = "c" + place_cell_num;
	const img = document.createElement("img");

	img.setAttribute("id", "p" + place_cell_num);
	img.src = "./pieces/p" + pieceIndex.toString() + ".svg";

	const pieceClasses = pieceIndexToClasses(pieceIndex);
	img.classList.add(pieceClasses[0], pieceClasses[1]);

	const x = document.getElementById(place_cell_id);
	x.appendChild(img);

	Board.movesMade += 1;
}

// Load position from FEN notation
function loadPositionFromFen(fen) {
	let file = 0,
		rank = 0;

	for (const symbol of fen) {
		if (symbol === "/") {
			rank = 0;
			file++;
		} else {
			if (parseInt(symbol) >= 0) {
				rank += parseInt(symbol, 10);
			} else {
				const pieceColor =
					symbol === symbol.toUpperCase() ? Piece.White : Piece.Black;
				const symbolLower = symbol.toLowerCase();
				const pieceType = pieceTypeFromSymbol[symbolLower][0];
				const finalPiece = pieceColor + pieceType;

				placePiece(finalPiece, 0, file, rank);
				rank++;
			}
		}
	}
}
