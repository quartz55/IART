function Graphics() {
	this.renderer = PIXI.autoDetectRenderer(
		256, 256,
		{antialias: false, transparent: false, resolution: 1}
	);
	this.renderer.view.style.position = "absolute";
	this.renderer.view.style.display = "block";
	this.renderer.autoResize = true;
	this.renderer.resize(window.innerWidth, window.innerHeight);

	document.body.appendChild(this.renderer.view);
	this.stage = new PIXI.Container();

	this.colors = {
		0: 0x000000,
		1: 0xAA0000,
		2: 0x00AA00,
		3: 0x0000AA,
		4: 0xAA00AA,
		5: 0xAAAA00
	};
	
	this.clickHandler = function (cell) {console.log("Clicked: "+JSON.stringify(cell));};
	
	this.squareSize = 0;
}

Graphics.prototype.drawBoard = function(board) {
	var b = board.board;
	var self = this;

	this.renderer.resize(window.innerWidth, window.innerHeight);

	this.squareSize = Math.min(window.innerWidth / board.width, window.innerHeight / board.height);
	var squareSize = this.squareSize;

	for (var i = 0; i < board.height; ++i) {
		for (var k = 0; k < board.width; ++k) {
			var rect = new PIXI.Graphics();
			
			rect.hitArea = new PIXI.Rectangle(k*squareSize, i*squareSize, squareSize, squareSize);
			rect.interactive = true;
			rect.cell = [k,i];
			rect.mousedown = rect.touchstart = function(data) {
				self.clickHandler(this.cell);
			};
			
			rect.beginFill(this.colors[b[i][k]]);
			rect.drawRect(k*squareSize, i*squareSize, squareSize, squareSize);
			rect.endFill();
			
			this.stage.addChild(rect);
		}
	}
};

Graphics.prototype.drawHint = function(cell) {
	var rect = new PIXI.Graphics();
	rect.beginFill(0xffffff);
	rect.fillAlpha = 0.5;
	rect.drawRect(cell[0]*this.squareSize, cell[1]*this.squareSize, this.squareSize, this.squareSize);
	rect.endFill();

	this.stage.addChild(rect);
};

Graphics.prototype.render = function() {
	this.renderer.render(this.stage);
};
