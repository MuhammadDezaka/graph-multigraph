function generateGraph() {
    const inputText = document.getElementById("edgesInput").value.trim();
    const edgesInput = inputText.split("\n");

    const edges = [];
    const edgeCount = {};
    let hasLoops = false;

    // Parsing input edges dan memeriksa sisi berulang
    edgesInput.forEach(line => {
        const nodes = line.split("-");
        if (nodes.length === 2) {
            const edgeKey = [nodes[0], nodes[1]].sort().join("-");
            edges.push({ from: nodes[0], to: nodes[1] });

            if (nodes[0] === nodes[1]) {
                hasLoops = true;
            }
            if (!edgeCount[edgeKey]) {
                edgeCount[edgeKey] = 1;
            } else {
                edgeCount[edgeKey]++;
            }
        }
    });

    const hasDuplicates = Object.values(edgeCount).some(count => count > 1);

    // Gambar Graph Sederhana
    drawGraph(edges, "simpleGraph", false);

    // Gambar Multigraph (hanya jika ada sisi berulang)
    if (hasDuplicates|| hasLoops) {
        drawGraph(edges, "multiGraph", true, edgeCount);
    } else {
        const multiGraphContainer = document.getElementById("multiGraph");
        multiGraphContainer.innerHTML = "<p>Tidak ada sisi berulang. Multigraph tidak dapat ditampilkan.</p>";
    }

    generateAnalysis(edges, edgeCount, hasDuplicates, hasLoops);
}

function drawGraph(edges, containerId, isMultiGraph, edgeCount = {}) {
    const container = document.getElementById(containerId);
    const canvas = document.createElement("canvas");
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    container.innerHTML = ""; // Clear existing content
    container.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    const nodes = extractNodes(edges);

    const nodePositions = calculateNodePositions(nodes, canvas);

    // Gambar edges
    const seenEdges = {};
    edges.forEach(edge => {
        const fromPos = nodePositions[edge.from];
        const toPos = nodePositions[edge.to];
        const edgeKey = [edge.from, edge.to].sort().join("-");

        if (isMultiGraph) {
            if (edge.from === edge.to) {
                drawLoop(ctx, fromPos); // Gambar loop
            } else if (seenEdges[edgeKey]) {
                const rad = seenEdges[edgeKey] + 0.2; // Menambah radius kurva
                drawCurvedEdge(ctx, fromPos, toPos, rad);
                seenEdges[edgeKey] = rad;
            } else {
                drawStraightEdge(ctx, fromPos, toPos);
                seenEdges[edgeKey] = 0.2; // Awal radius kurva
            }
        } else {
            drawStraightEdge(ctx, fromPos, toPos);
        }
    });

    // Gambar nodes
    nodes.forEach(node => {
        drawNode(ctx, nodePositions[node], node);
    });
}

function extractNodes(edges) {
    const nodesSet = new Set();
    edges.forEach(edge => {
        nodesSet.add(edge.from);
        nodesSet.add(edge.to);
    });
    return Array.from(nodesSet);
}

function calculateNodePositions(nodes, canvas) {
    const positions = {};
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 50; // Radius lingkaran node

    nodes.forEach((node, index) => {
        const angle = (index / nodes.length) * 2 * Math.PI;
        positions[node] = {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle),
        };
    });

    return positions;
}

function drawNode(ctx, position, label) {
    ctx.beginPath();
    ctx.arc(position.x, position.y, 20, 0, 2 * Math.PI); // Node berukuran 20px
    ctx.fillStyle = "#ffeb3b";
    ctx.fill();
    ctx.strokeStyle = "#333";
    ctx.stroke();
    ctx.closePath();

    // Tampilkan label
    ctx.fillStyle = "#000";
    ctx.font = "14px Montserrat";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, position.x, position.y);
}

function drawStraightEdge(ctx, from, to) {
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.strokeStyle = "#333";
    ctx.stroke();
    ctx.closePath();
}

function drawCurvedEdge(ctx, from, to, rad) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Offset untuk menggambar kurva
    const offset = rad * distance / 2;
    const angle = Math.atan2(dy, dx) + Math.PI / 2;

    const midX = (from.x + to.x) / 2 + offset * Math.cos(angle);
    const midY = (from.y + to.y) / 2 + offset * Math.sin(angle);

    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.quadraticCurveTo(midX, midY, to.x, to.y);
    ctx.strokeStyle = "#333";
    ctx.stroke();
    ctx.closePath();
}

function drawLoop(ctx, position) {
    ctx.beginPath();
    ctx.arc(position.x, position.y - 30, 20, 0, 2 * Math.PI);
    ctx.strokeStyle = "#333";
    ctx.stroke();
    ctx.closePath();
}


