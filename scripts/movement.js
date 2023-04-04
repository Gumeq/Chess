"use strict";

const board = document.getElementById("board");
const cells = document.querySelectorAll(".cell");

let selectedId = "none";
let selectedIndex = 0;
const selected = document.getElementById(selectedId);

let childId;

const DirectionOffset = [8, -8, -1, 1, 7, -7, 9, -9];
const DirectionOffsetKnight = [17, 10, -6, 15, -10, -17, 6, -15];
var NumSquaresToEdge = [[], []];

var moves = new Array();

const Move = {
	StartSquare: 0,
	TargetSquare: 0,
};

// check things

var whiteAttacks = new Array();
var BlackAttacks = new Array();
var whitePinned = new Array();
var blackPinned = new Array();

for (let i = 0; i < cells.length; i++) {
	cells[i].addEventListener("click", function () {
		// check if the clicked cell has any child nodes (i.e., pieces)
		if (this.hasChildNodes()) {
			// get the clicked piece and its color
			const clickedPiece = this.children[0];
			const clickedPieceColor = clickedPiece.classList[0];

			// check if there is a selected piece
			if (selectedId !== "none") {
				// get the selected piece and its color
				const selectedPiece = document.getElementById(selectedId);
				const selectedPieceColor = selectedPiece.classList[0];

				// check if the clicked piece is a different color from the selected piece
				if (clickedPieceColor !== selectedPieceColor) {
					// check if the clicked cell is included in the valid moves for the selected piece
					const clickedCellId = parseInt(this.id.substring(1));
					if (moves.includes(clickedCellId)) {
						// move the selected piece to the clicked cell, removing any piece that was already there
						this.removeChild(clickedPiece);
						placePiece(selectedIndex, this.id);
						selectedPiece.remove();

						// clean up and update the UI
						this.parentElement.classList.remove("selected");
						deleteMoves();
						selectedId = "none";
						moveMade();
					}
				} else if (selectedId === clickedPiece.id) {
					// toggle the selected state of the clicked cell if it is the same as the selected piece
					this.classList.toggle("selected");
					selectedId = "none";
					deleteMoves();
				} else {
					// set the clicked cell as the new selected piece if it is a different piece of the same color
					deleteMoves();
					this.classList.toggle("selected");
					selectedId = clickedPiece.id;
					const selectedPieceType = Piece[clickedPiece.classList[1]];
					selectedIndex =
						parseInt(
							clickedPieceColor === "Black"
								? Piece.Black[0]
								: Piece.White[0]
						) + parseInt(selectedPieceType);
					GenerateMoves(parseInt(selectedId.substring(1)));
				}
			} else if (clickedPieceColor === colorToMove) {
				// set the clicked cell as the new selected piece if there is no current selection and it is the correct color
				this.classList.toggle("selected");
				selectedId = clickedPiece.id;
				const selectedPieceType = Piece[clickedPiece.classList[1]];
				selectedIndex =
					parseInt(
						clickedPieceColor === "Black"
							? Piece.Black[0]
							: Piece.White[0]
					) + parseInt(selectedPieceType);
				GenerateMoves(parseInt(selectedId.substring(1)));
			}
		} else if (selectedId !== "none") {
			// check if there is a selected piece and the clicked cell is a valid move for that piece
			const clickedCellId = parseInt(this.id.substring(1));
			if (moves.includes(clickedCellId)) {
				// move the selected piece to the clicked cell, removing any piece that was already there
				const selectedPiece = document.getElementById(selectedId);
				selectedPiece.parentElement.classList.remove("selected");
				deleteMoves();
				selectedPiece.remove();
				placePiece(selectedIndex, this.id);
				selectedId = "none";
				moveMade();
			}
		}
	});
}

// This function removes the "moves" class from all elements that have it and clears the moves array.
function deleteMoves() {
	const moveElements = document.querySelectorAll(".moves");
	moveElements.forEach((element) => {
		element.classList.remove("moves");
	});
	moves.length = 0;
}

// This function increments the number of moves made and changes the color to move to the opposite color.
function moveMade() {
	Board.movesMade += 1;
	if (colorToMove == "White") {
		colorToMove = "Black";
	} else {
		colorToMove = "White";
	}
}

// This function precomputes data for the number of squares in each direction from a given square on the board.
function PrecomputedData() {
	for (let rank = 0; rank < 8; rank++) {
		for (let file = 0; file < 8; file++) {
			// Compute the number of squares in each direction.
			const numNorth = 7 - rank;
			const numSouth = rank;
			const numWest = file;
			const numEast = 7 - file;

			// Compute the minimum number of squares in each diagonal direction.
			const NWMin = Math.min(numNorth, numWest);
			const SEMin = Math.min(numSouth, numEast);
			const NEMin = Math.min(numNorth, numEast);
			const SWMin = Math.min(numSouth, numWest);

			// Compute the index of the square in the NumSquaresToEdge array.
			const squareIndex = rank * 8 + file;
			// Store the computed data for this square in the NumSquaresToEdge array.
			NumSquaresToEdge[squareIndex] = {
				numNorth,
				numSouth,
				numWest,
				numEast,
				NWMin,
				SEMin,
				NEMin,
				SWMin,
			};
		}
	}
}

