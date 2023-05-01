"use strict";

// TO DO :
// keeping track of how many moves a player can play
// defended pieces
// -pinned pieces
// -checkmate
// -add UI
// -make it responsive and mobile friendly
// -add ranks and files to cell edges

const board = document.getElementById("board");
const cells = document.querySelectorAll(".cell");

var selectedId = null;
let selectedIndex = 0;
let selected = document.getElementById(selectedId);

let childId;

const directionOffset = [8, -8, -1, 1, 7, -7, 9, -9];
const directionOffsetKnight = [17, 10, -6, 15, -10, -17, 6, -15];
var numSquaresToEdge = [[], []];

var enPassantDelta = null;
var enPassantMove = null;

var moves = new Array();
var legalMoves = new Array();
var whenCheckedMoves = new Array();

var whiteAttacks = new Array();
var blackAttacks = new Array();
var whiteCheckingPieces = new Array();
var blackCheckingPieces = new Array();
var whiteDefendingPieces = new Array();
var blackDefendingPieces = new Array();
var whitePinningLines = new Array();
var blackPinningLines = new Array();
var whiteChecked = false;
var blackChecked = false;

var whenCheckedMoves;

const Move = {
	StartSquare: 0,
	TargetSquare: 0,
};

var lastMove = {
	from: 0,
	to: 0,
	piece: 0,
};

var whiteCastle = {
	queenSide: true,
	kingSide: true,
};
var blackCastle = {
	queenSide: true,
	kingSide: true,
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
	let selectedPiece = document.getElementById(selectedId);
	const selectedPieceColor = clickedPiece.classList[0];
	const kingRookSquare = selectedPieceColor === "White" ? 7 : 63;
	const queenRookSquare = selectedPieceColor === "White" ? 0 : 56;
	const rookType = Piece[clickedPiece.classList[1]];
	const rookIndex =
		parseInt(
			clickedPiece.classList[0] === "Black" ? Piece.Black : Piece.White
		) + parseInt(rookType);
	if (
		selectedPiece.classList.contains("King") &&
		clickedPiece.classList.contains("Rook")
	) {
		if (clickedPiece.id === `p${kingRookSquare}`) {
			const kingToGo = `c${parseInt(selectedId.substring(1)) + 2}`;
			const rookToGo = `c${parseInt(clickedPiece.id.substring(1)) - 2}`;
			placePiece(selectedIndex, kingToGo);
			placePiece(rookIndex, rookToGo);
		} else if (clickedPiece.id === `p${queenRookSquare}`) {
			const kingToGo = `c${parseInt(selectedId.substring(1)) - 2}`;
			const rookToGo = `c${parseInt(clickedPiece.id.substring(1)) + 3}`;
			placePiece(selectedIndex, kingToGo);
			placePiece(rookIndex, rookToGo);
		}
		createLastMove(clickedCell, selectedPiece);
		cleanupAndUpdate();
		selectedPiece.remove();
		clickedPiece.remove();
	} else {
		deleteMoves();
		document
			.getElementById(selectedId)
			.parentElement.classList.remove("selected");
		toggleSelected(clickedCell);
		selectedId = clickedPiece.id;
		updateSelectedIndex(clickedPiece);
		generateLegalMoves(
			parseInt(selectedId.substring(1)),
			colorToMove,
			moves
		);
		paintMoves();
	}
}

