var SOLUTION = true;

function Game() {
    // this.hopeless = new Hopeless(Hopeless.DifficultyEnum.EASY, 10, 5);
    this.hopeless = new Hopeless(Hopeless.DifficultyEnum.NORMAL, 20, 10);
    this.graphics = new Graphics();

    var ex = [[4,1,2,1,4,3,1,4,4,3,2,1,3,4,4,3,4,1,3,3],[2,4,2,2,4,1,2,3,4,1,2,4,4,3,2,4,4,1,4,1],[4,3,3,1,1,3,1,1,2,1,2,2,2,3,4,4,3,1,2,4],[1,2,2,2,3,4,1,4,2,1,2,1,4,3,4,4,3,3,3,3],[4,4,3,4,3,4,3,2,1,1,4,4,4,4,2,2,2,4,1,4],[3,2,1,1,1,3,4,3,2,2,3,3,3,4,3,3,3,4,1,4],[1,3,1,2,2,4,1,4,3,2,1,4,4,1,4,4,2,1,2,2],[2,1,4,4,3,2,4,3,1,3,1,2,2,2,3,4,1,2,2,3],[1,4,4,3,3,1,4,4,4,1,3,1,4,3,2,1,1,1,4,4],[4,3,4,4,4,3,1,4,3,4,2,4,1,1,4,3,3,3,2,2]];
    this.hopeless.board.board = ex;

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
        if (!solution || !solution.onTrack(this.hopeless.board)) {
            if (solving) solving.cancel();
            console.error("No previous solution");
            var solver = new Astar(this.hopeless.board);
            solving = solver.solve().then(function(time) {
                console.log("");
                console.info("---- Standard ----");
                console.info(">  " + time + "ms");
                console.info(">  Cost: " + solver.solution.slice(-1).pop().getF() * -1);
                console.log("");

                var solved_path = solver.getSolution();
                solution = Game.makeSolution(solved_path);

                console.log("Total cost: " + solution.totalCost * -1);
                console.log("Current cost: " + solution.getCost() * -1);
                console.log("Estimated cost: " + Heuristic.getBoardValue(this.hopeless.board) * -1);
                console.log("Hint: " + JSON.stringify(solution.getHint()));
                this.graphics.drawHint(solution.getHint());

                solution.next();

                this.graphics.render();
            }.bind(this));
        }
        else {
            console.log("Total cost: " + solution.totalCost * -1);
            console.log("Current cost: " + solution.getCost() * -1);
            console.log("Estimated cost: " + Heuristic.getBoardValue(this.hopeless.board) * -1);
            console.log("Hint: " + JSON.stringify(solution.getHint()));
            this.graphics.drawHint(solution.getHint());

            solution.next();

            this.graphics.render();
        }
    }
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
var solving;
var game = new Game();
game.render();

function getCurrentBoard() {
    console.log(JSON.stringify(game.hopeless.board.board));
}
