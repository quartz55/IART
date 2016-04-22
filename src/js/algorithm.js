var Heuristic = {
    getBoardValue : function(board) {
        var stats = board.getStats();
        var clickable = 0;
        for (var i = 0; i < stats.islands.length; ++i)
            clickable += stats.islands[i].click.length;

        var num_colors = stats.islands.length;
        // Jumps
        if (clickable < 1 && num_colors > 0) {
            return 99999;
        } else if (clickable == num_colors) return num_colors;

        var h = num_colors; //Minimum possible
        var tmp_sum = 0;
        for (var i = 0; i < num_colors; ++i) {
            var can_click = stats.islands[i].click.length;
            var non_clickable = stats.islands[i].islands.length - can_click;
            if (non_clickable == 1 && can_click === 0) {
                return 99999;
            }

            if (can_click == stats.islands[i].length === 0)
                tmp_sum += can_click;
            else if (can_click == stats.islands[i].length)
                tmp_sum += can_click / 2;
            else tmp_sum += (can_click / 2 + non_clickable / 2) / (num_colors / 2);
        }
        h += tmp_sum;

        return h;
    }
};

function Node(board, parent, g, h) {
    g = g || 0;
    h = h || 0;
    this._board = board;
    this._parent = parent;
    this._value = undefined;
    this._f = undefined;
    this._g = undefined;
    this._h = undefined;


    this.setGH = function(g, h) {
        this._g = g;
        this._h = h;
        this._setF();
    };

    this.getG = function() {
        return this._g;
    };

    this.getH = function() {
        return this._h;
    };

    this.getF = function() {
        if (this._f === undefined)
            this._setF();
        return this._f;
    };

    this.getBoard = function() {
        return this._board;
    };

    this.getParent = function() {
        return this._parent;
    };

    this.setParent = function(parent) {
        if (typeof parent === typeof this) this._parent = parent;
        else console.error("Parent is not of same type as node");
    };

    this.getNodeValue = function() {
        if (this._value === undefined)
            this._value = Heuristic.getBoardValue(this._board);
        return this._value;
    };

    this._setF = function() {
        this._f = this._g + this._h;
    };

    this.toString = function() {
        return this._board.toString();
    };

    this.setGH(g, h);

}

function Solver(start, goal, options) {
    this.options = new HashSet();
    if (options !== undefined) {
        for (var i = 0; i < options.length; ++i) {
            this.options.add(options[i]);
        }
    }

    this.start = new Node(start);
    this.goal = goal;
    this.openSet = new BinaryHeap(function(node) {
        return node.f + node.h;
    });
    this.openSet.push(this.start);
    this.closedSet = new HashSet();
    this.solution = [];
}

Solver.prototype.iter = function() {
    return true;
};

Solver.prototype.solve = function(options) {
    while (!this.iter());
    console.log("Branches checked: " + this.closedSet.count());
};

Solver.prototype.makePath = function(node) {
    var path = [node];
    var currNode = node;
    var parent = node.getParent();
    while (parent !== undefined) {
        path.unshift(parent);
        currNode = parent;
        parent = currNode.getParent();
    }
    return path;
};

Solver.prototype.getSolution = function() {
    return this.solution;
};

function Astar(start, goal, options) {
    Solver.call(this, start, goal, options);
}

Astar.prototype = Object.create(Solver.prototype);
Astar.prototype.constructor = Astar;

Astar.prototype.iter = function() {
    if (this.openSet.size() > 0) {
        var currNode = this.openSet.pop();

        if (currNode.getBoard().getNumCells() <= this.goal) {
            var path = this.makePath(currNode);
            this.solution = this.makePath(currNode);
            return true;
        }

        this.closedSet.add(currNode);

        // Generate successors
        var successors = [];
        var tmp = currNode.getBoard().getSuccessors();
        for (var i = 0; i < tmp.length; ++i) {
            var n = new Node(tmp[i], currNode);
            if (n.getNodeValue() > 9999) continue;

            var h = n.getNodeValue();
            if (!this.options.contains("noweight")) {
                var weight = 1 + n.getBoard().getNumCells() / (n.getBoard().height * n.getBoard().width);
                h *= weight;
            }
            n.setGH(currNode.getG() + 1, h);
            successors.push(n);
        }
        // ...

        for (var i = 0; i < successors.length; ++i) {
            var succ = successors[i];
            var isClosed = this.closedSet.contains(succ);

            if (!isClosed) {
                var isOpen = false;
                for (var k = 0; k < this.openSet.size(); ++k) {
                    if (succ.getBoard().equals(this.openSet.content[k].getBoard())) {
                        isOpen = true;
                        if (succ.getG() < this.openSet.content[k].getG()) {
                            this.openSet.remove(this.openSet.content[k]);
                            this.openSet.push(succ);
                        }
                        break;
                    }
                }
                if (!isOpen) {
                    this.openSet.push(succ);
                }
            }
        }
        // console.log("Curr F: " + currNode.f + " = " + currNode.g + " + " + currNode.h);
        return false;
    } else return true;
};