function handleNewSelection(clickedCell, clickedPiece) {
	toggleSelected(clickedCell);
	selectedId = clickedPiece.id;
	updateSelectedIndex(clickedPiece);
	generateLegalMoves(parseInt(selectedId.substring(1)), colorToMove, moves);
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
	clearArray(moves);
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
	if (moves.length < 1) {
		return;
	} else {
		for (let n = 0; n < moves.length; n++) {
			const cell = document.getElementById("c" + moves[n]);
			if (cell.classList.contains("blackCell")) {
				cell.classList.toggle("blackCellAttack");
			} else {
				cell.classList.toggle("whiteCellAttack");
			}
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
	castlingPiecesMoved(colorToMove);
	colorToMove = colorToMove === "White" ? "Black" : "White";
	clearArray(whiteAttacks);
	clearArray(blackAttacks);
	generateAttacks("White");
	generateAttacks("Black");
}

// This function precomputes data for the number of squares in each direction from a given square on the board.
function precomputedData() {
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

			// Compute the index of the square in the numSquaresToEdge array.
			const squareIndex = rank * 8 + file;
			// Store the computed data for this square in the numSquaresToEdge array.
			numSquaresToEdge[squareIndex] = {
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
function generateMoves(startSquare, color, array) {
	// Determine the rank and file of the current position on the board
	const rank = Math.floor((63 - startSquare) / 8);
	const file = startSquare % 8;
	// Get the piece element corresponding to the current position
	const cell = document.getElementById(`c${startSquare}`);
	// Check if the piece is present on the board and belongs to the player who is currently making the move
	if (cell.hasChildNodes()) {
		if (cell.children[0].classList.contains(color)) {
			// Get the type of the piece (king, pawn, knight, bishop or rook) at the current position
			const pieceType = Board.ChessBoard[rank][file] % 8;
			// Call a specific function to generate moves based on the type of the piece
			switch (pieceType) {
				case 1:
					generateKingMoves(startSquare, color, array);
					break;
				case 2:
					generatePawnMoves(startSquare, color, array);
					break;
				case 3:
					generateKnightMoves(startSquare, color, array);
					break;
				default:
					generateSlidingMoves(startSquare, color, array);
			}
		}
	}
}

function generateSlidingMoves(startSquare, color, array) {
	let startDirIndex = getStartDirectionIndex(startSquare);
	let endDirIndex = getEndDirectionIndex(startSquare);

	for (
		let directionIndex = startDirIndex;
		directionIndex < endDirIndex;
		directionIndex++
	) {
		generateMovesInDirection(startSquare, directionIndex, color, array);
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

function generateMovesInDirection(startSquare, directionIndex, color, array) {
	for (
		let n = 0;
		n < Object.values(numSquaresToEdge[startSquare])[directionIndex];
		n++
	) {
		let targetSquare =
			startSquare + directionOffset[directionIndex] * (n + 1);

		if (isBlockedByFriendlyPiece(targetSquare, color)) {
			break;
		}

		array.push(targetSquare);

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

function generatePawnMoves(startSquare, color, array) {
	generatePawnCapturingMoves(startSquare, color, array);
	generatePawnNonCapturingMoves(startSquare, color, array);
	generatePawnDoublePush(startSquare, color, array);
	generatePawnEnPassantMoves(startSquare, color, array);
}

function generatePawnCapturingMoves(startSquare, color, array) {
	const captureDelta = color === "White" ? 1 : -1;

	const addMoveIfCapturable = (delta) => {
		const targetSquare = startSquare + delta;
		if (
			isSquareOccupied(targetSquare) &&
			document.getElementById("p" + targetSquare).classList[0] !== color
		) {
			array.push(targetSquare);
		}
	};

	addMoveIfCapturable(7 * captureDelta);
	addMoveIfCapturable(9 * captureDelta);
}

function generatePawnNonCapturingMoves(startSquare, color, array) {
	const forwardDelta = color === "White" ? 8 : -8;
	const targetSquare = startSquare + forwardDelta;

	if (!isSquareOccupied(targetSquare)) {
		array.push(targetSquare);
	}
}

function generatePawnDoublePush(startSquare, color, array) {
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
			array.push(doublePushTargetSquare);
		}
	}
}

function generatePawnEnPassantMoves(startSquare, color, array) {
	const enPassantRank = color === "White" ? 1 : 6;

	if (
		lastMove.piece === "Pawn" &&
		enPassantRank === Math.floor((63 - lastMove.from) / 8)
	) {
		const captureDelta = color === "White" ? 1 : -1;
		const addEnPassantMove = (delta) => {
			const targetSquare = startSquare + delta;
			if (lastMove.to === targetSquare) {
				array.push(startSquare + 8 * captureDelta + delta);
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
function isValidKingMove(targetSquare, color) {
	const opponentColor = color === "White" ? "Black" : "White";
	const opponentColorAttacks =
		color === "White" ? blackAttacks : whiteAttacks;
	const opponentColorCheckingPiece =
		color === "White" ? blackCheckingPieces : whiteCheckingPieces;
	let checkingLineArray = [];
	if (opponentColorCheckingPiece.length > 0) {
		generateCheckingLines(opponentColor, checkingLineArray);
	}
	return (
		!opponentColorAttacks.includes(targetSquare) &&
		((isSquareOccupied(targetSquare) &&
			document.getElementById(`p${targetSquare}`).classList[0] ===
				opponentColor) ||
			!isSquareOccupied(targetSquare)) &&
		!checkingLineArray.includes(targetSquare)
	);
}

function generateKnightMoves(startSquare, color, array) {
	let targetSquare;
	let targetRank;
	const startRank = startSquare % 8;

	for (let n = 0; n < directionOffsetKnight.length; n++) {
		targetSquare = startSquare + directionOffsetKnight[n];
		const targetIsOnBoard = isSquareOnBoard(targetSquare);

		if (targetIsOnBoard && isValidMove(targetSquare, color)) {
			targetRank = targetSquare % 8;
			const edgeDistanceWest =
				Object.values(numSquaresToEdge[startSquare])[2] < 2;
			const edgeDistanceEast =
				Object.values(numSquaresToEdge[startSquare])[3] < 2;

			if (edgeDistanceWest) {
				if (targetRank <= startRank + 2) {
					array.push(targetSquare);
				}
			} else if (edgeDistanceEast) {
				if (targetRank >= startRank - 2) {
					array.push(targetSquare);
				}
			} else {
				array.push(targetSquare);
			}
		}
	}
}

function generateKingMoves(startSquare, color, array) {
	let targetSquare;
	let targetRank;
	const startRank = startSquare % 8;
	for (let n = 0; n < directionOffset.length; n++) {
		targetSquare = startSquare + directionOffset[n];
		const targetIsOnBoard = isSquareOnBoard(targetSquare);

		if (targetIsOnBoard && isValidKingMove(targetSquare, color)) {
			targetRank = targetSquare % 8;
			const edgeDistanceWest =
				Object.values(numSquaresToEdge[startSquare])[2] < 2;
			const edgeDistanceEast =
				Object.values(numSquaresToEdge[startSquare])[3] < 2;

			if (edgeDistanceWest) {
				if (targetRank <= startRank + 2) {
					array.push(targetSquare);
				}
			} else if (edgeDistanceEast) {
				if (targetRank >= startRank - 2) {
					array.push(targetSquare);
				}
			} else {
				array.push(targetSquare);
			}
		}
	}
	generateCastlingMoves(startSquare, color, array);
}

function generateCastlingMoves(startSquare, color, array) {
	const colorCastle = color === "White" ? whiteCastle : blackCastle;
	const kingChecked = color === "White" ? whiteChecked : blackChecked;
	const opponentColorAttacks =
		color === "White" ? blackAttacks : whiteAttacks;

	const whiteCastlingSquares = {
		kingSide: [5, 6],
		queenSide: [1, 2, 3],
	};
	const blackCastlingSquares = {
		kingSide: [61, 62],
		queenSide: [57, 58, 59],
	};

	const colorCastlingSquares =
		color === "White" ? whiteCastlingSquares : blackCastlingSquares;

	const castlingSquaresAttacked = {
		kingSide: opponentColorAttacks.some((cell) =>
			colorCastlingSquares.kingSide.includes(cell)
		),
		queenSide: opponentColorAttacks.some((cell) =>
			colorCastlingSquares.queenSide.includes(cell)
		),
	};
	const castlingSquaresOccupied = {
		kingSide: colorCastlingSquares.kingSide.some((id) => {
			const cell = document.getElementById(`c${id}`);
			return cell && cell.hasChildNodes();
		}),
		queenSide: colorCastlingSquares.queenSide.some((id) => {
			const cell = document.getElementById(`c${id}`);
			return cell && cell.hasChildNodes();
		}),
	};

	if (!kingChecked) {
		if (
			colorCastle.kingSide &&
			!castlingSquaresAttacked.kingSide &&
			!castlingSquaresOccupied.kingSide
		) {
			array.push(startSquare + 3);
		}
		if (
			colorCastle.queenSide &&
			!castlingSquaresAttacked.queenSide &&
			!castlingSquaresOccupied.queenSide
		) {
			array.push(startSquare - 4);
		}
	}
}

function generateAttacks(color) {
	const colorAttacks = color === "White" ? whiteAttacks : blackAttacks;
	const colorCheckingPiece =
		color === "White" ? whiteCheckingPieces : blackCheckingPieces;
	const opponentColor = color === "White" ? "Black" : "White";
	const opponentKing = document.getElementsByClassName(
		`${opponentColor} King`
	)[0];
	const opponentKingSquare = parseInt(opponentKing.id.substring(1));
	for (let tile = 0; tile < 64; tile++) {
		const cell = document.getElementById(`c${tile}`);
		const piece = document.getElementById(`p${tile}`);
		let pieceAttacks = new Array();
		if (cell.hasChildNodes() && piece.classList.contains(color)) {
			if (piece.classList.contains("Pawn")) {
				generatePawnAttacks(tile, color, pieceAttacks);
			} else {
				generateMoves(tile, color, pieceAttacks);
			}
			if (pieceAttacks.includes(opponentKingSquare)) {
				color === "White"
					? whiteCheckingPieces.push(parseInt(piece.id.substring(1)))
					: blackCheckingPieces.push(parseInt(piece.id.substring(1)));
			}
			colorAttacks.push(...pieceAttacks);
			clearArray(pieceAttacks);
		}
	}
	if (!colorAttacks.includes(opponentKingSquare)) {
		clearArray(colorCheckingPiece);
	}
	removeDuplicates(colorAttacks);
	kingInCheck(color);
}

function generatePawnAttacks(startSquare, color, array) {
	const captureDelta = color === "White" ? 1 : -1;
	const edgeDistanceWest =
		Object.values(numSquaresToEdge[startSquare])[2] >= 1;
	const edgeDistanceEast =
		Object.values(numSquaresToEdge[startSquare])[3] >= 1;
	if (edgeDistanceWest) {
		array.push(startSquare + 7 * captureDelta);
	}
	if (edgeDistanceEast) {
		array.push(startSquare + 9 * captureDelta);
	}
}

function clearArray(array) {
	array.length = 0;
}

function paintAttacks(color) {
	const colorAttacks = color === "White" ? whiteAttacks : blackAttacks;
	for (let n = 0; n < colorAttacks.length; n++) {
		let cell = document.getElementById("c" + colorAttacks[n]);
		cell.classList.add("moves");
	}
}

function removeDuplicates(array) {
	const uniqueSet = new Set(array);
	array.splice(0, array.length, ...uniqueSet);
}

function kingInCheck(color) {
	const king = document.getElementsByClassName(`${color} King`)[0];
	const kingSquare = parseInt(king.id.substring(1));
	const opponentColorAttacks =
		color === "White" ? blackAttacks : whiteAttacks;
	if (opponentColorAttacks.includes(kingSquare)) {
		color === "white" ? (whiteChecked = true) : (blackChecked = true);
	} else {
		color === "white" ? (whiteChecked = false) : (blackChecked = false);
	}
}

function generateCheckingLines(color, array) {
	const checkingPieces =
		color === "White" ? whiteCheckingPieces : blackCheckingPieces;

	checkingPieces.forEach((piece) => {
		generateKingAttackingLine(piece, color, array);
	});
}

function generateKingAttackingLine(
	startSquare,
	color,
	array,
	behindKing = true
) {
	const opponentColor = color === "White" ? "Black" : "White";
	const opponentKing = document.getElementsByClassName(
		`${opponentColor} King`
	)[0];
	const opponentKingSquare = parseInt(opponentKing.id.substring(1));
	const startDirIndex = getStartDirectionIndex(startSquare);
	const endDirIndex = getEndDirectionIndex(startSquare);

	let tempArray = [];
	let kingDirection;

	for (
		let directionIndex = startDirIndex;
		directionIndex < endDirIndex;
		directionIndex++
	) {
		generateMovesInDirection(startSquare, directionIndex, color, tempArray);

		if (tempArray.includes(opponentKingSquare)) {
			kingDirection = directionIndex;
			generateMovesInDirection(startSquare, kingDirection, color, array);

			if (behindKing) {
				generateMovesInDirection(
					opponentKingSquare,
					kingDirection,
					color,
					array
				);
			}

			break;
		}

		clearArray(tempArray);
	}
}

function generateLegalMoves(startSquare, color, array) {
	const opponentColor = color === "White" ? "Black" : "White";
	const opponentKing = document.getElementsByClassName(
		`${opponentColor} King`
	)[0];
	const opponentKingSquare = parseInt(opponentKing.id.substring(1));
	const colorChecked = color === "White" ? whiteChecked : blackChecked;
	const opponentCheckingPieces =
		color === "White" ? blackCheckingPieces : whiteCheckingPieces;
	const piece = document.getElementById(`p${startSquare}`);

	let kingAttackingLine = [];
	let tempMoves = [];
	let legalSquares = [];

	generateMoves(startSquare, color, tempMoves);

	if (colorChecked) {
		if (opponentCheckingPieces.length > 1) {
			if (piece.classList.contains("King")) {
				array.push(...tempMoves);
			}
		} else {
			if (!piece.classList.contains("King")) {
				generateKingAttackingLine(
					opponentCheckingPieces[0],
					opponentColor,
					kingAttackingLine,
					false
				);
				legalSquares = tempMoves.filter((element) =>
					kingAttackingLine.includes(element)
				);

				if (tempMoves.includes(opponentCheckingPieces[0])) {
					legalSquares.push(opponentCheckingPieces[0]);
				}
			} else {
				legalSquares = tempMoves;
			}
		}
	} else {
		legalSquares = tempMoves;
	}

	array.push(...legalSquares);
}

function castlingPiecesMoved(color) {
	const colorCastle = color === "White" ? whiteCastle : blackCastle;
	const kingRookSquare = color === "White" ? 7 : 63;
	const queenRookSquare = color === "White" ? 0 : 56;
	if (lastMove.piece === "King") {
		colorCastle.kingSide = false;
		colorCastle.queenSide = false;
	}
	if (lastMove.piece === "Rook") {
		if (lastMove.from === kingRookSquare) {
			colorCastle.kingSide = false;
		} else if (lastMove.from === queenRookSquare) {
			colorCastle.queenSide = false;
		}
	}
}
