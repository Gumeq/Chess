"use strict";

// TO DO :
// -pinned pieces
// -legal moves
// -checkmate
// -castling
// -add UI
// -make it responsive and mobile friendly
// -add ranks and files to cell edges

var lastMoveFrom, lastMoveTo, lastMovePiece;

const board = document.getElementById("board");
const cells = document.querySelectorAll(".cell");

var selectedId = "none";
let selectedIndex = 0;
let selected = document.getElementById(selectedId);

let childId;

const DirectionOffset = [8, -8, -1, 1, 7, -7, 9, -9];
const DirectionOffsetKnight = [17, 10, -6, 15, -10, -17, 6, -15];
var NumSquaresToEdge = [[], []];

var enPassantDelta = null;
var enPassantMove = null;

var moves = new Array();
var legalMoves = new Array();

const Move = {
	StartSquare: 0,
	TargetSquare: 0,
};

var whiteAttacks = new Array();
var blackAttacks = new Array();
var checkingPieceWhite = new Array();
var checkingPieceBlack = new Array();
var whitePinned = new Array();
var blackPinned = new Array();
var whiteChecked = false;
var blackChecked = false;

for (let i = 0; i < cells.length; i++) {
	cells[i].addEventListener("click", function () {
		handleClick(this);
	});
}

function handleClick(clickedCell) {
	if (clickedCell.hasChildNodes()) {
		handleCellWithChild(clickedCell);
	} else if (selectedId !== "none") {
		handleEmptyCell(clickedCell);
	}
}

function handleCellWithChild(clickedCell) {
	const clickedPiece = clickedCell.children[0];
	const clickedPieceColor = clickedPiece.classList[0];

	if (selectedId !== "none") {
		const selectedPiece = document.getElementById(selectedId);
		const selectedPieceColor = selectedPiece.classList[0];

		if (clickedPieceColor !== selectedPieceColor) {
			handleCapture(clickedCell, clickedPiece, selectedPiece);
		} else if (selectedId === clickedPiece.id) {
			toggleSelected(clickedCell);
		} else {
			handleSameColorPiece(clickedCell, clickedPiece);
		}
	} else if (clickedPieceColor === colorToMove) {
		handleNewSelection(clickedCell, clickedPiece);
	}
}

function handleEmptyCell(clickedCell) {
	const clickedCellId = parseInt(clickedCell.id.substring(1));
	if (moves.includes(clickedCellId)) {
		moveSelectedPiece(clickedCell);
	}
}

function handleCapture(clickedCell, clickedPiece, selectedPiece) {
	const clickedCellId = parseInt(clickedCell.id.substring(1));
	if (moves.includes(clickedCellId)) {
		lastMoveFrom = parseInt(selectedId.substring(1));
		lastMoveTo = parseInt(clickedCell.id.substring(1));
		lastMovePiece = selectedPiece.classList[1];
		cleanupAndUpdate();
		clickedCell.removeChild(clickedPiece);
		placePiece(selectedIndex, clickedCell.id);
		selectedPiece.remove();
		moveMade();
	}
}

function toggleSelected(clickedCell) {
	clickedCell.classList.toggle("selected");
	selectedId = "none";
	deleteMoves();
}

function handleSameColorPiece(clickedCell, clickedPiece) {
	deleteMoves();
	document
		.getElementById(selectedId)
		.parentElement.classList.remove("selected");
	toggleSelected(clickedCell);
	selectedId = clickedPiece.id;
	updateSelectedIndex(clickedPiece);
	GenerateMoves(parseInt(selectedId.substring(1)), colorToMove);
	paintMoves();
}

function handleNewSelection(clickedCell, clickedPiece) {
	toggleSelected(clickedCell);
	selectedId = clickedPiece.id;
	updateSelectedIndex(clickedPiece);
	GenerateMoves(parseInt(selectedId.substring(1)), colorToMove);
	paintMoves();
}