function generateAnalysis(edges, edgeCount, hasDuplicates,hasLoops) {
    const graphAnalysis = [];
    const multigraphAnalysis = [];

    // Analisis Graph
    graphAnalysis.push(`Jumlah simpul: ${new Set(edges.flatMap(edge => [edge.from, edge.to])).size}.`);
    graphAnalysis.push(`Jumlah sisi: ${edges.length}.`);

    if (hasLoops) {
        graphAnalysis.push("Graf ini memiliki loop (contoh: simpul dengan sisi yang kembali ke dirinya sendiri).");
    } else {
        graphAnalysis.push("Graf ini tidak memiliki loop.");
    }
    // Analisis Multigraph
    if (hasDuplicates) {
        Object.entries(edgeCount).forEach(([edge, count]) => {
            if (count > 1) {
                multigraphAnalysis.push(`Sisi "${edge}" muncul sebanyak ${count} kali.`);
            }
        });
    } else {
        multigraphAnalysis.push("Tidak ada sisi yang berulang atau loop pada grafik ini.");
    }

    // Tampilkan Analisis
    document.getElementById("analysisGraph").textContent = graphAnalysis.join(" ");
    document.getElementById("analysisMultigraph").textContent = multigraphAnalysis.join(" ");
}

function generateAdjacencyMatrix() {
    const inputText = document.getElementById("edgesInput").value.trim();
    const edgesInput = inputText.split("\n");

    // Mengumpulkan semua simpul unik
    const vertices = new Set();
    const edges = [];
    edgesInput.forEach(line => {
        const nodes = line.split("-");
        if (nodes.length === 2) {
            vertices.add(nodes[0]);
            vertices.add(nodes[1]);
            edges.push([nodes[0], nodes[1]]);
        }
    });

    const verticesArray = Array.from(vertices);
    const vertexIndex = {};
    verticesArray.forEach((vertex, index) => (vertexIndex[vertex] = index));

    // Membuat matriks adjacency untuk graph sederhana
    const simpleMatrix = Array(verticesArray.length)
        .fill(null)
        .map(() => Array(verticesArray.length).fill(0));

    // Membuat matriks adjacency untuk multigraph
    const multiMatrix = Array(verticesArray.length)
        .fill(null)
        .map(() => Array(verticesArray.length).fill(0));

    edges.forEach(([from, to]) => {
        const i = vertexIndex[from];
        const j = vertexIndex[to];
        if (simpleMatrix[i][j] === 0) {
            simpleMatrix[i][j] = 1; // Tanda bahwa sisi hanya dihitung satu kali
            simpleMatrix[j][i] = 1; // Karena graph tidak berarah
        }
        multiMatrix[i][j] += 1; // Semua sisi dihitung
        multiMatrix[j][i] += 1; // Simetrik karena tidak berarah
    });

    // Menampilkan matriks adjacency
    displayAdjacencyMatrix(simpleMatrix, verticesArray, "simpleMatrix");
    displayAdjacencyMatrix(multiMatrix, verticesArray, "multiMatrix");

    // Menampilkan analisis matriks adjacency
    analyzeAdjacencyMatrix(simpleMatrix, verticesArray, edges, "simpleMatrixAnalysis", false);
    analyzeAdjacencyMatrix(multiMatrix, verticesArray, edges, "multiMatrixAnalysis", true);
}

function displayAdjacencyMatrix(matrix, vertices, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = ""; // Clear sebelumnya

    const table = document.createElement("table");
    table.className = "adjacency-matrix";

    // Header baris dan kolom
    const headerRow = document.createElement("tr");
    headerRow.appendChild(document.createElement("th")); // Kosong untuk pojok kiri atas
    vertices.forEach(vertex => {
        const th = document.createElement("th");
        th.textContent = vertex;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Isi matriks
    matrix.forEach((row, i) => {
        const tr = document.createElement("tr");
        const rowHeader = document.createElement("th");
        rowHeader.textContent = vertices[i];
        tr.appendChild(rowHeader);

        row.forEach(value => {
            const td = document.createElement("td");
            td.textContent = value;
            tr.appendChild(td);
        });

        table.appendChild(tr);
    });

    container.appendChild(table);
}

function analyzeAdjacencyMatrix(matrix, vertices, edges, analysisContainerId, isMultigraph) {
    const analysis = [];
    const matrixType = isMultigraph ? "multigraph" : "graph sederhana";

    analysis.push(`Matriks adjacency ini berukuran ${matrix.length}x${matrix.length}, sesuai dengan jumlah simpul (${matrix.length}).`);
    analysis.push(`Matriks ini simetrik karena graph tidak berarah.`);
    
    if (isMultigraph) {
        analysis.push("Pada matriks ini, setiap sisi diinput dihitung sesuai jumlah kemunculannya, sehingga bisa memiliki nilai lebih dari 1.");
    } else {
        analysis.push("Pada matriks ini, setiap sisi hanya dihitung sekali, tanpa memperhatikan jumlah kemunculannya.");
    }

    const matrixAnalysisContainer = document.getElementById(analysisContainerId);
    matrixAnalysisContainer.innerHTML = `<p>${analysis.join(" ")}</p>`;
}
