var Heuristic = {};

Heuristic.getBoardValue = function(board) {
    var islands = board.getIslands();
    var smallIslands = 0;
    var clickableIslands = 0;
    for (var i = 0; i < islands.length; ++i) {
        if (islands[i].length >= 2) ++clickableIslands;
        else ++smallIslands;
    }
    
    var maxClicks = clickableIslands + Math.floor(smallIslands/2);
    
    /*console.log("Num islands: "+islands.length);
    console.log("Clickable islands: "+clickableIslands);
    console.log("Small islands: "+smallIslands);
    console.log("Max clicks: "+maxClicks);
    console.log(islands);*/
    
    return maxClicks;
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
    startNode.f = 0;
    openSet.push(startNode);


    while (openSet.length > 0) {
        var currNode = openSet[0];
        for (var i = 1; i < openSet.length; ++i) {
            if (openSet[i].f < currNode.f) currNode = openSet[i];
        }

        if (currNode.value <= goal) return makePath(currNode);

        openSet.splice(openSet.indexOf(currNode), 1);
        closedSet.push(currNode);

        // Generate successors
        var successors = [];
        var tmp = currNode.b.getSuccessors();
        for (var i = 0; i < tmp.length; ++i) {
            var n = new Node(tmp[i]);
            n.parent = currNode;
            n.g = currNode.g + 1; // It's a successor so 1 click away
            n.h = n.value - goal;
            n.f = n.g+n.h;
            successors.push(n);
        }
        // ...

        for (var i = 0; i < successors.length; ++i) {
            var succ = successors[i];
            var closed = false;
            for (var k = 0; k < closedSet.length; ++k) {
                if (succ.b.board == closedSet[k].b.board) {
                    closed = true;
                    break;
                }
            }

            if (!closed) {
                var open = false;
                for (var k = 0; k < openSet.length; ++k) {
                    if (succ.b.board == openSet[k].b.board) {
                        open = true;
                        if (succ.g < openSet[k].g) {
                            openSet[k] = succ;
                        }
                        break;
                    }
                }
                if (!open) {
                    openSet.push(succ);
                }
            }
        }
    }
    throw "Path not found";
}

function astar_iter(goal, openSet, closedSet) {
    setTimeout(function () {
        if (openSet.length > 0) {
            var currNode = openSet[0];
            for (var i = 1; i < openSet.length; ++i) {
                if (openSet[i].f < currNode.f) currNode = openSet[i];
            }

            if (currNode.value <= goal) return makePath(currNode);

            openSet.splice(openSet.indexOf(currNode), 1);
            closedSet.push(currNode);

            game.hopeless.board = currNode.b;
            game.render();
            console.log(currNode.value);

            // Generate successors
            var successors = [];
            var tmp = currNode.b.getSuccessors();
            for (var i = 0; i < tmp.length; ++i) {
                var n = new Node(tmp[i]);
                n.parent = currNode;
                n.g = currNode.g + 1; // It's a successor so 1 click away
                n.h = n.value - goal;
                n.f = n.g+n.h;
                successors.push(n);
            }
            // ...

            for (var i = 0; i < successors.length; ++i) {
                var succ = successors[i];
                var closed = false;
                for (var k = 0; k < closedSet.length; ++k) {
                    if (succ.b.board == closedSet[k].b.board) {
                        closed = true;
                        break;
                    }
                }

                if (!closed) {
                    var open = false;
                    for (var k = 0; k < openSet.length; ++k) {
                        if (succ.b.board == openSet[k].b.board) {
                            open = true;
                            if (succ.g < openSet[k].g) {
                                openSet[k] = succ;
                            }
                            break;
                        }
                    }
                    if (!open) {
                        openSet.push(succ);
                    }
                }
            }
            astar_iter(goal, openSet, closedSet);
        }
    }, 500);
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