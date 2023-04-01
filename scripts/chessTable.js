var center = document.createElement("center");
var ChessTable = document.createElement("table");
ChessTable.setAttribute("id", "ChessTable");

for (var file = 0; file < 8; file++) {
	var row = document.createElement("tr");
	for (var rank = 0; rank < 8; rank++) {
		var cellNum = 64 - 8 * (file + 1) + rank;
		var cellID = "c" + cellNum.toString();
		var cell = document.createElement("td");
		var number = document.createTextNode(cellNum);

		if ((rank + file) % 2 == 0) {
			cell.setAttribute("class", "cell whiteCell");
		} else {
			cell.setAttribute("class", "cell blackCell");
		}

		cell.setAttribute("id", cellID);
		// cell.appendChild(number);
		row.appendChild(cell);
	}
	ChessTable.appendChild(row);
}

center.appendChild(ChessTable);
ChessTable.setAttribute("width", "800px");

document.body.appendChild(center);
