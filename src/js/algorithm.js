var Heuristic = {};

Heuristic.getBoardValue = function(board) {
    var islands = board.getIslands();
    var smallIslands = 0;
    var clickableIslands = 0;
    for (var i = 0; i < islands.length; ++i) {
        if (islands[i].length >= 2) ++clickableIslands;
        else ++smallIslands;
    }
    
    var maxClicks = clickableIslands + Math.ceil(smallIslands/2);
    
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
        //console.log(openSet.length);
        var currNode = openSet[0];
        for (var i = 1; i < openSet.length; ++i) {
            if (openSet[i].f < currNode.f) currNode = openSet[i];
        }

        if (currNode.value <= goal) return makePath(currNode);

        openSet.splice(openSet.indexOf(currNode), 1);
        closedSet.push(currNode);
        //console.log(closedSet.length);

        // Generate successors
        var successors = [];
        var tmp = currNode.b.getSuccessors();
        for (var i = 0; i < tmp.length; ++i) {
            var n = new Node(tmp[i]);
            n.parent = currNode;
            n.g = currNode.g + 1; // It's a successor so 1 click away
            //n.h = n.value - goal;
            n.h = 0;
            n.f = n.g+n.h;
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
        /*console.log(successors.length + " successors");
        console.log("Opened: "+opened+"\n" +
            "Open: "+open+"\n" +
            "Closed: "+closed+"\n" +
            "Swapped: "+swapped);
            */
    }
    throw "Path not found";
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
