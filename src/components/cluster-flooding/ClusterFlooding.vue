<script setup>
import { computed, onMounted, reactive, watch } from 'vue';
import { createFlooding, PAUSED, PLAYING } from './flooding.js';

const state = reactive({
  width: 10,
  height: 10,
  labels: 6,
  wait: 100,
  searchMode: 'breadth',
  colorScheme: 'split',
  colorOpacity: 100,
  matrix: [],
  status: PAUSED,
  clusters: 0,
  steps: 0,
  lookups: 0,
  comparisons: 0,
  global_queue_size: 0,
  local_queue_size: 0,
  max_global_queue_size: 0,
  max_local_queue_size: 0,
  current_global: null,
  current_local: null,
});

const { generate, play, pause, step } = createFlooding(state);

onMounted(generate);
// A new size or label count needs a new grid.
watch(() => [state.width, state.height, state.labels], generate);

const gridStyle = computed(() => {
  const columns = state.matrix[0]?.length ?? state.width;
  const rows = state.matrix.length || state.height;
  // Size the cells by the longest side, so a tall grid does not grow off the page.
  return { '--columns': columns, width: `${(100 * columns) / Math.max(columns, rows)}%` };
});

const colorSchemes = [
  { value: 'split', label: 'Label and cluster' },
  { value: 'label', label: 'Label' },
  { value: 'cluster', label: 'Cluster' },
  { value: 'none', label: 'None' },
];

/** The background of one half of a cell, or null when that half stays uncoloured. */
function halfColor(cell, isLabelHalf) {
  const showLabel = state.colorScheme === 'label' || (state.colorScheme === 'split' && isLabelHalf);
  const showCluster =
    state.colorScheme === 'cluster' || (state.colorScheme === 'split' && !isLabelHalf);
  let hue = null;
  if (showLabel) {
    hue = (360 / state.labels) * cell.label;
  } else if (showCluster && cell.cluster !== -1) {
    hue = (360 / state.clusters) * cell.cluster;
  }
  return hue === null ? null : `hsl(${Math.round(hue)} 70% 68% / ${state.colorOpacity}%)`;
}

function halfStyle(cell, isLabelHalf) {
  const background = halfColor(cell, isLabelHalf);
  if (!background) return {};
  // Dark text only reads on a coloured background that is opaque enough.
  return { background, color: state.colorOpacity >= 50 ? '#17181a' : undefined };
}

function cellClass(cell) {
  return {
    'current-global': cell === state.current_global,
    'current-local': cell === state.current_local,
  };
}
</script>

<template>
  <div class="demo">
    <!-- The controls stay above the grid, so resizing the grid never moves them. -->
    <div class="sliders">
      <label>
        <span>Width <output>{{ state.width }}</output></span>
        <input v-model.number="state.width" type="range" min="2" max="20" />
      </label>
      <label>
        <span>Height <output>{{ state.height }}</output></span>
        <input v-model.number="state.height" type="range" min="2" max="20" />
      </label>
      <label>
        <span>Labels <output>{{ state.labels }}</output></span>
        <input v-model.number="state.labels" type="range" min="2" max="50" />
      </label>
      <label>
        <span>Step time <output>{{ state.wait }} ms</output></span>
        <input v-model.number="state.wait" type="range" min="10" max="500" />
      </label>
      <label>
        <span>Color opacity <output>{{ state.colorOpacity }}%</output></span>
        <input v-model.number="state.colorOpacity" type="range" min="0" max="100" />
      </label>
    </div>

    <div class="choices">
      <fieldset>
        <legend>Search</legend>
        <label class="choice">
          <input v-model="state.searchMode" type="radio" value="breadth" /> Breadth-first
        </label>
        <label class="choice">
          <input v-model="state.searchMode" type="radio" value="depth" /> Depth-first
        </label>
      </fieldset>
      <fieldset>
        <legend>Colors</legend>
        <label v-for="scheme in colorSchemes" class="choice">
          <input v-model="state.colorScheme" type="radio" :value="scheme.value" />
          {{ scheme.label }}
        </label>
      </fieldset>
    </div>

    <div class="buttons">
      <button type="button" :disabled="state.status !== PAUSED" @click="play">Play</button>
      <button type="button" :disabled="state.status !== PLAYING" @click="pause">Pause</button>
      <button type="button" :disabled="state.status !== PAUSED" @click="step">Step</button>
      <button type="button" @click="generate">Generate</button>
      <span class="status" aria-live="polite">{{ state.status }}</span>
    </div>

    <div class="grid" :style="gridStyle">
      <template v-for="row in state.matrix">
        <div v-for="cell in row" class="cell" :class="cellClass(cell)">
          <div class="half" :style="halfStyle(cell, true)">L {{ cell.label }}</div>
          <div class="half" :style="halfStyle(cell, false)">
            C {{ cell.cluster === -1 ? '' : cell.cluster }}
          </div>
          <span v-if="cell.global_queue" class="dot global"></span>
          <span v-if="cell.local_queue" class="dot local"></span>
        </div>
      </template>
    </div>

    <div class="panels">
      <dl class="panel stats">
        <div><dt>Clusters found</dt><dd>{{ state.clusters }}</dd></div>
        <div><dt>Steps</dt><dd>{{ state.steps }}</dd></div>
        <div><dt>Lookups</dt><dd>{{ state.lookups }}</dd></div>
        <div><dt>Comparisons</dt><dd>{{ state.comparisons }}</dd></div>
        <div>
          <dt>Global queue</dt>
          <dd>{{ state.global_queue_size }} (max {{ state.max_global_queue_size }})</dd>
        </div>
        <div>
          <dt>Local queue</dt>
          <dd>{{ state.local_queue_size }} (max {{ state.max_local_queue_size }})</dd>
        </div>
      </dl>

      <ul class="panel legend">
        <li><b>L</b> Cell label</li>
        <li><b>C</b> Cell cluster</li>
        <li><span class="dot global"></span> In global queue</li>
        <li><span class="dot local"></span> In local queue</li>
        <li><span class="swatch global"></span> Current cell from global queue</li>
        <li><span class="swatch local"></span> Current cell from local queue</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.demo {
  --local: #e8e6e1;
  margin-top: 2rem;
}

