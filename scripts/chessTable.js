// Create a center element and a table element for the chessboard
var center = document.createElement("center");
var ChessTable = document.createElement("table");
ChessTable.setAttribute("id", "ChessTable");

// Create rows and cells for the chessboard
for (let file = 0; file < 8; file++) {
	const row = document.createElement("tr");
	for (let rank = 0; rank < 8; rank++) {
		// Calculate the cell number and ID based on the file and rank
		const cellNum = 64 - 8 * (file + 1) + rank;
		const cellID = `c${cellNum}`;

		// Create a cell element and set its ID and class
		const cell = document.createElement("td");
		cell.setAttribute("id", cellID);
		cell.className =
			(rank + file) % 2 ? "cell blackCell" : "cell whiteCell";

		// Append the cell to the current row
		row.appendChild(cell);
	}

	// Append the row to the chessboard
	ChessTable.appendChild(row);
}

// Append the chessboard to the center element
center.appendChild(ChessTable);

// Set the width of the chessboard and append the center element to the HTML body
ChessTable.setAttribute("width", "800px");
document.body.appendChild(center);
