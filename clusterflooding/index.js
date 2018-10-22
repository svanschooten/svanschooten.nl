// Setup some constants
const UP = "up";
const DOWN = "down";
const LEFT = "left";
const RIGHT = "right";
const PAUSED = "paused";
const PLAYING = "playing";
const DONE = "done";

// Setup some global stuff so we don't have the hassle of updating queues and stuff
let global_queue = [],
    local_queue = [];

// Vue app instance to handle rendering
const app = new Vue({
    el: '#app',
    data: {
        matrix: [],
        wait: 300,
        width: 10,
        height: 10,
        labels: 6,
        clusters: 0,
        status: PAUSED,
        lookups: 0,
        comparisons: 0,
        steps: 0,
        global_queue_size: 0,
        local_queue_size: 0,
        current_global_col: -1,
        current_global_row: -1,
        current_local_col: -1,
        current_local_row: -1,
    },
    methods: {
        generate: () => {
            app.status = PAUSED;
            global_queue = [];
            local_queue = [];
            let newMatrix = [];
            for (let i = 0; i < app.height; i++) {
                let newRow = [];
                for (let j = 0; j < app.width; j++) {
                    newRow.push({
                        label: getRandom(app.labels),
                        cluster: -1,
                        global_queue: false,
                        local_queue: false,
                        row: i,
                        col: j
                    });
                }
                newMatrix.push(newRow);
            }
            app.matrix = newMatrix;
            app.lookups = 0;
            app.comparisons = 0;
            app.clusters = 0;
            app.global_queue_size = 0;
            app.local_queue_size = 0;
            app.steps = 0;
            app.status = PAUSED;
            app.current_global_col = -1;
            app.current_global_row = -1;
            app.current_local_col = -1;
            app.current_local_row = -1;
        },
        play: () => {
            app.status = PLAYING;
            // Select a random starting point
            if (global_queue.length === 0) {
                global_queue.push(app.matrix[getRandom(app.height)][getRandom(app.width)]);
            }
            app.step();
        },
        pause: () => {
            app.status = PAUSED;
        },
        isCurrentGlobal: (cell) => {
            return cell.row === app.current_global_row && cell.col === app.current_global_col;
        },
        isCurrentLocal: (cell) => {
            return cell.row === app.current_local_row && cell.col === app.current_local_col;
        },
        step: () => {
            // While we still have non-local flooding to do
            if (global_queue.length === 0 && local_queue.length === 0) {
                // Random sample to see if not completed running yet
                if (app.matrix[getRandom(app.height)][getRandom(app.width)].cluster === -1) {
                    let cell = app.matrix[getRandom(app.height)][getRandom(app.width)];
                    cell.global_queue = true;
                    global_queue.push(cell);
                } else {
                    app.status = DONE;
                    return;
                }
            }
            if (local_queue.length > 0) {
                evaluateLocalCell();
            } else {
                evaluateGlobalCell();
            }
            app.global_queue_size = global_queue.length;
            app.local_queue_size = local_queue.length;
        }
    }
});
app.generate();

/**
 * The actual body of the algorithm.
 * Evaluates the next global cell, and labels it if needed, then discovers the adjacent cells.
 */
function evaluateGlobalCell() {
    if (app.status !== PLAYING) return;
    let cell = global_queue.pop();
    setCurrentGlobalCell(cell);
    app.steps = app.steps + 1;
    cell.global_queue = false;
    if (!isClustered(cell)) { // Oh it has no label!
        app.clusters = app.clusters + 1; // No label! So we found a new cluster
        cell.cluster = app.clusters; // Label this for the current cluster
        discoverNeighbours(cell); // Add the adjacent fields to the corresponding queue
        app.local_queue_size = local_queue.length;
    }

    setTimeout(() => {
        app.step();
    }, app.wait);
}

/**
 * Evaluate the next local cell to see if more flooding is needed.
 */
function evaluateLocalCell() {
    if (app.status !== PLAYING) return;
    let cell = local_queue.pop();
    setCurrentLocalCell(cell);
    cell.local_queue = false;
    cell.cluster = app.clusters; // Label this for the current cluster
    discoverNeighbours(cell); // Add the adjacent fields to the corresponding queue, again
    app.local_queue_size = local_queue.length;

    setTimeout(() => {
        app.step();
    }, app.wait);
}

/**
 * Return a random between 0 and max
 * @param max
 * @returns {number}
 */
function getRandom(max) {
    return Math.floor(Math.random() * max);
}

/**
 * Update the current global cell indices for visualisation
 * @param cell
 */
function setCurrentGlobalCell(cell) {
    app.current_global_col = cell.col;
    app.current_global_row = cell.row;
}

/**
 * Update the current local cell indices for visualisation
 * @param cell
 */
function setCurrentLocalCell(cell) {
    app.current_local_col = cell.col;
    app.current_local_row = cell.row;
}

/**
 * Verify if the field is labeled (-1)
 * @param cell The cell
 * @returns {boolean} Whether the cell is labeled
 */
function isClustered(cell) {
    return cell.cluster !== -1;
}

/**
 * Discover the adjacent tiles in all four orthogonal directions, see discoverAdjacentDirection
 * @param cell The current cell
 */
function discoverNeighbours(cell) {
    discoverAdjacentDirection(cell.row > 0, cell, UP);
    discoverAdjacentDirection(cell.row < app.height - 1, cell, DOWN);
    discoverAdjacentDirection(cell.col > 0, cell, LEFT);
    discoverAdjacentDirection(cell.col < app.width - 1, cell, RIGHT);
}

/**
 * Helper function
 * 1. Look if we can go in a direction
 * 2. See if it labeled in that direction
 * 3. See if it had the same value as the current cell
 * 3. TRUE: Add the cell in that direction to the local queue
 * 3. FALSE: Add the cell in that direction to the cluster queue
 * @param eval Check for boundary conditions
 * @param cell The current cell
 * @param direction The direction
 */
function discoverAdjacentDirection(eval, cell, direction) {
    if (!eval) return;
    let nextCell = getDirection(cell, direction);
    if (!isClustered(nextCell)) { // evaluate if the next cell has to be queued
        if (isConnected(cell, nextCell) && !nextCell.local_queue) {
            nextCell.local_queue = true;
            local_queue.push(nextCell);
        } else if (!nextCell.global_queue) {
            nextCell.global_queue = true;
            global_queue.push(nextCell);
        }
    }
    app.global_queue_size = global_queue.length;
    app.local_queue_size = local_queue.length;
}

/**
 * Helper function to see if a cell in a direction has the same value as the current one
 * @param cell The current cell
 * @param nextCell The cell to compare against
 * @returns {boolean} If the field in the direction has the same value
 */
function isConnected(cell, nextCell) {
    app.comparisons = app.comparisons + 1;
    return nextCell.label === cell.label;
}

/**
 * Get the cell in a certain direction
 * @param cell The current cell
 * @param direction The direction
 * @returns object The cell
 */
function getDirection(cell, direction) {
    let row = cell.row,
        col = cell.col;
    switch (direction) {
        case UP:
            row = row - 1;
            break;
        case DOWN:
            row = row + 1;
            break;
        case LEFT:
            col = col - 1;
            break;
        case RIGHT:
            col = col + 1;
            break;
        default:
            throw Error("Illegal direction");
    }
    app.lookups = app.lookups + 1;
    return app.matrix[row][col];
}
