// Setup some constants
const PAUSED = "paused";
const PLAYING = "playing";
const DONE = "done";

// Vue app instance to handle rendering
const app = new Vue({
    el: '#app',
    data: {
        matrix: [],
        wait: 100,
        width: 10,
        height: 10,
        labels: 6,
        colorOpacity: 100,
        clusters: 0,
        status: PAUSED,
        lookups: 0,
        comparisons: 0,
        steps: 0,
        colorScheme: 'split',
        searchMode: "breadth",
        global_queue_size: 0,
        local_queue_size: 0,
        max_global_queue_size: 0,
        max_local_queue_size: 0,
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
                    const label = getRandom(app.labels);
                    newRow.push({
                        label: label,
                        cluster: -1,
                        global_queue: false,
                        local_queue: false,
                        row: i,
                        col: j,
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
            app.max_global_queue_size = 0;
            app.max_local_queue_size = 0;
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
        isCurrent: (cell) => {
            if (cell.row === app.current_global_row && cell.col === app.current_global_col) {
                return 'currentGlobal';
            } else if (cell.row === app.current_local_row && cell.col === app.current_local_col) {
                return 'currentLocal';
            }
        },
        getColor: (cell, topLabel) => {
            function labelColor() {
                return 'hsla(' + Math.round((360 / app.labels) * cell.label) + ', 100%, 50%, ' + app.colorOpacity + '%)';
            }
            function clusterColor() {
                if (cell.cluster === -1) return 'white';
                return 'hsla(' + Math.round((360 / app.clusters) * cell.cluster) + ', 100%, 50%, ' + app.colorOpacity + '%)';
            }
            switch (app.colorScheme) {
                case 'none':
                    return 'white';
                case 'cluster':
                    return clusterColor();
                case 'label':
                    return labelColor();
                case 'split':
                    return topLabel ? labelColor() : clusterColor();
                default:
                    return 'white';
            }
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
            app.steps = app.steps + 1;
            updateQueueSizes();
        }
    }
});
app.generate();