function moveSelectedPiece(clickedCell) {
	const selectedPiece = document.getElementById(selectedId);
	if (enPassantMove === parseInt(clickedCell.id.substring(1))) {
		document.getElementById(`p${lastMoveTo}`).remove();
		enPassantMove = null;
		enPassantDelta = null;
	}
	lastMoveFrom = parseInt(selectedId.substring(1));
	lastMoveTo = parseInt(clickedCell.id.substring(1));
	lastMovePiece = selectedPiece.classList[1];
	selectedPiece.parentElement.classList.remove("selected");
	deleteMoves();
	selectedPiece.remove();
	placePiece(selectedIndex, clickedCell.id);
	selectedId = "none";
	moveMade();
}

function updateSelectedIndex(clickedPiece) {
	const selectedPieceType = Piece[clickedPiece.classList[1]];
	selectedIndex =
		parseInt(
			clickedPiece.classList[0] === "Black"
				? Piece.Black[0]
				: Piece.White[0]
		) + parseInt(selectedPieceType);
}

function cleanupAndUpdate() {
	document
		.getElementById(selectedId)
		.parentElement.classList.remove("selected");
	deleteMoves();
	selectedId = "none";
	moveMade();
}

function isSquareOccupied(targetSquare) {
	const targetCell = document.getElementById("c" + targetSquare);
	return targetCell.hasChildNodes();
}

// This function removes the "moves" class from all elements that have it and clears the moves array.
function deleteMoves() {
	const moveElements = document.querySelectorAll(
		".moves, .blackCellAttack, .whiteCellAttack"
	);
	moveElements.forEach((element) => {
		element.classList.remove("moves", "blackCellAttack", "whiteCellAttack");
	});
	moves.length = 0;
}

// This function increments the number of moves made and changes the color to move to the opposite color.
function moveMade() {
	Board.movesMade += 1;
	colorToMove = colorToMove === "White" ? "Black" : "White";
	document.getElementById("menuColorToMove").textContent = colorToMove;
	checkCheck("White");
	checkCheck("Black");
	let colorChecked = document.getElementById("colorChecked");
	const king = document.getElementsByClassName(`${colorToMove} King`)[0];
	if (whiteChecked) {
		colorChecked.textContent = "White in check!";
		colorChecked.style.display = "block";
	} else if (blackChecked) {
		colorChecked.textContent = "Black in check!";
		colorChecked.style.display = "block";
	} else {
		colorChecked.style.display = "none";
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
		const cell = document.getElementById("c" + moves[n]);
		if (cell.classList.contains("blackCell")) {
			cell.classList.toggle("blackCellAttack");
		} else {
			cell.classList.toggle("whiteCellAttack");
		}
	}
}

// This function generates moves for a given chess piece based on its type and current position
function GenerateMoves(cPosition, color) {
	// Determine the rank and file of the current position on the board
	const rank = Math.floor((63 - cPosition) / 8);
	const file = cPosition % 8;
	// Get the piece element corresponding to the current position
	const piece = document.getElementById("c" + cPosition);
	// Check if the piece is present on the board and belongs to the player who is currently making the move
	if (piece.hasChildNodes()) {
		if (piece.children[0].classList.contains(color)) {
			// Get the type of the piece (king, pawn, knight, bishop or rook) at the current position
			const pieceType = Board.ChessBoard[rank][file] % 8;
			// Call a specific function to generate moves based on the type of the piece
			switch (pieceType) {
				case 1:
					GenerateKingMoves(cPosition, piece, color);
					break;
				case 2:
					GeneratePawnMoves(cPosition, piece, color);
					break;
				case 3:
					GenerateKnightMoves(cPosition, piece, color);
					break;
				default:
					GenerateSlidingMoves(cPosition, piece, color);
			}
		}
	}
}

