var Heuristic = {};

Heuristic.getBoardValue = function(board) {
    var stats = board.getStats();
    // console.log(stats);
    var colors = board.getColors();
    var clickable = board._getClickableIslands();
    if (clickable.length < 1 && colors > 0) return 99999;

    return colors.length;
};

function Node(board, g, h, parent) {
    g = g || 0;
    h = h || 0;
    this.b = board;
    this.g = g;
    this.h = h;
    this.f = g+h;
    this.parent = parent;
    this.value = Heuristic.getBoardValue(board);
}

function astar(start, goal) {
    var closedSet = [];
    var openSet = [];

    var startNode = new Node(start);
    startNode.h = startNode.value;
    startNode.f = startNode.g+startNode.h;
    openSet.push(startNode);

    var startingCells = start.getNumCells();


    while (openSet.length > 0) {
        var currNode = openSet[0];
        for (var i = 1; i < openSet.length; ++i) {
            if (openSet[i].f < currNode.f) currNode = openSet[i];
        }

        if (currNode.b.getNumCells() <= goal) {
            var path = makePath(currNode);
            return path;
        }

        var removed = openSet.length;
        openSet.splice(openSet.indexOf(currNode), 1);
        closedSet.push(currNode);

        // Generate successors
        var successors = [];
        var tmp = currNode.b.getSuccessors();
        for (var i = 0; i < tmp.length; ++i) {
            var n = new Node(tmp[i]);
            n.parent = currNode;
            n.g = currNode.g + 1;
            n.h = n.value;

            var weight = 1+n.b.getNumCells();
            // n.f = n.g+n.h;
            n.f = n.g+n.h*weight;
            if (n.value > 9999) continue;
            successors.push(n);
        }
        // ...

        var opened = 0; var closed = 0; var swapped = 0; var open = 0;
        for (var i = 0; i < successors.length; ++i) {
            var succ = successors[i];
            var isClosed = false;
            for (var k = 0; k < closedSet.length; ++k) {
                if (succ.b.equals(closedSet[k].b)) {
                    ++closed;
                    isClosed = true;
                    break;
                }
            }

            if (!isClosed) {
                var isOpen = false;
                for (var k = 0; k < openSet.length; ++k) {
                    if (succ.b.equals(openSet[k].b)) {
                        isOpen = true;
                        ++open;
                        if (succ.g < openSet[k].g) {
                            ++swapped;
                            openSet[k] = succ;
                        }
                        break;
                    }
                }
                if (!isOpen) {
                    ++opened;
                    openSet.push(succ);
                }
            }
        }
        console.log("Curr F: "+currNode.f+" = "+currNode.g+" + "+currNode.h);
        // console.log("Curr num of plays: "+currNode.b._getClickableIslands().length);
    }
    return [];
}

function Measure(fn, reps) {
    reps = reps || 1;
    var times = [];
    for (var i = 0; i < reps; ++i) {
        var time = new Date().getTime();
        this.ret = fn();
        times.push(new Date().getTime()-time);
    }
    var med = 0;
    for (var i = 0; i < times.length; ++i)
        med += times[i];
    med /= times.length;

    var min = Math.min.apply(null, times);
    var max = Math.max.apply(null, times);
    var desvio = Math.abs(max-min)/2;

    this.times = times;
    this.med = med;
    this.desvio = desvio;

    this.getTime = function() {
        return {med:this.med, desvio:this.desvio};
    };
    this.toString = function() {
        return ""+this.med+"ms+-"+this.desvio;
    };
}

function makePath(node) {
    var path = [node];
    var currNode = node;
    var parent = currNode.parent;
    while (parent !== undefined) {
        path.unshift(parent);
        currNode = parent;
        parent = currNode.parent;
    }
    return path;
}
