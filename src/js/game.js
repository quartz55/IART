var SOLUTION = true;

function Game() {
    this.hopeless = new Hopeless(Hopeless.DifficultyEnum.EASY, 20, 10);
    this.graphics = new Graphics();

    var ex1 = [
        [3, 1, 2, 1, 2, 1, 3, 3, 2, 2, 1, 3, 1, 2, 3, 1, 2, 3, 2, 2],
        [3, 1, 2, 2, 2, 3, 1, 2, 3, 2, 1, 1, 1, 2, 2, 2, 2, 2, 1, 3],
        [2, 3, 3, 3, 2, 2, 2, 1, 1, 3, 2, 1, 2, 3, 3, 2, 2, 2, 1, 3],
        [3, 2, 1, 3, 2, 2, 3, 1, 1, 2, 1, 2, 2, 3, 2, 2, 2, 1, 2, 1],
        [1, 2, 1, 1, 1, 1, 3, 1, 2, 3, 2, 1, 3, 3, 3, 2, 1, 3, 3, 2],
        [2, 1, 3, 2, 1, 1, 3, 1, 2, 1, 1, 3, 1, 2, 2, 2, 2, 2, 1, 1],
        [2, 1, 2, 1, 3, 2, 1, 1, 3, 2, 3, 2, 2, 1, 1, 1, 2, 2, 3, 1],
        [1, 3, 2, 2, 3, 2, 3, 1, 2, 1, 3, 1, 1, 3, 1, 2, 2, 1, 3, 2],
        [3, 3, 3, 1, 1, 2, 2, 1, 1, 1, 1, 2, 3, 3, 3, 3, 3, 1, 1, 2],
        [2, 2, 1, 3, 1, 2, 3, 2, 2, 1, 1, 2, 1, 1, 3, 3, 2, 1, 3, 1]
    ];
    // this.hopeless.board.board = ex1;

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

    try {
        if (SOLUTION) {
            if (solution === undefined || !solution.onTrack(this.hopeless.board)) {
                console.error("No previous solution");
                var self = this;
                var measure = new Measure(function() {
                    return astar(self.hopeless.board, 0);
                }, 1);
                var solved_path = measure.ret;
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
    } catch (msg) {
        console.error(msg);
        console.error("Game has no solution");
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
        totalCost: path[path.length - 1].f,
        path: path,
        getHint: function() {
            if (this.path.length > 1) return this.path[1].b.hint;
            throw false;
        },
        getCost: function() {
            return this.totalCost - this.path[0].g;
        },
        next: function() {
            this.path.shift();
        },
        onTrack: function(board) {
            return board.equals(path[0].b);
        }
    };
    return sol;
};

var game = new Game();
game.render();
var solution = undefined;

function getCurrentBoard() {
    console.log(JSON.stringify(game.hopeless.board.board));
}
