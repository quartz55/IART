function Game() {
    this.hopeless = new Hopeless(Hopeless.DifficultyEnum.EASY, 10, 10);
    this.graphics = new Graphics();

    var self = this;
    this.graphics.clickHandler = function (cell) {
        return self.click(cell);
    };
}

Game.prototype.render = function() {
    this.graphics.stage.removeChildren();
    this.graphics.drawBoard(this.hopeless.board);
    console.log(this.hopeless.board+"");
    
    this.graphics.render();

    try {
        if (solution === undefined || !solution.onTrack(this.hopeless.board)) {
            console.error("No previous solution");
            var solved_path = astar(game.hopeless.board, 0);
            solution = Game.makeSolution(solved_path);
        }
    
        console.log("Final F cost: "+solution.cost);
        console.log("Estimated cost: "+Heuristic.getBoardValue(this.hopeless.board));
        console.log("Hint: "+JSON.stringify(solution.getHint()));
        this.graphics.drawHint(solution.getHint());
        
        solution.next();
    }
    catch (msg) {
        console.error(msg);
        console.error("Game has no solution");
    }

    this.graphics.render();
};

Game.prototype.click = function(cell) {
    console.log("Clicked: "+JSON.stringify(cell));
    if (this.hopeless.clickCell(cell)){
        this.render();
    }
};

Game.makeSolution = function(path) {
    var sol = {
        cost: path[path.length-1].f,
        path: path,
        getHint: function() {if (this.path.length>1) return this.path[1].b.hint; throw false;},
        next: function () {this.path.shift();},
        onTrack: function(board) { return board.equals(path[0].b); }
    };
    return sol;
};

var game = new Game();
game.render();
var solution = undefined;

