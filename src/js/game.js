var SOLUTION = true;

function Game() {
    this.hopeless = new Hopeless(Hopeless.DifficultyEnum.VERYEASY, 10, 10);
    this.graphics = new Graphics();

    // this.hopeless.board.board = ex2;

    var self = this;
    this.graphics.clickHandler = function(cell) {
        return self.click(cell);
    };
}

Game.prototype.render = function() {
    this.graphics.stage.removeChildren();
    this.graphics.drawBoard(this.hopeless.board);
    console.log(this.hopeless.board + "");

    this.graphics.render();

    if (SOLUTION) {
        if (solution === undefined || !solution.onTrack(this.hopeless.board)) {
            console.error("No previous solution");
            var solver = new Astar(this.hopeless.board, 0);
            var measure = new Measure(function() {
                solver.solve();
            }, 1);
            var solved_path = solver.getSolution();
            console.log("----------------------");
            console.log("Time taken: " + measure + "ms");
            solution = Game.makeSolution(solved_path);
        }

        console.log("Total cost: " + solution.totalCost);
        console.log("Current cost: " + solution.getCost());
        console.log("Estimated cost: " + Heuristic.getBoardValue(this.hopeless.board));
        console.log("Hint: " + JSON.stringify(solution.getHint()));
        this.graphics.drawHint(solution.getHint());

        solution.next();

    }
    this.graphics.render();
};

Game.prototype.click = function(cell) {
    console.log("Clicked: " + JSON.stringify(cell));
    if (this.hopeless.clickCell(cell)) {
        this.render();
    }
};

Game.makeSolution = function(path) {
    if (path.length === 0) throw "Couldn't find solution";
    var sol = {
        totalCost: path[path.length - 1].getF(),
        path: path,
        getHint: function() {
            if (this.path.length > 1) return this.path[1].getBoard().hint;
            throw false;
        },
        getCost: function() {
            return this.totalCost - this.path[0].getG();
        },
        next: function() {
            this.path.shift();
        },
        onTrack: function(board) {
            return board.equals(path[0].getBoard());
        }
    };
    return sol;
};

var solution;
var game = new Game();
game.render();

function getCurrentBoard() {
    console.log(JSON.stringify(game.hopeless.board.board));
}