// This function checks whether a given square index is on the board.
function isSquareOnBoard(square) {
	return square >= 0 && square <= 63;
}

// This function adds the "moves" class to all elements corresponding to the moves in the moves array.
function paintMoves() {
	for (let n = 0; n < moves.length; n++) {
		document.getElementById("c" + moves[n]).classList.toggle("moves");
	}
}

// This function generates moves for a given chess piece based on its type and current position
function GenerateMoves(cPosition) {
	// Determine the rank and file of the current position on the board
	const rank = Math.floor((63 - cPosition) / 8);
	const file = cPosition % 8;
	// Get the piece element corresponding to the current position
	const piece = document.getElementById("c" + cPosition);
	// Check if the piece is present on the board and belongs to the player who is currently making the move
	if (piece.hasChildNodes()) {
		if (piece.children[0].classList.contains(colorToMove)) {
			// Get the type of the piece (king, pawn, knight, bishop or rook) at the current position
			const pieceType = Board.ChessBoard[rank][file] % 8;
			// Call a specific function to generate moves based on the type of the piece
			switch (pieceType) {
				case 1:
					GenerateKingMoves(cPosition, piece);
					break;
				case 2:
					GeneratePawnMoves(cPosition, piece);
					break;
				case 3:
					GenerateKnightMoves(cPosition, piece);
					break;
				default:
					GenerateSlidingMoves(cPosition, piece);
			}
			paintMoves();
		}
	}
}

// This function generates moves for a sliding chess piece (bishop or rook) based on its current position
function GenerateSlidingMoves(startSquare, piece) {
	// Determine the start and end direction indices based on the type of the sliding piece
	let startDirIndex = document
		.getElementById("p" + startSquare)
		.classList.contains("Bishop")
		? 4
		: 0;
	let endDirIndex = document
		.getElementById("p" + startSquare)
		.classList.contains("Rook")
		? 4
		: 8;
	// Iterate through all directions in which the piece can move (diagonal or horizontal/vertical)
	for (
		let directionIndex = startDirIndex;
		directionIndex < endDirIndex;
		directionIndex++
	) {
		// Iterate through all squares in the current direction until the edge of the board or a blocking piece is reached
		for (
			let n = 0;
			n < Object.values(NumSquaresToEdge[startSquare])[directionIndex];
			n++
		) {
			// Determine the target square in the current direction
			let targetSquare =
				startSquare + DirectionOffset[directionIndex] * (n + 1);
			// If the target square is blocked by a friendly piece, the sliding piece can't move any further in this direction
			if (
				document.getElementById("c" + targetSquare).hasChildNodes() &&
				piece.children[0].classList[0] ==
					document.getElementById("p" + targetSquare).classList[0]
			) {
				break;
			}
			// Add the target square to the list of possible moves
			moves.push(targetSquare);
			// If the target square is occupied by an opponent's piece, the sliding piece can't move any further in this direction after capturing it
			if (
				document.getElementById("c" + targetSquare).hasChildNodes() &&
				piece.children[0].classList[0] !=
					document.getElementById("p" + targetSquare).classList[0]
			) {
				break;
			}
		}
	}
}

// This function generates all possible moves for a knight from a given start square on the board.
function GenerateKnightMoves(startSquare, piece) {
	// Initialize variables to be used within the function
	let targetSquare;
	let targetRank;
	const startRank = startSquare % 8; // Calculates the rank of the start square
	// Loop through all possible knight move directions
	for (let n = 0; n < DirectionOffsetKnight.length; n++) {
		// Calculate the target square for the current direction
		targetSquare = startSquare + DirectionOffsetKnight[n];

		// Check if the target square is on the board
		const targetIsOnBoard = isSquareOnBoard(targetSquare);

		if (targetIsOnBoard) {
			// Calculate the rank of the target square
			targetRank = targetSquare % 8;

			// Check if the target square is occupied by an opponent's piece or is empty
			const hasChildren = document
				.getElementById("c" + targetSquare)
				.hasChildNodes();
			if (
				(hasChildren &&
					document.getElementById("p" + targetSquare).classList[0] !=
						colorToMove) ||
				!hasChildren
			) {
				// Check the distance of the start square to the board edges in the west and east directions
				const edgeDistanceWest =
					Object.values(NumSquaresToEdge[startSquare])[2] < 2;
				const edgeDistanceEast =
					Object.values(NumSquaresToEdge[startSquare])[3] < 2;

				// Add the target square to the moves array if it is within the allowable move range
				if (edgeDistanceWest) {
					if (targetRank <= startRank + 2) {
						moves.push(targetSquare);
					}
				} else if (edgeDistanceEast) {
					if (targetRank >= startRank - 2) {
						moves.push(targetSquare);
					}
				}
				if (!edgeDistanceWest && !edgeDistanceEast) {
					moves.push(targetSquare);
				}
			}
		}
	}
}

