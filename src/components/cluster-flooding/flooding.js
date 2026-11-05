// Setup some constants
export const PAUSED = 'paused';
export const PLAYING = 'playing';
export const DONE = 'done';

const UP = 'up';
const DOWN = 'down';
const LEFT = 'left';
const RIGHT = 'right';

/**
 * Return a random between 0 and max
 * @param max
 * @returns {number}
 */
function getRandom(max) {
  return Math.floor(Math.random() * max);
}

/**
 * Create the algorithm around a state object, which also drives the visualisation.
 * @param app The state: settings (width, height, labels, wait, searchMode) and all counters
 * @returns The controls: generate, play, pause and step
 */
export function createFlooding(app) {
  let global_queue = [];
  let local_queue = [];
  let timer = null;

  /**
   * Fill the matrix with random labels and reset everything else.
   */
  function generate() {
    clearTimeout(timer);
    global_queue = [];
    local_queue = [];
    app.matrix = Array.from({ length: app.height }, (_, row) =>
      Array.from({ length: app.width }, (_, col) => ({
        label: getRandom(app.labels),
        cluster: -1,
        global_queue: false,
        local_queue: false,
        row,
        col,
      })),
    );
    app.status = PAUSED;
    app.clusters = 0;
    app.steps = 0;
    app.lookups = 0;
    app.comparisons = 0;
    app.global_queue_size = 0;
    app.local_queue_size = 0;
    app.max_global_queue_size = 0;
    app.max_local_queue_size = 0;
    app.current_global = null;
    app.current_local = null;
  }

  /**
   * Keep taking steps until paused or done.
   */
  function play() {
    if (app.status !== PAUSED) return;
    app.status = PLAYING;
    tick();
  }

  function tick() {
    step();
    if (app.status === PLAYING) {
      timer = setTimeout(tick, app.wait);
    }
  }

  function pause() {
    clearTimeout(timer);
    if (app.status === PLAYING) app.status = PAUSED;
  }

  /**
   * Take a single step: the local queue goes first, so a cluster is completely flooded
   * before the global queue gets to start the next one.
   */
  function step() {
    if (app.status === DONE) return;
    // Select a random starting point
    if (app.steps === 0) {
      const start = app.matrix[getRandom(app.matrix.length)][getRandom(app.matrix[0].length)];
      start.global_queue = true;
      global_queue.push(start);
    }
    // Every neighbour of a clustered cell is either clustered or queued, so with
    // empty queues there is nothing left to discover.
    if (global_queue.length === 0 && local_queue.length === 0) {
      clearTimeout(timer);
      app.status = DONE;
      app.current_global = null;
      app.current_local = null;
      return;
    }
    if (local_queue.length > 0) {
      evaluateLocalCell();
    } else {
      evaluateGlobalCell();
    }
    app.steps = app.steps + 1;
    updateQueueSizes();
  }

  /**
   * The actual body of the algorithm.
   * Evaluates the next global cell, and labels it if needed, then discovers the adjacent cells.
   */
  function evaluateGlobalCell() {
    const cell = app.searchMode === 'breadth' ? global_queue.shift() : global_queue.pop();
    app.current_global = cell;
    app.current_local = null;
    cell.global_queue = false;
    if (!isClustered(cell)) {
      // Oh it has no label!
      app.clusters = app.clusters + 1; // No label! So we found a new cluster
      cell.cluster = app.clusters; // Label this for the current cluster
      discoverNeighbours(cell); // Add the adjacent fields to the corresponding queue
    }
  }

  /**
   * Evaluate the next local cell to see if more flooding is needed.
   */
  function evaluateLocalCell() {
    const cell = local_queue.pop();
    app.current_local = cell;
    cell.local_queue = false;
    cell.cluster = app.clusters; // Label this for the current cluster
    discoverNeighbours(cell); // Add the adjacent fields to the corresponding queue, again
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
    discoverAdjacentDirection(cell.row < app.matrix.length - 1, cell, DOWN);
    discoverAdjacentDirection(cell.col > 0, cell, LEFT);
    discoverAdjacentDirection(cell.col < app.matrix[0].length - 1, cell, RIGHT);
  }

  /**
   * Helper function
   * 1. Look if we can go in a direction
   * 2. See if it labeled in that direction
   * 3. See if it had the same value as the current cell
   * 3. TRUE: Add the cell in that direction to the local queue
   * 3. FALSE: Add the cell in that direction to the cluster queue
   * @param inBounds Check for boundary conditions
   * @param cell The current cell
   * @param direction The direction
   */
  function discoverAdjacentDirection(inBounds, cell, direction) {
    if (!inBounds) return;
    const nextCell = getDirection(cell, direction);
    if (!isClustered(nextCell)) {
      // evaluate if the next cell has to be queued
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
    let row = cell.row;
    let col = cell.col;
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
        throw Error('Illegal direction');
    }
    app.lookups = app.lookups + 1;
    return app.matrix[row][col];
  }

  return { generate, play, pause, step };
}
