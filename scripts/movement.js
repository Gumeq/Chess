"use strict";

const cells = document.getElementsByClassName("cell");

var allElements = document.querySelectorAll(".moves");

let selectedId = "none";
let selectedIndex = 0;

let childId;

var enPassantSquare = -1;
var enPassantRounds = 0;
var enPassantColor;
var enPassantPiece;

const DirectionOffset = [8, -8, -1, 1, 7, -7, 9, -9];
const DirectionOffsetKnight = [17, 10, -6, 15, -10, -17, 6, -15];
var NumSquaresToEdge = [[], []];
const Move = {
	StartSquare: 0,
	TargetSquare: 0,
};

var moves = new Array();

var WhiteAttacks = new Array();
var BlackAttacks = new Array();
var WhitePinnedPieces = new Array();
var BlackPinnedPieces = new Array();

for (var i = 0; i < cells.length; i++) {
	cells[i].addEventListener("click", function () {
		// if cell has piece on it
		if (this.hasChildNodes()) {
			// if there IS a selected cell
			if (selectedId != "none") {
				// if pieces are NOT the same color
				if (
					document.getElementById(selectedId).classList[0] !=
					this.children[0].classList[0]
				) {
					if (moves.includes(parseInt(this.id.substring(1)))) {
						document
							.querySelector(".selected")
							.classList.remove("selected");
						this.removeChild(this.firstChild);
						placePiece(selectedIndex, this.id);
						document.getElementById(selectedId).remove();
						this.parentElement.classList.remove("selected");
						allElements = document.querySelectorAll(".moves");
						allElements.forEach((element) => {
							element.classList.remove("moves");
						});
						selectedId = "none";
						moveMade();
						moves.length = 0;
					}
				} else {
					// if the ARE the same color
					if (selectedId == this.children[0].id) {
						// if they're the same pieces
						this.classList.toggle("selected");
						selectedId = "none";
						allElements = document.querySelectorAll(".moves");
						allElements.forEach((element) => {
							element.classList.remove("moves");
						});
						moves.length = 0;
					} else {
						// if they're not the same piece
						document
							.getElementById(selectedId)
							.parentElement.classList.remove("selected");
						allElements = document.querySelectorAll(".moves");
						allElements.forEach((element) => {
							element.classList.remove("moves");
						});
						this.classList.toggle("selected");
						selectedId = this.children[0].id;
						moves.length = 0;
						GenerateMoves(parseInt(selectedId.substring(1)));
						if (this.children[0].classList.contains("Black")) {
							selectedIndex = +Piece.Black[0];
						} else {
							selectedIndex = +Piece.White[0];
						}
						selectedIndex =
							selectedIndex +
							parseInt(Piece[this.children[0].classList[1]]);
					}
				}
			} else {
				// if there ISNT a selected square
				if (this.children[0].classList[0] == colorToMove) {
					// if clicked piece is same color as color to move
					this.classList.toggle("selected");
					selectedId = this.children[0].id;
					if (this.children[0].classList.contains("Black")) {
						selectedIndex = +Piece.Black[0];
					} else {
						selectedIndex = +Piece.White[0];
					}
					selectedIndex =
						selectedIndex +
						parseInt(Piece[this.children[0].classList[1]]);
					GenerateMoves(parseInt(selectedId.substring(1)));
				}
			}
		} else {
			// if cell has no pieces
			if (selectedId != "none") {
				// if there IS a selected cell
				if (moves.includes(parseInt(this.id.substring(1)))) {
					// if cell is included in moves
					if (
						enPassantRounds == 1 &&
						this.id.substring(1) == enPassantSquare &&
						enPassantColor != colorToMove
					) {
						document
							.getElementById(selectedId)
							.parentElement.classList.remove("selected");
						allElements = document.querySelectorAll(".moves");
						allElements.forEach((element) => {
							element.classList.remove("moves");
						});
						document.getElementById(selectedId).remove();
						placePiece(selectedIndex, this.id);
						document.getElementById("p" + enPassantPiece).remove();
						selectedId = "none";
						enPassantPiece = -1;
						moveMade();
						moves.length = 0;
					} else {
						document
							.getElementById(selectedId)
							.parentElement.classList.remove("selected");
						allElements = document.querySelectorAll(".moves");
						allElements.forEach((element) => {
							element.classList.remove("moves");
						});
						document.getElementById(selectedId).remove();
						placePiece(selectedIndex, this.id);
						selectedId = "none";
						moveMade();
						moves.length = 0;
					}
					// if cell is included in moves
				}
			} else {
				// if there ISNT a selected square
			}
		}
	});
}

function moveMade() {
	Board.movesMade += 1;
	if (enPassantRounds == 1) {
		enPassantRounds = 0;
	}
	if (enPassantSquare != -1) {
		enPassantRounds = 1;
	} else {
		enPassantRounds = 0;
	}
	if (colorToMove == "White") {
		colorToMove = "Black";
	} else {
		colorToMove = "White";
	}
}

