function Game() {
    this.hopeless = new Hopeless(Hopeless.DifficultyEnum.VERYEASY, 15, 10);
    this.graphics = new Graphics();

    var self = this;
    this.graphics.clickHandler = function (cell) {
        return self.click(cell);
    };
}

Game.prototype.render = function() {
    this.graphics.drawBoard(this.hopeless.board);
    console.log(this.hopeless.board+"");

    console.log(Heuristic.getBoardValue(this.hopeless.board));
    
    var solved_path = astar(game.hopeless.board, 0);
    console.log(solved_path);
    
    if (solved_path.length > 1) {
        var hint = solved_path[1].b.hint;
        console.log(hint);
        this.graphics.drawHint(hint);
    }

    this.graphics.render();
};

Game.prototype.click = function(cell) {
    console.log("Clicked: "+JSON.stringify(cell));
    if (this.hopeless.clickCell(cell)){
        this.render();
    }
};

var game = new Game();
game.render();

