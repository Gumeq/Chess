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
	for (let file = 0; file < 8; file++) {
		for (let rank = 0; rank < 8; rank++) {
			let numNorth = 7 - rank;
			let numSouth = rank;
			let numWest = file;
			let numEast = 7 - file;

			let squareIndex = rank * 8 + file;

			const minsToEdge = {
				numNorth,
				numSouth,
				numWest,
				numEast,
				NWMin: Math.min(numNorth, numWest),
				SEMin: Math.min(numSouth, numEast),
				NEMin: Math.min(numNorth, numEast),
				SWMin: Math.min(numSouth, numWest),
			};
			NumSquaresToEdge[squareIndex] = minsToEdge;
		}
	}
}
function GenerateMoves(cPosition) {
	let rank = Math.floor((63 - cPosition) / 8);
	let file = cPosition % 8;
	let piece = document.getElementById("c" + cPosition);
	if (piece.hasChildNodes()) {
		if (piece.children[0].classList[0] == colorToMove) {
			if (Board.ChessBoard[rank][file] % 8 > 3) {
				GenerateSlidingMoves(cPosition, piece);
			} else if (Board.ChessBoard[rank][file] % 8 == 3) {
				GenerateKnightMoves(cPosition, piece);
			} else if (Board.ChessBoard[rank][file] % 8 == 2) {
				GeneratePawnMoves(cPosition, piece);
			} else if (Board.ChessBoard[rank][file] % 8 == 1) {
				GenerateKingMoves(cPosition, piece);
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
			let targetRank = Math.floor((63 - targetSquare) / 8);
			let targetFile = targetSquare % 8;
			let pieceOnTargetSquare = Board.ChessBoard[targetRank][targetFile];
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

function GenerateKnightMoves(startSquare, piece) {
	let targetSquare;
	let targetRank;
	let startRank = startSquare % 8;
	for (let n = 0; n < DirectionOffsetKnight.length; n++) {
		targetSquare = startSquare + DirectionOffsetKnight[n];
		if (targetSquare >= 0 && targetSquare <= 63) {
			targetRank = targetSquare % 8;
			if (document.getElementById("c" + targetSquare).hasChildNodes()) {
				if (
					document.getElementById("p" + targetSquare).classList[0] !=
					colorToMove
				) {
					if (Object.values(NumSquaresToEdge[startSquare])[2] < 2) {
						if (targetRank <= startRank + 2) {
							moves.push(targetSquare);
						}
					} else if (
						Object.values(NumSquaresToEdge[startSquare])[3] < 2
					) {
						if (targetRank >= startRank - 2) {
							moves.push(targetSquare);
						}
					}
					if (
						Object.values(NumSquaresToEdge[startSquare])[2] >= 2 &&
						Object.values(NumSquaresToEdge[startSquare])[3] >= 2
					) {
						moves.push(targetSquare);
					}
				}
			} else {
				if (Object.values(NumSquaresToEdge[startSquare])[2] < 2) {
					if (targetRank <= startRank + 2) {
						moves.push(targetSquare);
					}
				} else if (
					Object.values(NumSquaresToEdge[startSquare])[3] < 2
				) {
					if (targetRank >= startRank - 2) {
						moves.push(targetSquare);
					}
				}
				if (
					Object.values(NumSquaresToEdge[startSquare])[2] >= 2 &&
					Object.values(NumSquaresToEdge[startSquare])[3] >= 2
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

function GeneratePawnMoves(startSquare, piece) {
	let targetSquare;
	let startRank = Math.floor((63 - startSquare) / 8);
	let startFile = startSquare % 8;
	if (document.getElementById("p" + startSquare).classList[0] == "White") {
		if (startSquare >= 8 && startSquare <= 15) {
			targetSquare = startSquare + 8;
			if (document.getElementById("c" + targetSquare).hasChildNodes()) {
			} else {
				targetSquare = startSquare + 16;
				if (
					document.getElementById("c" + targetSquare).hasChildNodes()
				) {
				} else {
					moves.push(startSquare + 16);
					enPassantColor = "White";
					enPassantSquare = startSquare + 8;
					enPassantPiece = startSquare + 16;
				}
			}
		}
		targetSquare = startSquare + 7;
		if (startRank == 3 && targetSquare == enPassantSquare) {
			moves.push(targetSquare);
		}
		if (
			document.getElementById("c" + targetSquare).hasChildNodes() &&
			document.getElementById("p" + targetSquare).classList[0] == "Black"
		) {
			moves.push(targetSquare);
		}
		targetSquare = startSquare + 9;
		if (startRank == 3 && targetSquare == enPassantSquare) {
			moves.push(targetSquare);
		}
		if (
			document.getElementById("c" + targetSquare).hasChildNodes() &&
			document.getElementById("p" + targetSquare).classList[0] == "Black"
		) {
			moves.push(targetSquare);
		}
		targetSquare = startSquare + 8;
		if (document.getElementById("c" + targetSquare).hasChildNodes()) {
		} else {
			moves.push(targetSquare);
		}
	} else {
		if (startSquare >= 48 && startSquare <= 55) {
			targetSquare = startSquare - 8;
			if (document.getElementById("c" + targetSquare).hasChildNodes()) {
			} else {
				targetSquare = startSquare - 16;
				if (
					document.getElementById("c" + targetSquare).hasChildNodes()
				) {
				} else {
					moves.push(startSquare - 16);
					enPassantSquare = startSquare - 8;
					enPassantPiece = startSquare - 16;
					enPassantColor = "Black";
				}
			}
		}
		targetSquare = startSquare - 7;
		if (startRank == 4 && targetSquare == enPassantSquare) {
			moves.push(targetSquare);
		}
		if (
			document.getElementById("c" + targetSquare).hasChildNodes() &&
			document.getElementById("p" + targetSquare).classList[0] == "White"
		) {
			moves.push(targetSquare);
		}
		targetSquare = startSquare - 9;
		if (startRank == 4 && targetSquare == enPassantSquare) {
			moves.push(targetSquare);
		}
		if (
			document.getElementById("c" + targetSquare).hasChildNodes() &&
			document.getElementById("p" + targetSquare).classList[0] == "White"
		) {
			moves.push(targetSquare);
		}
		targetSquare = startSquare - 8;
		if (document.getElementById("c" + targetSquare).hasChildNodes()) {
		} else {
			moves.push(targetSquare);
		}
	}
	for (let n = 0; n < moves.length; n++) {
		document.getElementById("c" + moves[n]).classList.toggle("moves");
	}
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
