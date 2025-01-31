var curr;
var started = false;

var nuxtdis = false;
var refreshIntervalId = null;

var isObservation = false; 

var visit = new PriorityQueue();
var explored = [];

var SN = null;
var EN = null;

function reconstructPath() {
    let path = [];
    let path_edges = [];
    let c = curr;
    while (c != null) {
        path.push(c);
        if(parent[c] != null) {
            for(const neighbour of edges[parent[c]]) {
                if(neighbour[0] == c) {
                    path_edges.push(neighbour[1]);
                    break;
                }
            }
        }
        c = parent[c];
    }
    return [path.reverse(), path_edges.reverse()];
}


function ALG_STOP() {
    console.log("ALG_STOP");
    started = false;
    path_data = reconstructPath();
    path = path_data[0];
    path_edges = path_data[1];
    curr = null;
    visit.clear();
    document.getElementById("nuxt").disabled = false;
    document.getElementById("startucs").disabled = false;
    document.getElementById("disablewarning").style.display="none";
    if(!NoQuestion)
        addEventListeners();
    // document.getElementById("nuxt").disabled = true;
    nuxtdis = false;
    clearInterval(refreshIntervalId);
}

function setHeuristics() {
    for (n = 0; n < nodes.length; n++) {
        console.log("End node coordinates", nodes[EN][0], nodes[EN][1])
        if(n != EN && exist[n]) {
            // n node coordinates
            console.log("Node", n,"coordinates", nodes[n][0], nodes[n][1]);
            d = dist(nodes[n][0], nodes[n][1], nodes[EN][0], nodes[EN][1])/8;
            d = Math.ceil(d);
            console.log("distance from ", n, "to", EN, "is", d);
            heuristics[n] = d;
        }
    }
    heuristics[EN] = 0;
    renderHeuristics();
}

function renderHeuristics() {
    const heuristicsTable = document.getElementById("heuristics_table");
    heuristicsTable.innerHTML = "";

    // Iterate through all nodes and print the heuristics in heuristics_table ul
    for (n = 0; n < nodes.length; n++) {
        if (heuristics[n] != null) {
        const listItem = document.createElement("li");
        listItem.innerHTML = "Node " + n + ": " + heuristics[n];

        heuristicsTable.appendChild(listItem);
        }
    }
}

function UCS() {
    if(!started) {return;}
    if(!edgeAdded) {return;}
    if(isQuestion) {return;}

    if(!visit.empty()) {
        const { priority: currentCost, element: c} = visit.get();
        if (!exist[c]|| visited.includes(c))
            return;

        console.log("currentCost:",currentCost, ", node:",c);
        curr = c;
        path_data = reconstructPath();
        path = path_data[0];
        path_edges = path_data[1];
        var path_string = path.join(" -> ");
        var path_edges_string = path_edges.join("+");

        // Get reference to the <ul> element
        const pathHistoryList = document.getElementById("path_history_list");

        // Get the number of existing list items
        const numItems = pathHistoryList.getElementsByTagName("li").length + 1;

        // Create a new <li> element with the appropriate number
        const listItem = document.createElement("li");
        
        // iterate through the path and display g + h value of each node
        var path_string = "";
        for (var i = 0; i < path.length; i++) {
            path_string += path[i] + " -> ";
        }
        path_string = path_string.slice(0, -4);
        var path_edges_string = "";
        for (var i = 0; i < path_edges.length; i++) {
            path_edges_string += path_edges[i] + " + ";
        }
        path_edges_string = path_edges_string.slice(0, -3);
        var g = costSoFar[curr];
        var h = heuristics[curr];
        var f = g + h;
        listItem.innerHTML = "Step " + numItems + ": " + path_string + " (g=" + g + ", h=" + h + ", f=" + f + ", edges=" + path_edges_string + ")";

        // Append the <li> element to the <ul> element
        pathHistoryList.appendChild(listItem);


        trav_circle(parent[curr], curr);
        visited.push(curr);

        if (curr == EN) {
            ALG_STOP();
            return;
        }

        if (!NoQuestion && !visit.empty()) { // chance = 2/10
            var rand = Math.random();
            console.log(rand);
            if (rand < chance) {
                isQuestion = true;
                question();
            }
        }

        if (edges[curr].length == 0) {
            return UCS();
        }

        for (const neighbour of edges[curr]) {
            // const newCost = currentCost + neighbour[1];
            const tentative_gScore = costSoFar[curr] + neighbour[1];

            if(!exist[neighbour[0]]) continue;

            // if(!visited.includes(neighbour[0]) && (!(neighbour[0] in costSoFar) || newCost < costSoFar[neighbour[0]])) {
            //     costSoFar[neighbour[0]] = newCost;
            //     visit.put(newCost, neighbour[0]);
            // const newCost = currentCost + neighbour[1];
            if(!visited.includes(neighbour[0]) && (!(neighbour[0] in costSoFar) || tentative_gScore < costSoFar[neighbour[0]])) {
                costSoFar[neighbour[0]] = tentative_gScore;
                visit.put(tentative_gScore + heuristics[neighbour[0]], neighbour[0]);
                parent[neighbour[0]] = curr;
            }

        }
    }
    else {
        document.getElementById("goal_not_reached").style.display = "block";
        ALG_STOP();
    }
}