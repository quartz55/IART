var Heuristic = {};

Heuristic.getBoardValue = function(board) {
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

        if (can_click == stats.islands[i].length == 0)
            tmp_sum += can_click;
        else if (can_click == stats.islands[i].length)
            tmp_sum += can_click / 2;
        else tmp_sum += (can_click / 2 + non_clickable / 2) / (num_colors / 2);
    }
    h += tmp_sum;

    return h;
};

function Node(board, g, h, parent) {
    g = g || 0;
    h = h || 0;
    this.b = board;
    this.g = g;
    this.h = h;
    this.f = g + h;
    this.parent = parent;
    this.value = Heuristic.getBoardValue(board);

    this.toString = function() {
        return this.b.toString();
    }
}

function astar(start, goal) {
    var openSet = new BinaryHeap(function(node) {
        return node.f + node.h;
    });
    var closedSet = new hashSet();

    var startNode = new Node(start);
    startNode.h = startNode.value;
    startNode.f = startNode.g + startNode.h;
    openSet.push(startNode);

    while (openSet.size() > 0) {
        var currNode = openSet.pop();

        if (currNode.b.getNumCells() <= goal) {
            console.log("Branches checked: " + closedSet.values().length);
            var path = makePath(currNode);
            return path;
        }

        closedSet.add(currNode);

        // Generate successors
        var successors = [];
        var tmp = currNode.b.getSuccessors();
        for (var i = 0; i < tmp.length; ++i) {
            var n = new Node(tmp[i]);
            n.parent = currNode;
            n.g = currNode.g + 1;
            n.h = n.value;

            var weight = 1 + n.b.getNumCells() / (n.b.height * n.b.width);
            n.f = n.g + n.h * weight;
            if (n.value > 9999) continue;
            successors.push(n);
        }
        // ...

        for (var i = 0; i < successors.length; ++i) {
            var succ = successors[i];
            var isClosed = closedSet.contains(succ);

            if (!isClosed) {
                var isOpen = false;
                for (var k = 0; k < openSet.size(); ++k) {
                    if (succ.b.equals(openSet.content[k].b)) {
                        console.info("+++++++");
                        isOpen = true;
                        if (succ.g < openSet.content[k].g) {
                            console.info("########");
                            openSet.remove(openSet.content[k])
                            openSet.push(succ);
                        }
                        break;
                    }
                }
                if (!isOpen) {
                    openSet.push(succ);
                }
            } else console.info("-------");
        }
        // console.log("Curr F: " + currNode.f + " = " + currNode.g + " + " + currNode.h);
    }
    console.log("Branches checked: " + closedSet.count());
    return [];
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