// This function generates all possible moves for a pawn from a given start square on the board.
function GeneratePawnMoves(startSquare, piece) {
	// Get the starting rank and file of the pawn
	const startRank = Math.floor((63 - startSquare) / 8);
	const startFile = startSquare % 8;

	// Get the color of the pawn
	const pawnColor = document.getElementById("p" + startSquare).classList[0];

	// Declare variables
	let targetSquare;

	// Define a function to get the target square and check if it's on the board or occupied
	const getTargetSquare = (delta) => {
		const targetSquare = startSquare + delta;
		const targetRow = Math.floor((63 - targetSquare) / 8);
		const targetIsOnBoard = isSquareOnBoard(targetSquare);
		if (!targetIsOnBoard) {
			return null; // target square is off the board
		}
		const targetCell = document.getElementById("c" + targetSquare);
		if (targetCell.hasChildNodes()) {
			if (
				pawnColor !==
				document.getElementById("p" + targetSquare).classList[0]
			) {
				if (delta !== 8 && delta != -8) {
					return targetSquare;
				}
			}
			return null; // target square is occupied
		}
		return targetSquare;
	};

	// Define a function to add a move to the moves array
	const addMove = (delta) => {
		const targetSquare = getTargetSquare(delta);
		if (targetSquare !== null) {
			moves.push(targetSquare);
		}
	};

	// Determine the direction of the capture for the pawn
	const captureDelta = pawnColor === "White" ? 1 : -1;
	const captureSquare = getTargetSquare(captureDelta);

	// Check for capturing moves
	targetSquare = startSquare + 7 * captureDelta;
	if (document.getElementById("c" + targetSquare).hasChildNodes()) {
		addMove(7 * captureDelta);
	}
	targetSquare = startSquare + 9 * captureDelta;
	if (document.getElementById("c" + targetSquare).hasChildNodes()) {
		addMove(9 * captureDelta);
	}

	// Check for non-capturing moves
	const forwardDelta = pawnColor === "White" ? 8 : -8;
	if (!getTargetSquare(forwardDelta)) {
		// pawn is blocked and can't move
	} else {
		addMove(forwardDelta);
	}

	// Check for double pawn push from the starting rank
	if (
		(startRank === 6 && pawnColor === "White") ||
		(startRank === 1 && pawnColor === "Black")
	) {
		if (!getTargetSquare(forwardDelta * 2)) {
			// pawn is blocked and can't move
		} else {
			moves.push(startSquare + 2 * forwardDelta);
		}
	}
}

// This function generates all possible moves for a pawn from a given start square on the board.
function GenerateKingMoves(startSquare, piece) {
	// initialize variables
	let targetSquare;
	let targetRank;
	const startRank = startSquare % 8;

	// loop through all possible directions for king moves
	for (let n = 0; n < DirectionOffset.length; n++) {
		// get target square based on direction offset
		targetSquare = startSquare + DirectionOffset[n];
		// check if target square is on board
		const targetIsOnBoard = isSquareOnBoard(targetSquare);
		if (targetIsOnBoard) {
			// get target rank for comparison with start rank
			targetRank = targetSquare % 8;
			// check if target square is occupied and by which color
			const hasChildren = document
				.getElementById("c" + targetSquare)
				.hasChildNodes();
			if (
				(hasChildren &&
					document.getElementById("p" + targetSquare).classList[0] !=
						colorToMove) || // enemy piece, can capture
				!hasChildren // unoccupied, can move
			) {
				// check if king is near edge of board and restrict moves accordingly
				const edgeDistanceWest =
					Object.values(NumSquaresToEdge[startSquare])[2] < 2;
				const edgeDistanceEast =
					Object.values(NumSquaresToEdge[startSquare])[3] < 2;
				if (edgeDistanceWest) {
					if (targetRank <= startRank + 2) {
						// limit westward moves
						moves.push(targetSquare);
					}
				} else if (edgeDistanceEast) {
					if (targetRank >= startRank - 2) {
						// limit eastward moves
						moves.push(targetSquare);
					}
				}
				if (!edgeDistanceWest && !edgeDistanceEast) {
					// no edge restrictions
					moves.push(targetSquare);
				}
			}
		}
	}
}