function PrecomputedData() {
	for (let rank = 0; rank < 8; rank++) {
		for (let file = 0; file < 8; file++) {
			const numNorth = 7 - rank;
			const numSouth = rank;
			const numWest = file;
			const numEast = 7 - file;

			const NWMin = Math.min(numNorth, numWest);
			const SEMin = Math.min(numSouth, numEast);
			const NEMin = Math.min(numNorth, numEast);
			const SWMin = Math.min(numSouth, numWest);

			const squareIndex = rank * 8 + file;
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

function GenerateMoves(cPosition) {
	const rank = Math.floor((63 - cPosition) / 8);
	const file = cPosition % 8;
	const piece = document.getElementById("c" + cPosition);
	if (piece.hasChildNodes()) {
		if (piece.children[0].classList.contains(colorToMove)) {
			const pieceType = Board.ChessBoard[rank][file] % 8;
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
		}
	}
}

function GenerateSlidingMoves(startSquare, piece) {
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
	for (
		let directionIndex = startDirIndex;
		directionIndex < endDirIndex;
		directionIndex++
	) {
		for (
			let n = 0;
			n < Object.values(NumSquaresToEdge[startSquare])[directionIndex];
			n++
		) {
			let targetSquare =
				startSquare + DirectionOffset[directionIndex] * (n + 1);
			//Blocked by friendly piece, cant move further
			if (
				document.getElementById("c" + targetSquare).hasChildNodes() &&
				piece.children[0].classList[0] ==
					document.getElementById("p" + targetSquare).classList[0]
			) {
				break;
			}
			moves.push(targetSquare);
			// cant move further after capturing opponents piece
			if (
				document.getElementById("c" + targetSquare).hasChildNodes() &&
				piece.children[0].classList[0] !=
					document.getElementById("p" + targetSquare).classList[0]
			) {
				break;
			}
		}
	}
	for (let n = 0; n < moves.length; n++) {
		document.getElementById("c" + moves[n]).classList.toggle("moves");
	}
}

function isSquareOnBoard(square) {
	return square >= 0 && square <= 63;
}
function paintMoves() {
	for (let n = 0; n < moves.length; n++) {
		document.getElementById("c" + moves[n]).classList.toggle("moves");
	}
}

function GenerateKnightMoves(startSquare, piece) {
	let targetSquare;
	let targetRank;
	const startRank = startSquare % 8;
	for (let n = 0; n < DirectionOffsetKnight.length; n++) {
		targetSquare = startSquare + DirectionOffsetKnight[n];
		const targetIsOnBoard = isSquareOnBoard(targetSquare);
		if (targetIsOnBoard) {
			targetRank = targetSquare % 8;
			const hasChildren = document
				.getElementById("c" + targetSquare)
				.hasChildNodes();
			if (
				(hasChildren &&
					document.getElementById("p" + targetSquare).classList[0] !=
						colorToMove) ||
				!hasChildren
			) {
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
				}
				if (!edgeDistanceWest && !edgeDistanceEast) {
					moves.push(targetSquare);
				}
			}
		}
	}
	paintMoves();
}

function GeneratePawnMoves(startSquare, piece) {
	const startRank = Math.floor((63 - startSquare) / 8);
	const startFile = startSquare % 8;
	const pawnColor = document.getElementById("p" + startSquare).classList[0];
	let targetSquare;

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

	const addMove = (delta) => {
		const targetSquare = getTargetSquare(delta);
		if (targetSquare !== null) {
			moves.push(targetSquare);
		}
	};

	const captureDelta = pawnColor === "White" ? 1 : -1;
	const captureSquare = getTargetSquare(captureDelta);
	targetSquare = startSquare + 7 * captureDelta;
	if (document.getElementById("c" + targetSquare).hasChildNodes()) {
		addMove(7 * captureDelta);
	}
	targetSquare = startSquare + 9 * captureDelta;
	if (document.getElementById("c" + targetSquare).hasChildNodes()) {
		addMove(9 * captureDelta);
	}

	const forwardDelta = pawnColor === "White" ? 8 : -8;
	if (!getTargetSquare(forwardDelta)) {
	} else {
		addMove(forwardDelta);
	}

	if (
		(startRank === 6 && pawnColor === "White") ||
		(startRank === 1 && pawnColor === "Black")
	) {
		// check double pawn push from starting rank
		if (!getTargetSquare(forwardDelta * 2)) {
			// pawn is blocked and can't move
		} else {
			moves.push(startSquare + 2 * forwardDelta);
		}
	}
	paintMoves();
}

function GenerateKingMoves(startSquare, piece) {
	let targetSquare;
	let targetRank;
	let startRank = startSquare % 8;
	for (let n = 0; n < DirectionOffset.length; n++) {
		targetSquare = startSquare + DirectionOffset[n];
		if (targetSquare >= 0 && targetSquare <= 63) {
			targetRank = targetSquare % 8;
			if (document.getElementById("c" + targetSquare).hasChildNodes()) {
				if (
					document.getElementById("p" + targetSquare).classList[0] !=
					colorToMove
				) {
					if (Object.values(NumSquaresToEdge[startSquare])[2] < 1) {
						if (targetRank <= startRank + 1) {
							moves.push(targetSquare);
						}
					} else if (
						Object.values(NumSquaresToEdge[startSquare])[3] < 1
					) {
						if (targetRank >= startRank - 1) {
							moves.push(targetSquare);
						}
					}
					if (
						Object.values(NumSquaresToEdge[startSquare])[2] >= 1 &&
						Object.values(NumSquaresToEdge[startSquare])[3] >= 1
					) {
						moves.push(targetSquare);
					}
				}
			} else {
				if (Object.values(NumSquaresToEdge[startSquare])[2] < 1) {
					if (targetRank <= startRank + 1) {
						moves.push(targetSquare);
					}
				} else if (
					Object.values(NumSquaresToEdge[startSquare])[3] < 1
				) {
					if (targetRank >= startRank - 1) {
						moves.push(targetSquare);
					}
				}
				if (
					Object.values(NumSquaresToEdge[startSquare])[2] >= 1 &&
					Object.values(NumSquaresToEdge[startSquare])[3] >= 1
				) {
					moves.push(targetSquare);
				}
			}
		}
	}
	for (let n = 0; n < moves.length; n++) {
		document.getElementById("c" + moves[n]).classList.toggle("moves");
	}
}
