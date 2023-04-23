"use strict";

// TO DO :
// -pinned pieces
// -legal moves
// -checkmate
// -castling
// -add UI
// -make it responsive and mobile friendly
// -add ranks and files to cell edges

const board = document.getElementById("board");
const cells = document.querySelectorAll(".cell");

var selectedId = null;
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

var whiteAttacks = new Array();
var blackAttacks = new Array();
var checkingPieceWhite = new Array();
var checkingPieceBlack = new Array();
var whitePinned = new Array();
var blackPinned = new Array();
var whiteChecked = false;
var blackChecked = false;

const Move = {
	StartSquare: 0,
	TargetSquare: 0,
};

var lastMove = {
	from: 0,
	to: 0,
	piece: 0,
};

for (let i = 0; i < cells.length; i++) {
	cells[i].addEventListener("click", function () {
		handleClick(this);
	});
}

function handleClick(clickedCell) {
	if (clickedCell.hasChildNodes()) {
		handleCellWithChild(clickedCell);
	} else if (selectedId) {
		handleEmptyCell(clickedCell);
	}
}

function handleCellWithChild(clickedCell) {
	const clickedPiece = clickedCell.children[0];
	const clickedPieceColor = clickedPiece.classList[0];

	if (selectedId) {
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
		createLastMove(clickedCell, selectedPiece);
		clickedCell.removeChild(clickedPiece);
		placePiece(selectedIndex, clickedCell.id);
		cleanupAndUpdate();
	}
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
		document.getElementById(`p${lastMove.to}`).remove();
		enPassantMove = null;
		enPassantDelta = null;
	}
	createLastMove(clickedCell, selectedPiece);
	placePiece(selectedIndex, clickedCell.id);
	cleanupAndUpdate();
}

function toggleSelected(clickedCell) {
	clickedCell.classList.toggle("selected");
	selectedId = null;
	deleteMoves();
}

function removeSelected() {
	const selectedPiece = document.getElementById(selectedId);
	selectedPiece.parentElement.classList.remove("selected");
	selectedPiece.remove();
	selectedId = null;
}

function updateSelectedIndex(clickedPiece) {
	const selectedPieceType = Piece[clickedPiece.classList[1]];
	selectedIndex =
		parseInt(
			clickedPiece.classList[0] === "Black" ? Piece.Black : Piece.White
		) + parseInt(selectedPieceType);
}

function isSquareOccupied(targetSquare) {
	const targetCell = document.getElementById("c" + targetSquare);
	return targetCell.hasChildNodes();
}

function cleanupAndUpdate() {
	removeSelected();
	deleteMoves();
	moveMade();
}

function createLastMove(clickedCell, selectedPiece) {
	lastMove.from = parseInt(selectedId.substring(1));
	lastMove.to = parseInt(clickedCell.id.substring(1));
	lastMove.piece = selectedPiece.classList[1];
}

function deleteMoves() {
	const moveElements = document.querySelectorAll(
		".moves, .blackCellAttack, .whiteCellAttack"
	);
	moveElements.forEach((element) => {
		element.classList.remove("moves", "blackCellAttack", "whiteCellAttack");
	});
	moves.length = 0;
}
function deleteLastMoves() {
	let lastMoveElements = document.querySelectorAll(
		".lastMoveWhite, .lastMoveBlack"
	);
	lastMoveElements.forEach((element) => {
		element.classList.remove("lastMoveWhite", "lastMoveBlack");
	});
}

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

function paintLastMoves() {
	const moveFrom = document.getElementById(`c${lastMove.from}`);
	const moveTo = document.getElementById(`c${lastMove.to}`);
	if (moveFrom.classList.contains("blackCell")) {
		moveFrom.classList.add("lastMoveBlack");
	} else {
		moveFrom.classList.add("lastMoveWhite");
	}
	if (moveTo.classList.contains("blackCell")) {
		moveTo.classList.add("lastMoveBlack");
	} else {
		moveTo.classList.add("lastMoveWhite");
	}
}

