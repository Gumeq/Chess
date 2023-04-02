var center = document.createElement("center");
var ChessTable = document.createElement("table");
ChessTable.setAttribute("id", "ChessTable");

for (let file = 0; file < 8; file++) {
	const row = document.createElement("tr");
	for (let rank = 0; rank < 8; rank++) {
		const cellNum = 64 - 8 * (file + 1) + rank;
		const cellID = `c${cellNum}`;
		const cell = document.createElement("td");
		cell.setAttribute("id", cellID);
		cell.className =
			(rank + file) % 2 ? "cell blackCell" : "cell whiteCell";
		row.appendChild(cell);
	}
	ChessTable.appendChild(row);
}

center.appendChild(ChessTable);
ChessTable.setAttribute("width", "800px");

document.body.appendChild(center);
