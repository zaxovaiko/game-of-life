import p5 from "p5";
import config from "./config";

const width = window.innerWidth;
const height = window.innerHeight;
const state = {
  field: [],
  isPaused: true,
};

const sketch = function (p) {
  p.setup = function () {
    p.createCanvas(width, height);
    p.frameRate(config.FPS);
    p.noLoop();
  };

  function getCellIndexByXY(x, y) {
    return state.field.findIndex((cell) => cell.x === x && cell.y === y);
  }

  function getAllNeighbours(x, y) {
    return [
      [x + config.CELL_SIZE, y], // R
      [x - config.CELL_SIZE, y], // L
      [x + config.CELL_SIZE, y + config.CELL_SIZE], // TR
      [x - config.CELL_SIZE, y - config.CELL_SIZE], // BL
      [x - config.CELL_SIZE, y + config.CELL_SIZE], // TL
      [x + config.CELL_SIZE, y - config.CELL_SIZE], // BR
      [x, y - config.CELL_SIZE], // B
      [x, y + config.CELL_SIZE], // T
    ];
  }

  function drawPieces() {
    p.clear();
    p.background("#262626");

    for (let x = 0; x < width; x += config.CELL_SIZE) {
      for (let y = 0; y < height; y += config.CELL_SIZE) {
        p.stroke("#202020");
        p.strokeWeight(1);
        p.line(x, 0, x, height);
        p.line(0, y, width, y);
      }
    }

    for (const { x, y } of state.field) {
      p.rect(x, y, config.CELL_SIZE);
    }
  }

  p.draw = function () {
    const changes = [];
    const cells = [];

    // Any live cell with fewer than two live neighbours dies, as if by underpopulation.
    // Any live cell with two or three live neighbours lives on to the next generation.
    // Any live cell with more than three live neighbours dies, as if by overpopulation.
    // Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
    for (const { x, y } of state.field) {
      for (const first_row of getAllNeighbours(x, y)) {
        for (const [a, b] of getAllNeighbours(...first_row)) {
          if (cells.findIndex(([c, d]) => c === a && b === d) === -1) {
            cells.push([a, b]);
          }
        }
      }
    }

    for (let i = 0; i < cells.length; i++) {
      const [x, y] = cells[i];
      const n = getAllNeighbours(x, y);
      const neighbours = n.filter((e) => getCellIndexByXY(...e) !== -1).length;
      const ind = getCellIndexByXY(x, y);

      if (ind !== -1 && (neighbours < 2 || neighbours > 3)) {
        const i = getCellIndexByXY(x, y);
        if (i !== -1) {
          changes.push({ i, action: "remove", x, y });
        }
      }
      if (neighbours === 3) {
        changes.push({ action: "create", x, y });
      }
    }

    console.log(changes);

    for (const { i } of changes.filter((e) => e.action === "remove")) {
      state.field.splice(i, 1);
    }
    for (const { x, y } of changes.filter((e) => e.action === "create")) {
      state.field.push({ x, y });
    }
    drawPieces();
  };

  p.keyTyped = function () {
    state.isPaused = !state.isPaused;
    state.isPaused ? p.noLoop() : p.loop();
  };

  p.mouseDragged = function () {
    const x = Math.floor(p.mouseX / config.CELL_SIZE) * config.CELL_SIZE;
    const y = Math.floor(p.mouseY / config.CELL_SIZE) * config.CELL_SIZE;
    if (getCellIndexByXY(x, y) === -1) {
      state.field.push({ x, y });
      p.rect(x, y, config.CELL_SIZE);
    }
  };
};

new p5(sketch);