function moveMade() {
	Board.movesMade += 1;
	deleteLastMoves();
	paintLastMoves();
	colorToMove = colorToMove === "White" ? "Black" : "White";
	checkCheck("White");
	checkCheck("Black");
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

function GenerateSlidingMoves(startSquare, piece, color) {
	let startDirIndex = getStartDirectionIndex(startSquare);
	let endDirIndex = getEndDirectionIndex(startSquare);

	for (
		let directionIndex = startDirIndex;
		directionIndex < endDirIndex;
		directionIndex++
	) {
		generateMovesInDirection(startSquare, directionIndex, color);
	}
}

function getStartDirectionIndex(startSquare) {
	return document
		.getElementById("p" + startSquare)
		.classList.contains("Bishop")
		? 4
		: 0;
}

function getEndDirectionIndex(startSquare) {
	return document.getElementById("p" + startSquare).classList.contains("Rook")
		? 4
		: 8;
}

function generateMovesInDirection(startSquare, directionIndex, color) {
	for (
		let n = 0;
		n < Object.values(NumSquaresToEdge[startSquare])[directionIndex];
		n++
	) {
		let targetSquare =
			startSquare + DirectionOffset[directionIndex] * (n + 1);

		if (isBlockedByFriendlyPiece(targetSquare, color)) {
			break;
		}

		moves.push(targetSquare);

		if (isBlockedByOpponentPiece(targetSquare, color)) {
			break;
		}
	}
}

function isBlockedByFriendlyPiece(targetSquare, color) {
	return (
		isSquareOccupied(targetSquare) &&
		color == document.getElementById("p" + targetSquare).classList[0]
	);
}

function isBlockedByOpponentPiece(targetSquare, color) {
	return (
		isSquareOccupied(targetSquare) &&
		color != document.getElementById("p" + targetSquare).classList[0]
	);
}

function GeneratePawnMoves(startSquare, piece, color) {
	generatePawnCapturingMoves(startSquare, piece, color);
	generatePawnNonCapturingMoves(startSquare, piece, color);
	generatePawnDoublePush(startSquare, piece, color);
	generatePawnEnPassantMoves(startSquare, piece, color);
}

function generatePawnCapturingMoves(startSquare, piece, color) {
	const captureDelta = color === "White" ? 1 : -1;

	const addMoveIfCapturable = (delta) => {
		const targetSquare = startSquare + delta;
		if (
			isSquareOccupied(targetSquare) &&
			document.getElementById("p" + targetSquare).classList[0] !== color
		) {
			moves.push(targetSquare);
		}
	};

	addMoveIfCapturable(7 * captureDelta);
	addMoveIfCapturable(9 * captureDelta);
}

function generatePawnNonCapturingMoves(startSquare, piece, color) {
	const forwardDelta = color === "White" ? 8 : -8;
	const targetSquare = startSquare + forwardDelta;

	if (!isSquareOccupied(targetSquare)) {
		moves.push(targetSquare);
	}
}

function generatePawnDoublePush(startSquare, piece, color) {
	const startRank = Math.floor((63 - startSquare) / 8);
	const forwardDelta = color === "White" ? 8 : -8;
	const doublePushTargetSquare = startSquare + 2 * forwardDelta;

	if (
		(startRank === 6 && color === "White") ||
		(startRank === 1 && color === "Black")
	) {
		if (
			!isSquareOccupied(doublePushTargetSquare) &&
			!isSquareOccupied(startSquare + forwardDelta)
		) {
			moves.push(doublePushTargetSquare);
		}
	}
}

function generatePawnEnPassantMoves(startSquare, piece, color) {
	const enPassantRank = color === "White" ? 1 : 6;

	if (
		lastMove.piece === "Pawn" &&
		enPassantRank === Math.floor((63 - lastMove.from) / 8)
	) {
		const captureDelta = color === "White" ? 1 : -1;
		const addEnPassantMove = (delta) => {
			const targetSquare = startSquare + delta;
			if (lastMove.to === targetSquare) {
				moves.push(startSquare + 8 * captureDelta + delta);
				enPassantMove = startSquare + 8 * captureDelta + delta;
			}
		};

		addEnPassantMove(1);
		addEnPassantMove(-1);
	}
}

function isValidMove(targetSquare, color) {
	return (
		(isSquareOccupied(targetSquare) &&
			document.getElementById("p" + targetSquare).classList[0] !=
				color) ||
		!isSquareOccupied(targetSquare)
	);
}

function GenerateKnightMoves(startSquare, piece, color) {
	let targetSquare;
	let targetRank;
	const startRank = startSquare % 8;

	for (let n = 0; n < DirectionOffsetKnight.length; n++) {
		targetSquare = startSquare + DirectionOffsetKnight[n];
		const targetIsOnBoard = isSquareOnBoard(targetSquare);

		if (targetIsOnBoard && isValidMove(targetSquare, color)) {
			targetRank = targetSquare % 8;
			const edgeDistanceWest =
				Object.values(NumSquaresToEdge[startSquare])[2] < 2;
			const edgeDistanceEast =
				Object.values(NumSquaresToEdge[startSquare])[3] < 2;

			if (edgeDistanceWest) {
				if (targetRank <= startRank + 2) {
					moves.push(targetSquare);
				}
			} else if (edgeDistanceEast) {
				if (targetRank >= startRank - 2) {
					moves.push(targetSquare);
				}
			} else {
				moves.push(targetSquare);
			}
		}
	}
}

function GenerateKingMoves(startSquare, piece, color) {
	let targetSquare;
	let targetRank;
	const startRank = startSquare % 8;

	for (let n = 0; n < DirectionOffset.length; n++) {
		targetSquare = startSquare + DirectionOffset[n];
		const targetIsOnBoard = isSquareOnBoard(targetSquare);

		if (targetIsOnBoard && isValidMove(targetSquare, color)) {
			targetRank = targetSquare % 8;
			const edgeDistanceWest =
				Object.values(NumSquaresToEdge[startSquare])[2] < 2;
			const edgeDistanceEast =
				Object.values(NumSquaresToEdge[startSquare])[3] < 2;

			if (edgeDistanceWest) {
				if (targetRank <= startRank + 2) {
					moves.push(targetSquare);
				}
			} else if (edgeDistanceEast) {
				if (targetRank >= startRank - 2) {
					moves.push(targetSquare);
				}
			} else {
				moves.push(targetSquare);
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
			king.classList.add("heartbeat");
		} else {
			whiteChecked = false;
			checkingPieceWhite.length = 0;
			king.classList.remove("heartbeat");
		}
	} else {
		GenerateAttacks("White");
		if (whiteAttacks.includes(kingSquare)) {
			blackChecked = true;
			king.classList.add("heartbeat");
		} else {
			blackChecked = false;
			checkingPieceBlack.length = 0;
			king.classList.remove("heartbeat");
		}
	}
}

function paintAttacks(color) {
	const colorAttacks = color === "White" ? whiteAttacks : blackAttacks;
	for (let n = 0; n < colorAttacks.length; n++) {
		let cell = document.getElementById("c" + colorAttacks[n]);
		cell.classList.add("moves");
	}
}
