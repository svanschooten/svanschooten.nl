// Setup some constants
const UP = "up";
const DOWN = "down";
const LEFT = "left";
const RIGHT = "right";

// Setup some global stuff so we don't have the hassle of updating queues and stuff
let global_queue = [],
    local_queue = [];

/**
 * The actual body of the algorithm.
 * Evaluates the next global cell, and labels it if needed, then discovers the adjacent cells.
 */
function evaluateGlobalCell() {
    if (app.status !== PLAYING) return;
    let cell = app.searchMode === "breadth" ? global_queue.shift() : global_queue.pop();
    setCurrentGlobalCell(cell);
    cell.global_queue = false;
    if (!isClustered(cell)) { // Oh it has no label!
        app.clusters = app.clusters + 1; // No label! So we found a new cluster
        cell.cluster = app.clusters; // Label this for the current cluster
        discoverNeighbours(cell); // Add the adjacent fields to the corresponding queue
    }
    updateQueueSizes();

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
    updateQueueSizes();

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
    app.current_local_col = -1;
    app.current_local_row = -1;
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
    updateQueueSizes();
}

/**
 * Helper function to update the queue sizes
 */
function updateQueueSizes() {
    app.global_queue_size = global_queue.length;
    app.local_queue_size = local_queue.length;
    app.max_global_queue_size = Math.max(app.max_global_queue_size, app.global_queue_size);
    app.max_local_queue_size = Math.max(app.max_local_queue_size, app.local_queue_size);
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