.grid {
  container-type: inline-size;
  display: grid;
  grid-template-columns: repeat(var(--columns), 1fr);
  gap: 2px;
}

.cell {
  position: relative;
  display: grid;
  grid-template-rows: 1fr 1fr;
  aspect-ratio: 1;
  background: var(--surface);
  /* Scale the text with the cell, so large grids still fit on small screens. */
  font-family: var(--mono);
  font-size: calc(100cqw / var(--columns) * 0.22);
  line-height: 1;
  text-align: center;
}

.half {
  display: grid;
  place-items: center;
  overflow: hidden;
  white-space: nowrap;
}

.current-global,
.current-local {
  z-index: 1;
  outline: 2px solid var(--accent);
  outline-offset: 0;
}

.current-local {
  outline-color: var(--local);
}

.dot {
  display: inline-block;
  width: 9px;
  height: 9px;
  border: 1px solid var(--bg);
  border-radius: 50%;
  background: var(--accent);
}

.dot.local {
  background: var(--local);
}

.cell .dot {
  position: absolute;
  top: 1px;
  left: 1px;
}

.cell .dot.local {
  left: auto;
  right: 1px;
}

.sliders {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
  gap: 0.75rem 1.5rem;
  font-size: 0.9375rem;
}

.sliders span {
  display: flex;
  justify-content: space-between;
}

.choices {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 2.5rem;
  margin-top: 1.25rem;
  font-size: 0.9375rem;
}

.buttons {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin: 1.5rem 0 1rem;
}

button {
  padding: 0.35rem 0.9rem;
  border: 1px solid var(--line);
  border-radius: 4px;
  background: transparent;
  color: var(--text);
  font: inherit;
  font-size: 0.9375rem;
  cursor: pointer;
  transition:
    color 0.15s,
    border-color 0.15s;
}

button:hover:not(:disabled) {
  border-color: var(--accent);
  color: var(--accent);
}

button:disabled {
  opacity: 0.45;
  cursor: default;
}

.status {
  margin-left: auto;
  color: var(--accent);
  font-family: var(--mono);
  font-size: 0.8125rem;
}

.panels {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem 2.5rem;
  margin-top: 2rem;
  font-size: 0.9375rem;
}

output,
dd {
  color: var(--muted);
  font-family: var(--mono);
  font-size: 0.8125rem;
}

input {
  accent-color: var(--accent);
}

input[type='range'] {
  display: block;
  width: 100%;
  margin: 0.25rem 0 0;
}

fieldset {
  margin: 0;
  padding: 0;
  border: 0;
}

legend {
  padding: 0;
  margin-bottom: 0.25rem;
}

.choice {
  display: inline-block;
  margin-right: 1rem;
  color: var(--muted);
}

.stats {
  margin: 0;
}

.stats div {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.3rem 0;
  border-top: 1px solid var(--line);
}

.stats dd {
  margin: 0;
}

.legend {
  margin: 0;
  padding: 0;
  list-style: none;
  color: var(--muted);
}

.legend li {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.15rem 0;
}

.legend b {
  width: 14px;
  color: var(--text);
  font-family: var(--mono);
  font-weight: 400;
  text-align: center;
}

.legend .dot {
  flex: none;
  margin: 0 2px;
}

.swatch {
  flex: none;
  width: 14px;
  height: 14px;
  border: 2px solid var(--accent);
}

.swatch.local {
  border-color: var(--local);
}

@media (max-width: 36rem) {
  .panels {
    grid-template-columns: 1fr;
  }
}
</style>
