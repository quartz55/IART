function Game(difficulty) {
    difficulty = difficulty || Hopeless.DifficultyEnum.NORMAL;

    this.hopeless = new Hopeless(difficulty, 20, 10);
    this.graphics = new Graphics();

    this.solver = new Astar(this.hopeless.board, Heuristics.heur1);

    var ex = [[4,1,2,1,4,3,1,4,4,3,2,1,3,4,4,3,4,1,3,3],[2,4,2,2,4,1,2,3,4,1,2,4,4,3,2,4,4,1,4,1],[4,3,3,1,1,3,1,1,2,1,2,2,2,3,4,4,3,1,2,4],[1,2,2,2,3,4,1,4,2,1,2,1,4,3,4,4,3,3,3,3],[4,4,3,4,3,4,3,2,1,1,4,4,4,4,2,2,2,4,1,4],[3,2,1,1,1,3,4,3,2,2,3,3,3,4,3,3,3,4,1,4],[1,3,1,2,2,4,1,4,3,2,1,4,4,1,4,4,2,1,2,2],[2,1,4,4,3,2,4,3,1,3,1,2,2,2,3,4,1,2,2,3],[1,4,4,3,3,1,4,4,4,1,3,1,4,3,2,1,1,1,4,4],[4,3,4,4,4,3,1,4,3,4,2,4,1,1,4,3,3,3,2,2]];
    // this.hopeless.board.board = ex;

    var self = this;
    this.graphics.clickHandler = function(cell) {
        return self.click(cell);
    };

}

Game.prototype.new = function(difficulty) {
    this.hopeless = new Hopeless(difficulty, 20, 10);
    this.solver.update(this.hopeless.board);
};

Game.prototype.render = function() {
    this.graphics.drawBoard(this.hopeless.board);
    // console.log(this.hopeless.board + "");
    console.log("Estimated cost: " + this.solver.heuristic.getBoardValue(this.hopeless.board) * -1);
};

Game.prototype.step = function(){
    console.log("");
    console.log("Total cost: " + solution.totalCost * -1);
    console.log("Current cost: " + solution.getCost() * -1);
    console.log("Hint: " + JSON.stringify(solution.getHint()));
    this.graphics.drawHint(solution.getHint());

    solution.next();
};

Game.prototype.solve = function() {
    if (!solution) {
        if (solving) solving.cancel();
        console.error("No previous solution");
        this.solver.update(this.hopeless.board);
        solving = this.solver.solve().then(function(time) {
            console.log("");
            console.info("---- Standard ----");
            console.info(">  " + time + "ms");
            console.info(">  Cost: " + this.solver.solution.slice(-1).pop().getF() * -1);
            console.log("");

            var solved_path = this.solver.getSolution();
            solution = Game.makeSolution(solved_path);

            this.step();
        }.bind(this));
    }
};

Game.prototype.click = function(cell) {
    console.log("Clicked: " + JSON.stringify(cell));
    if (this.hopeless.clickCell(cell)) {
        this.render();

        if (solution && solution.onTrack(this.hopeless.board))
            this.step();
        else solution = undefined;
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
var game;

function newGame(difficulty) {
    if (game) {
        game.new(difficulty);
        game.render();
    }
    else {
        game = new Game(difficulty);
        game.render();
    }
    solution = undefined;
}

function animation() {
    requestAnimationFrame(animation);

    game.graphics.render();
}

function getCurrentBoard() {
    console.log(JSON.stringify(game.hopeless.board.board));
}

document.getElementById("new_game_btn").onclick = function () {
    var selected_diff = document.getElementById("difficulty_select");
    var diff = Hopeless.DifficultyEnum[selected_diff.options[selected_diff.selectedIndex].value];

    newGame(diff);
};

document.getElementById("solve_btn").onclick = function() { game.solve(); };

newGame();
animation();
