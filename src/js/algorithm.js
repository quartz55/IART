var Heuristics = {
    heur1: {
        getBoardValue: function(board) {
            var total = 0;

            var islands = board.getIslands();
            var clickable = Board.trimNonClickable(islands);
            var not_clickable = islands.length - clickable.length;
            var colors = board.getColors();

            if (clickable.length === 0) return 0;
            for (var i = 0; i < clickable.length; ++i) {
                total += Math.pow(clickable[i].length, 2);
            }

            return -total;
        }
    },
    heur2: {
        getBoardValue: function(board) {
            var total = 0;

            var stats = board.getStats();
            total = 0;
            stats.islands.forEach(function(el) {
                var tmp = 0;
                el.click.forEach(function(island) {
                    tmp += island.length;
                });
                total += Math.pow(tmp, 2);
            });

            return -total;
        }
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

    this.getG = function() {return this._g;};
    this.getH = function() {return this._h;};
    this.getF = function() {
        if (this._f === undefined)
            this._setF();
        return this._f;
    };
    this.getBoard = function() {return this._board;};
    this.getParent = function() {return this._parent;};

    this.setParent = function(parent) {
        if (typeof parent === typeof this) this._parent = parent;
        else console.error("Parent is not of same type as node");
    };

    this.getNodeValue = function(heuristic) {
        if (!this._value) this._value = heuristic.getBoardValue(this._board);
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

function Solver(start, heuristic, options) {
    this.options = new HashSet();
    if (options !== undefined) {
        for (var i = 0; i < options.length; ++i) {
            this.options.add(options[i]);
        }
    }
    this.heuristic = heuristic || Heuristics.heur1;
    this.update(start);


    this.addOption = function(opts) {
        if (opt instanceof Array) opts.forEach(function(o) { this.options.add(o); });
        else if (typeof opts === 'string') this.options.add(o);
        else throw new Error("Invalid option type");

        return this;
    };

    this.iter = function() {return true;};
    this.getSolution = function() {return this.solution;};

    this.solve = function(options) {
        var self = this;
        Promise.config({
            cancellation: true
        });
        return new Promise(function(resolve, reject, onCancel) {
            var now = Date.now();
            var interv = setInterval(function() {
                if (self.iter()) {
                    clearInterval(interv);
                    console.log("Branches checked: " + self.closedSet.count());
                    return resolve(Date.now() - now);
                }
            }, 0);
            onCancel(function() {
                console.error("Cancelled!");
                clearInterval(interv);
            });
        });
    };

}

Solver.prototype.update = function(start) {
    this.start = new Node(start);
    this.openHashSet = {};
    this.openSet = new BinaryHeap(function(node) {
        return node.getF();
    });
    this.openSet.push(this.start);
    this.closedSet = new HashSet();
    this.solution = [];
};

function Astar(start, heuristic, options) {
    Solver.call(this, start, heuristic, options);

    this.iter = function() {
        if (this.openSet.size() > 0) {
            var currNode = this.openSet.pop();
            delete this.openHashSet[currNode];

            var counter = 0;
            for (var i in this.openHashSet) ++counter;
            if (counter !== this.openSet.size()) throw new Error("fuck");

            this.closedSet.add(currNode);

            // Generate successors
            var successors = currNode.getBoard().getSuccessors();
            if (successors.length === 0) {
                this.solution = Node.makePath(currNode);
                return true;
            }

            for (var i = 0; i < successors.length; ++i) {
                var succ = successors[i];

                // Ignore already evaluated
                if (this.closedSet.contains(succ)){
                    continue;
                }

                if (!this.openHashSet.hasOwnProperty(succ)) {
                    var g = currNode.getG() + (-Math.pow(currNode.getBoard().distance(succ), 2));
                    var h = this.heuristic.getBoardValue(succ);
                    if (!this.options.contains("noweight")) {
                        var weight = 1 + (succ.getNumCells() / (succ.height * succ.width) * 2);
                        h /= weight;
                    }
                    var node = new Node(succ, currNode, g, h);

                    this.openSet.push(node);
                    this.openHashSet[succ] = node;
                }
                else {
                    var alreadyOpen = this.openHashSet[succ];

                    var g = currNode.getG() + (-Math.pow(currNode.getBoard().distance(succ), 2));
                    if (g >= alreadyOpen.getG()) {
                        continue;
                    }

                    var h = this.heuristic.getBoardValue(succ);
                    if (!this.options.contains("noweight")) {
                        var weight = 1 + succ.getNumCells() / (succ.height * succ.width);
                        h /= weight;
                    }
                    var node = new Node(succ, currNode, g, h);

                    this.openSet.remove(alreadyOpen);
                    this.openSet.push(node);
                    this.openHashSet[succ] = node;
                }
            }
            return false;
        } else {
            return true;
        }
    };
}

Astar.prototype = Object.create(Solver.prototype);
Astar.prototype.constructor = Astar;

function BFS(start, heuristic, options) {
    Solver.call(this, start, heuristic, options);

    this.update = function(start) {
        Solver.prototype.update.call(this, start);
        this.openSet = new BinaryHeap(function(node) {
            return node.getH();
        });
        this.openSet.push(this.start);
    };

    this.iter = function() {
        if (this.openSet.size() > 0) {
            var currNode = this.openSet.pop();
            delete this.openHashSet[currNode];

            var counter = 0;
            for (var i in this.openHashSet) ++counter;
            if (counter !== this.openSet.size()) throw new Error("fuck");

            this.closedSet.add(currNode);

            // Generate successors
            var successors = currNode.getBoard().getSuccessors();
            if (successors.length === 0) {
                this.solution = Node.makePath(currNode);
                return true;
            }

            for (var i = 0; i < successors.length; ++i) {
                var succ = successors[i];

                // Ignore already evaluated
                if (this.closedSet.contains(succ)){
                    continue;
                }

                if (!this.openHashSet.hasOwnProperty(succ)) {
                    var g = currNode.getG() + (-Math.pow(currNode.getBoard().distance(succ), 2));
                    var h = this.heuristic.getBoardValue(succ);
                    if (!this.options.contains("noweight")) {
                        var weight = 1 + succ.getNumCells() / (succ.height * succ.width);
                        h /= weight;
                    }
                    var node = new Node(succ, currNode, g, h);

                    this.openSet.push(node);
                    this.openHashSet[succ] = node;
                }
                else {
                    var alreadyOpen = this.openHashSet[succ];

                    var g = currNode.getG() + (-Math.pow(currNode.getBoard().distance(succ), 2));
                    if (g >= alreadyOpen.getG()) {
                        continue;
                    }

                    var h = this.heuristic.getBoardValue(succ);
                    if (!this.options.contains("noweight")) {
                        var weight = 1 + succ.getNumCells() / (succ.height * succ.width);
                        h /= weight;
                    }
                    var node = new Node(succ, currNode, g, h);

                    this.openSet.remove(alreadyOpen);
                    this.openSet.push(node);
                    this.openHashSet[succ] = node;
                }
            }
            return false;
        } else {
            return true;
        }
    };
}

BFS.prototype = Object.create(Solver.prototype);
BFS.prototype.constructor = BFS;
