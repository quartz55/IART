var Heuristic = {
    getBoardValue: function(board) {
        var total = 0;

        var islands = board.getIslands();
        var clickable = Board.trimNonClickable(islands);
        var not_clickable = islands.length-clickable.length;

        if (clickable.length === 0) return 0;
        for (var i = 0; i < clickable.length; ++i) {
          total += Math.pow(clickable[i].length, 2);
        }

        // var stats = board.getStats();
        // total = 0;
        // stats.islands.forEach(function(el) {
        //     var tmp = 0;
        //     el.click.forEach(function(island) {
        //         tmp += island.length;
        //     });
        //     total += Math.pow(tmp, 2);
        // });

        return -total;
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

    Node.makePath = function(node) {
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
        return node.getF();
    });
    this.openSet.push(this.start);
    this.closedSet = new HashSet();
    this.solution = [];
}

Solver.prototype.iter = function() {
    return true;
};

Solver.prototype.solve = function(options) {
    var self = this;
    Promise.config({cancellation: true});
    return new Promise(function(resolve, reject, onCancel) {
        var now = Date.now();
        var interv = setInterval(function() {
            if (self.iter()) {
                clearInterval(interv);
                console.log("Branches checked: " + self.closedSet.count());
                return resolve(Date.now() - now);
            }
        }, 0);
        onCancel(function() { console.error("Cancelled!"); clearInterval(interv); });
    });
};


Solver.prototype.getSolution = function() {
    return this.solution;
};

function Astar(start, options) {
    Solver.call(this, start, undefined, options);
}

Astar.prototype = Object.create(Solver.prototype);
Astar.prototype.constructor = Astar;

Astar.prototype.iter = function() {
    if (this.openSet.size() > 0) {
        var currNode = this.openSet.pop();

        this.closedSet.add(currNode);

        // Generate successors
        var successors = [];
        var tmp = currNode.getBoard().getSuccessors();
        if (tmp.length === 0) {
            this.solution = Node.makePath(currNode);
            return true;
        }
        for (var i = 0; i < tmp.length; ++i) {
            var n = new Node(tmp[i], currNode);

            var h = n.getNodeValue();
            if (!this.options.contains("noweight")) {
                var weight = 1 + n.getBoard().getNumCells() / (n.getBoard().height * n.getBoard().width);
                h /= weight;
            }

            var play = -Math.pow(currNode.getBoard().getNumCells() - n.getBoard().getNumCells(), 2);
            var g = currNode.getG() + play;

            n.setGH(g, h);
            successors.push(n);
        }


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
        return false;
    } else {
        return true;
    }
};