// This function generates moves for a sliding chess piece (bishop or rook) based on its current position
function GenerateSlidingMoves(startSquare, piece, color) {
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
				isSquareOccupied(targetSquare) &&
				color ==
					document.getElementById("p" + targetSquare).classList[0]
			) {
				break;
			}
			// Add the target square to the list of possible moves
			moves.push(targetSquare);
			// If the target square is occupied by an opponent's piece, the sliding piece can't move any further in this direction after capturing it
			if (
				isSquareOccupied(targetSquare) &&
				color !=
					document.getElementById("p" + targetSquare).classList[0]
			) {
				break;
			}
		}
	}
}

// This function generates all possible moves for a knight from a given start square on the board.
function GenerateKnightMoves(startSquare, piece, color) {
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
			if (
				(isSquareOccupied(targetSquare) &&
					document.getElementById("p" + targetSquare).classList[0] !=
						color) ||
				!isSquareOccupied(targetSquare)
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
function GeneratePawnMoves(startSquare, piece, color) {
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
		} else if (enPassantDelta && delta === enPassantDelta) {
			enPassantMove = targetSquare;
			return targetSquare;
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
	if (isSquareOccupied(targetSquare)) {
		addMove(7 * captureDelta);
	}
	targetSquare = startSquare + 9 * captureDelta;
	if (isSquareOccupied(targetSquare)) {
		addMove(9 * captureDelta);
	}
	const enPassantRank = color === "White" ? 1 : 6;
	if (
		lastMovePiece === "Pawn" &&
		enPassantRank === Math.floor((63 - lastMoveFrom) / 8)
	) {
		if (color === "White") {
			if (lastMoveTo === startSquare + 1) {
				enPassantDelta = 9 * captureDelta;
			} else if (lastMoveTo === startSquare - 1) {
				enPassantDelta = 7 * captureDelta;
			}
		} else {
			if (lastMoveTo === startSquare + 1) {
				enPassantDelta = 7 * captureDelta;
			} else if (lastMoveTo === startSquare - 1) {
				enPassantDelta = 9 * captureDelta;
			}
		}
		addMove(enPassantDelta);
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
		if (
			!getTargetSquare(forwardDelta * 2) ||
			!getTargetSquare(forwardDelta)
		) {
			// pawn is blocked and can't move
		} else {
			moves.push(startSquare + 2 * forwardDelta);
		}
	}
}

// This function generates all possible moves for a pawn from a given start square on the board.
function GenerateKingMoves(startSquare, piece, color) {
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
			if (
				(isSquareOccupied(targetSquare) &&
					document.getElementById("p" + targetSquare).classList[0] !=
						color) || // enemy piece, can capture
				!isSquareOccupied(targetSquare) // unoccupied, can move
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

function GenerateAttacks(color) {
	for (let i = 0; i < 64; i++) {
		const cell = document.getElementById(`c${i}`);
		const piece = document.getElementById(`p${i}`);
		if (cell.hasChildNodes() && piece.classList.contains(color)) {
			GenerateMoves(i, color);
			const opponentColor = color === "White" ? "Black" : "White";
			const king = document.getElementsByClassName(
				`${opponentColor} King`
			)[0];
			const kingSquare = parseInt(king.id.substring(1));
			if (moves.includes(kingSquare)) {
				if (color === "White") {
					checkingPieceBlack.push(piece.id);
				} else {
					checkingPieceWhite.push(piece.id);
				}
			}
		}
	}
	if (color === "White") {
		whiteAttacks = [...moves];
	} else {
		blackAttacks = [...moves];
	}
	moves.length = 0;
}

function checkCheck(color) {
	const king = document.getElementsByClassName(`${color} King`)[0];
	const kingSquare = parseInt(king.id.substring(1));
	if (color === "White") {
		GenerateAttacks("Black");
		if (blackAttacks.includes(kingSquare)) {
			whiteChecked = true;
		} else {
			whiteChecked = false;
			checkingPieceWhite.length = 0;
		}
	} else {
		GenerateAttacks("White");
		if (whiteAttacks.includes(kingSquare)) {
			blackChecked = true;
		} else {
			blackChecked = false;
			checkingPieceBlack.length = 0;
		}
	}
}
