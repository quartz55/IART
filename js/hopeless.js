Hopeless.DifficultyEnum = {
	LOL : 1,
	VERYEASY : 2,
	EASY : 3,
	NORMAL : 4,
	HARD : 5
};

/**
 * Hopeless game class
 * @param difficulty
 * @param width
 * @param height
 * @constructor
 */
function Hopeless(difficulty, width, height) {
	difficulty = difficulty || Hopeless.DifficultyEnum.NORMAL;
	width = width || 20;
	height = height || 10;

	this.board = new Board(width, height);
	this.board.generate(difficulty);
}

Hopeless.prototype.clickCell = function(cell) {
	var changed = false;
	
	var island = this.board.getIsland(cell);
	if (island.length >= 2) {
		this.board.removeIsland(island);
		changed = true;
	}
	if (changed) {
		this.board.applyGravity();
	}
	
	return changed;
};

/**
 * Board class
 * @param width int
 * @param height int
 * @param difficulty int
 * @constructor
 */
function Board(width, height) {
	this.board = [];
	
	this.width = width;
	this.height = height;
}

Board.prototype.generate = function(difficulty) {
	for (var i = 0; i < this.height; ++i) {
		var row = [];
		for (var k = 0; k < this.width; ++k) {
			row.push( Math.floor(Math.random()*difficulty) + 1 );
		}
		this.board.push(row);
	}
};

Board.prototype.toString = function() {
	var aux = "";
	for (var i = 0; i < this.height; ++i) {
		for (var k = 0; k < this.width; ++k) {
			aux += this.board[i][k] + " ";
		}
		aux += "\n";
	}
	return aux;
};

Board.prototype.getIsland = function(cell) {
	var x = cell[0];
	var y = cell[1];
	if (!this.board[y] || !this.board[y][x]) return undefined;
	var color = this.board[y][x];
	if (color == 0) return undefined;
	var island = [[x,y]];
	var open = this._getNeighbours(x,y);

	while (open.length > 0) {
		var curr = open[0];

		var exists = false;
		for (var i = 0; i < island.length; ++i) {
			if (island[i][0] == curr[0] && island[i][1] == curr[1]) {
				exists = true;
				break;
			}
		}
		
		if (this.board[curr[1]][curr[0]] == color && !exists) {
			island.push(curr);
			var neigh = this._getNeighbours(curr[0], curr[1])
			open = open.concat(neigh);
		}
		open.shift();
	}

	return island;
};

Board.prototype.getIslands = function() {
	var islands = [];
	var closed = [];
	
	for (var i = 0; i < this.height; ++i) {
		for (var k = 0; k < this.width; ++k) {
			var exists = false;
			for (var j = 0; j < closed.length; ++j) {
				if (closed[j][0] == k && closed[j][1] == i) {
					exists = true;
					break;
				}
			}
			if (exists) continue;
			
			var tmp = this.getIsland([k,i]);
			if (tmp !== undefined) {
				islands.push(tmp);
				closed = closed.concat(tmp);
			}
		}
	}
	return islands;
};

Board.prototype.applyGravity = function() {
	// Vertical gravity
	for (var i = this.height-2; i >= 0; --i) {
		for (var k = 0; k < this.width; ++k) {
				this.fallCell([k,i]);
		}
	}
	
	// Horizontal gravity
	for (var i = 1; i < this.width; ++i) {
		this.moveColumn(i);
	}
};

Board.prototype.fallCell = function(cell) {
	var x = cell[0];
	var y = cell[1];

	if (this.board[y][x] == 0) return;

	var yf = y;
	do{
		++yf;
	} while(yf < this.height && this.board[yf][x] == 0);
	
	this.moveCell(cell, [x,yf-1]);
};

Board.prototype.moveColumn = function(x) {
	if (this.board[this.height-1][x] == 0) return;
	
	var xf = x;
	do {
		--xf;
	} while(xf >= 0 && this.board[this.height-1][xf] == 0);
	++xf;
	if (xf == x) return;
	
	for (var i = 0; i < this.height; ++i) {
		this.moveCell([x,i],[xf,i]);
	}
};

Board.prototype.moveCell = function(celli, cellf) {
	var xi = celli[0]; var yi = celli[1];
	var xf = cellf[0]; var yf = cellf[1];
	var tmp = this.board[yf][xf];
    this.board[yf][xf] = this.board[yi][xi];
    this.board[yi][xi] = tmp;
};

Board.prototype.removeIsland = function(island) {
	for (var i = 0; i < island.length; ++i)
		this.removeCell(island[i]);
};

Board.prototype.removeIslandFromCell = function(cell) {
	var island = this.getIsland(cell);
	this.removeIsland(island);
};

Board.prototype.removeCell = function(cell) {
	if (this.board[cell[1]] && this.board[cell[1]][cell[0]]) {
		this.board[cell[1]][cell[0]] = 0;
		return true;
	}
	return false;
};

Board.prototype._getClickableIslands = function() {
	return this._trimNonClickable(this.getIslands());
};

Board.prototype.getSuccessors = function() {
	var successors = [];
	var clickable = this._getClickableIslands();
	for (var i = 0; i < clickable.length; ++i) {
		var succ = this.clone();
		succ.removeIsland(clickable[i]);
		succ.applyGravity();
		succ.hint = clickable[i][0];
		successors.push(succ);
	}
	
	return successors;
};

Board.prototype.clone = function() {
	var clone = new Board(this.width, this.height);
	
	var b = [];
	for (var i = 0; i < this.height; ++i) {
		var tmp = [];
		for (var k = 0; k < this.width; ++k) {
			tmp.push(this.board[i][k]);
		}
		b.push(tmp);
	}
	clone.board = b;

	return clone;
};

Board.prototype._trimNonClickable = function(islands) {
	var clickable = [];
	for (var i = 0; i < islands.length; ++i) {
		if (islands[i].length >= 2) clickable.push(islands[i]);
	}
	return clickable;
};

Board.prototype._getNeighbours = function(x, y) {
	var neigh = [];
	if (this.board[y] && this.board[y][x+1]) neigh.push([x+1,y]);
	if (this.board[y] && this.board[y][x-1]) neigh.push([x-1,y]);
	if (this.board[y+1] && this.board[y+1][x]) neigh.push([x,y+1]);
	if (this.board[y-1] && this.board[y-1][x]) neigh.push([x,y-1]);
	
	return neigh;
};

