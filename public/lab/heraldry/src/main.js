/**
 * MOTEUR GÉNÉRATEUR HÉRALDIQUE BINAIRE (DÉTERMINISTE)
 * =========================================================================
 */

import { PartitionEngine } from './partition_engine.js';
import { describeBlazon } from './blazon.js';

const SVG_NS = "http://www.w3.org/2000/svg";

class HeraldicApp {
  constructor() {
    this.ECU_WIDTH = 2000;
    this.ECU_HEIGHT = 2000;
    this.CANVAS_PAD = 200;

    this.COLOR_BLACK = '#000000';
    this.COLOR_WHITE = '#FFFFFF';

    this.DEVISES = [
      "PAX", "LUX", "VERITAS", "SAPIENTIA", "FORTITUDO", "AMOR", "ASTRUM", "HONOR", 
      "VIRTUS", "GLORIA", "FIDES", "SPES", "JUSTITIA", "AUDACIA", "PERSEVERANTIA",
      "HARMONIA", "LUMEN", "IGNIS", "AETHER", "CAELUM", "STELLA", "SOL", "LUNA"
    ];

    this.PRESET_ANGLES = [0, 45, 90, 135];
    this.ROTATION_ANGLES = [0, 90, 180, 270];

    this.ECU_NAMES = ['anglais', 'espagnol', 'francais_ancien', 'francais_moderne', 'normand', 'suisse'];
    this.MEUBLES_ANCIENS = ['leopard', 'key', 'dragon', 'castle', 'fire'];
    this.MEUBLES_CONTEMPORAINS = ['star', 'cross', 'heart', 'orb', 'hand', 'sword'];

    this.FALLBACK_ECUS = {
      'francais_moderne': `M 0,0 H ${this.ECU_WIDTH} V 1300 C ${this.ECU_WIDTH},1800 1000,2000 1000,2000 C 1000,2000 0,1800 0,1300 Z`
    };

    this.FALLBACK_MEUBLES = {
      'star': {
        viewBox: '0 0 500 500',
        innerNodes: [this.createSvgElement('polygon', { points: "250,25 320,180 495,180 350,285 405,450 250,350 95,450 150,285 5,180 180,180" })]
      }
    };

    this.currentNumericSeed = 0;
    this.currentSeedString = "";
    this.rng = Math.random;

    this.isLightMode = true; // fond blanc par défaut, comme les pages du livre
    this.showPartitions = true;

    this.ecuCache = {};
    this.meubleCache = {};
    this.partitionEngine = new PartitionEngine();
    this.currentGenerationState = null;
  }

  createSvgElement(tagName, attributes = {}) {
    const element = document.createElementNS(SVG_NS, tagName);
    for (const [key, value] of Object.entries(attributes)) {
      element.setAttribute(key, value);
    }
    return element;
  }

  createSeededRandom(seed) {
    return function() {
      let t = seed += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  // Clés à 10 caractères : état de 128 bits (sfc32) alimenté par la clé entière.
  // L'ancien tirage ne garde que 32 bits de la clé, il reste réservé aux clés d'autres longueurs pour qu'elles redonnent le même écu.
  createWideRandom(seed) {
    let a = seed % 4294967296, b = Math.floor(seed / 4294967296), c = 0x9E3779B9, d = 1;
    const next = () => {
      const t = ((a + b | 0) + d) | 0;
      d = d + 1 | 0;
      a = b ^ b >>> 9;
      b = c + (c << 3) | 0;
      c = (c << 21 | c >>> 11) + t | 0;
      return (t >>> 0) / 4294967296;
    };
    for (let i = 0; i < 16; i++) next();
    return next;
  }

  shuffleSeeded(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(this.rng() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  async init() {
    await Promise.all([this.loadEcuAssets(), this.loadMeubleAssets()]);

    if (Object.keys(this.ecuCache).length === 0) this.ecuCache = { ...this.FALLBACK_ECUS };
    if (Object.keys(this.meubleCache).length === 0) this.meubleCache = { ...this.FALLBACK_MEUBLES };

    this.setupUIEventListeners();
    this.generate();

    window.addEventListener("keydown", (e) => this.handleKey(e));

    const container = document.getElementById("container");
    if (container) {
      container.addEventListener("click", () => {
        if (document.activeElement.id === "seed-input") return;
        this.generate();
      });
    }
  }

  setupUIEventListeners() {
    const seedInput = document.getElementById("seed-input");
    const seedDisplay = document.getElementById("seed-display");
    const seedSubmit = document.getElementById("seed-submit");
    const uiContainer = document.getElementById("ui");

    if (uiContainer) {
      uiContainer.addEventListener("click", (e) => e.stopPropagation());
      uiContainer.addEventListener("touchstart", (e) => e.stopPropagation(), { passive: true });
    }

    if (seedDisplay) {
      seedDisplay.addEventListener("click", (e) => {
        e.stopPropagation();
        this.copySeedToClipboard(seedDisplay);
      });
    }

    const processSeedSubmit = () => {
      if (!seedInput) return;
      const value = seedInput.value.trim().toLowerCase();
      
      if (value.length > 0) {
        if (/^[0-9a-z]+$/.test(value)) {
          this.generate(parseInt(value, 36), value);
          seedInput.value = "";
          seedInput.blur();
        }
      } else {
        if (seedDisplay) this.copySeedToClipboard(seedDisplay);
        seedInput.blur();
      }
    };

    if (seedSubmit) {
      seedSubmit.addEventListener("click", (e) => {
        e.stopPropagation();
        processSeedSubmit();
      });
    }

    if (seedInput) {
      seedInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          processSeedSubmit();
        }
      });

      seedInput.addEventListener("keyup", (e) => {
        if (e.code === "Space") e.stopPropagation();
      });
    }
  }

  copySeedToClipboard(elementNode) {
    navigator.clipboard.writeText(this.currentSeedString).then(() => {
      elementNode.classList.add("copied");
      setTimeout(() => elementNode.classList.remove("copied"), 300);
    });
  }

  async loadEcuAssets() {
    await Promise.all(this.ECU_NAMES.map(async (name) => {
      try {
        const response = await fetch(`assets/ecus/${name}.svg`);
        if (!response.ok) return;
        const text = await response.text();
        const doc = new DOMParser().parseFromString(text, "image/svg+xml");
        const path = doc.querySelector("path");
        if (path && path.getAttribute("d")) {
          this.ecuCache[name] = path.getAttribute("d");
        }
      } catch {
        console.warn(`Ressource Écu indisponible : assets/ecus/${name}.svg`);
      }
    }));
  }

  async loadMeubleAssets() {
    const availableMeubles = [...this.MEUBLES_ANCIENS, ...this.MEUBLES_CONTEMPORAINS];
    await Promise.all(availableMeubles.map(async (name) => {
      try {
        const response = await fetch(`assets/meubles/${name}.svg`);
        if (!response.ok) return;
        const text = await response.text();
        const doc = new DOMParser().parseFromString(text, "image/svg+xml");
        const svgEl = doc.querySelector("svg");
        if (svgEl) {
          const children = Array.from(svgEl.childNodes).map(node => node.cloneNode(true));
          this.meubleCache[name] = {
            viewBox: svgEl.getAttribute("viewBox") || "0 0 500 500",
            innerNodes: children
          };
        }
      } catch {
        console.warn(`Ressource Meuble indisponible : assets/meubles/${name}.svg`);
      }
    }));
  }

  generate(targetSeedNumber = null, typedKey = null) {
    if (targetSeedNumber !== null) {
      this.currentNumericSeed = Math.abs(Math.floor(targetSeedNumber));
    } else {
      // exactement 10 caractères en Base36 : assez pour toutes les compositions, et un entier que JavaScript représente sans perte
      this.currentNumericSeed = Math.floor(Math.random() * (36 ** 10 - 36 ** 9) + 36 ** 9);
    }

    // la clé saisie reste affichée telle quelle : la réécrire depuis un très grand nombre pourrait la modifier
    this.currentSeedString = (typedKey ?? this.currentNumericSeed.toString(36)).toUpperCase();
    this.rng = this.currentSeedString.length === 10
      ? this.createWideRandom(this.currentNumericSeed)
      : this.createSeededRandom(this.currentNumericSeed);

    const availableEcus = Object.keys(this.ecuCache).sort();
    const randomEcuName = availableEcus[Math.floor(this.rng() * availableEcus.length)];
    const pathD = this.ecuCache[randomEcuName] || this.FALLBACK_ECUS['francais_moderne'];
    
    const partitionName = this.partitionEngine.getRandomPartition(this.rng);
    const showPart = this.showPartitions;

    const masterHatchAngle = this.PRESET_ANGLES[Math.floor(this.rng() * this.PRESET_ANGLES.length)];

    const placedMeubles = this.calculateMeublesPlacement();
    const randomDevise = this.DEVISES[Math.floor(this.rng() * this.DEVISES.length)];
    const colorShapes = this.generateColorShapes(showPart, partitionName, masterHatchAngle);

    const glyphsData = this.getBlockGridZLayout(
      randomDevise, 
      -this.CANVAS_PAD, 
      -this.CANVAS_PAD, 
      this.ECU_WIDTH + (this.CANVAS_PAD * 2), 
      this.ECU_HEIGHT + (this.CANVAS_PAD * 2)
    );

    this.currentGenerationState = {
      pathD,
      partitionName,
      showPartitions: showPart,
      placedMeubles,
      glyphsData,
      colorShapes
    };

    this.renderSVG();
  }

  calculateMeublesPlacement() {
    const availableMeubleKeys = Object.keys(this.meubleCache).sort();
    const placedMeubles = [];
    const targetMeublesCount = Math.floor(this.rng() * 3) + 2; 
    const meubleCounts = {};

    const rawGridCells = [
      { x: this.ECU_WIDTH * 0.35, y: this.ECU_HEIGHT * 0.35 },
      { x: this.ECU_WIDTH * 0.65, y: this.ECU_HEIGHT * 0.35 },
      { x: this.ECU_WIDTH * 0.35, y: this.ECU_HEIGHT * 0.65 },
      { x: this.ECU_WIDTH * 0.65, y: this.ECU_HEIGHT * 0.65 }
    ];

    const gridCells = this.shuffleSeeded(rawGridCells);

    for (let i = 0; i < targetMeublesCount; i++) {
      const validKeys = availableMeubleKeys.filter(k => (meubleCounts[k] || 0) < 2);
      if (validKeys.length === 0) break;

      const selectedMeuble = validKeys[Math.floor(this.rng() * validKeys.length)];
      meubleCounts[selectedMeuble] = (meubleCounts[selectedMeuble] || 0) + 1;

      const isLeader = (i === 0);
      const isContemporain = this.MEUBLES_CONTEMPORAINS.includes(selectedMeuble);
      const baseRadius = isLeader 
        ? (isContemporain ? 380 : 650) 
        : (isContemporain ? 220 : 380);

      const cell = gridCells[i % gridCells.length];
      const jitterX = (this.rng() * 160 - 80);
      const jitterY = (this.rng() * 160 - 80);

      let cx = Math.round(cell.x + jitterX);
      let cy = Math.round(cell.y + jitterY);
      const rotation = this.ROTATION_ANGLES[Math.floor(this.rng() * this.ROTATION_ANGLES.length)];

      placedMeubles.push({
        cx, cy,
        r: baseRadius,
        name: selectedMeuble,
        mirrored: this.rng() > 0.5,
        rotation
      });
    }

    return placedMeubles;
  }

  generateColorShapes(showPartitions, partitionName, hatchAngle) {
    const shapes = [];
    const nbShapes = Math.floor(this.rng() * 3) + 3;
    const viewW = this.ECU_WIDTH + (this.CANVAS_PAD * 2);
    const viewH = this.ECU_HEIGHT + (this.CANVAS_PAD * 2);

    for (let i = 0; i < nbShapes; i++) {
      let width, height, x, y;
      const isPattern = this.rng() >= 0.5;

      if (i === 0) {
        width = Math.floor(this.rng() * 600) + 1000;
        height = Math.floor(this.rng() * 200) + 400;
        x = Math.floor(this.rng() * (this.ECU_WIDTH - width / 2));
        y = Math.floor(this.rng() * (this.ECU_HEIGHT - height / 2));
      } else {
        width = Math.floor(this.rng() * 200) + 120;
        height = Math.floor(this.rng() * 300) + 120;
        x = Math.floor(this.rng() * (viewW - width)) - this.CANVAS_PAD;
        y = Math.floor(this.rng() * (viewH - height)) - this.CANVAS_PAD;
      }

      let offsetX = 0;
      let offsetY = 0;
      // tirés dans tous les cas : afficher ou masquer les partitions ne doit jamais changer l'écu d'une clé
      const shiftAmount = (this.rng() > 0.5 ? 1 : -1) * (Math.floor(this.rng() * 80) + 40);
      if (showPartitions) {
        if (partitionName === 'parti' || partitionName === 'tranche') offsetX = shiftAmount;
        if (partitionName === 'coupe' || partitionName === 'barre') offsetY = shiftAmount;
      }

      const patternStrokeWidth = Math.floor(this.rng() * 16) + 24; 
      const patternGap = patternStrokeWidth + Math.floor(this.rng() * 32) + 32;

      shapes.push({
        type: 'rect',
        x, y, width, height,
        offsetX, offsetY,
        isPattern,
        hatchAngle,
        patternStrokeWidth,
        patternGap
      });
    }

    return shapes;
  }

  getBlockGridZLayout(text, viewX, viewY, viewWidth, viewHeight) {
    const letters = text.split('');
    const items = [];
    const numRows = letters.length <= 4 ? 2 : (this.rng() > 0.5 ? 2 : 3);
    const chunks = [];
    const chunkSize = Math.ceil(letters.length / numRows);

    for (let i = 0; i < letters.length; i += chunkSize) {
      chunks.push(letters.slice(i, i + chunkSize));
    }

    const rowHeight = (viewHeight - 200) / chunks.length;

    const fontSize = 130;
    const minDistance = Math.round(fontSize * 0.65);

    chunks.forEach((chunk, rIndex) => {
      const yBase = Math.round(viewY + 100 + (rIndex * rowHeight) + (rowHeight / 2));
      const minMargin = 120;
      const availableW = viewWidth - (minMargin * 2);
      
      const count = chunk.length;
      const xCoords = [];

      if (count === 1) {
        xCoords.push(Math.round(viewX + minMargin + this.rng() * availableW));
      } else {
        let attempts = 0;
        let valid = false;

        while (!valid && attempts < 100) {
          attempts++;
          const rawCoords = Array.from({ length: count }, () => 
            Math.round(viewX + minMargin + this.rng() * availableW)
          ).sort((a, b) => a - b);

          valid = true;
          for (let k = 0; k < rawCoords.length - 1; k++) {
            if (rawCoords[k + 1] - rawCoords[k] < minDistance) {
              valid = false;
              break;
            }
          }

          if (valid) {
            xCoords.push(...rawCoords);
          }
        }

        if (!valid) {
          const step = Math.max(minDistance, availableW / (count - 1));
          const startX = viewX + minMargin + (availableW - (step * (count - 1))) / 2;
          for (let k = 0; k < count; k++) {
            xCoords.push(Math.round(startX + k * step));
          }
        }
      }

      chunk.forEach((char, cIndex) => {
        items.push({
          text: char,
          x: xCoords[cIndex],
          y: yBase,
          size: fontSize.toString()
        });
      });
    });

    return items;
  }

  createHatchGroup(defs, id, width, height, angle, strokeWidth, gap) {
    const clipId = `${id}-clip`;
    const clipPath = this.createSvgElement("clipPath", { id: clipId });
    const clipRect = this.createSvgElement("rect", { width, height });
    clipPath.appendChild(clipRect);
    defs.appendChild(clipPath);

    const g = this.createSvgElement("g", {
      id,
      "clip-path": `url(#${clipId})`
    });

    const diag = Math.sqrt(width * width + height * height);
    const cx = width / 2;
    const cy = height / 2;

    const linesGroup = this.createSvgElement("g", {
      transform: `rotate(${angle}, ${cx}, ${cy})`
    });

    for (let x = -diag; x < diag * 2; x += gap) {
      if (Math.abs(x - cx) > diag / 2 + strokeWidth) continue; // hors du rectangle, quel que soit l'angle
      const line = this.createSvgElement("line", {
        x1: x, y1: -diag,
        x2: x, y2: diag * 2,
        stroke: this.COLOR_WHITE,
        "stroke-width": strokeWidth
      });
      linesGroup.appendChild(line);
    }

    g.appendChild(linesGroup);
    return g;
  }

  renderSVG() {
    if (!this.currentGenerationState) return;

    const container = document.getElementById("container");
    if (!container) return;
    container.innerHTML = "";

    const { pathD, partitionName, showPartitions, placedMeubles, glyphsData, colorShapes } = this.currentGenerationState;

    const vX = -this.CANVAS_PAD;
    const vY = -this.CANVAS_PAD;
    const vW = this.ECU_WIDTH + (this.CANVAS_PAD * 2);
    const vH = this.ECU_HEIGHT + (this.CANVAS_PAD * 2);

    const svg = this.createSvgElement("svg", { viewBox: `${vX} ${vY} ${vW} ${vH}` });
    const defs = this.createSvgElement("defs");

    const clipPath = this.createSvgElement("clipPath", { id: "ecu-clip" });
    const clipPathEl = this.createSvgElement("path", { d: pathD });
    clipPath.appendChild(clipPathEl);
    defs.appendChild(clipPath);

    // Seul le fond de canvas bascule entre Noir et Blanc
    document.body.classList.toggle("light-mode", this.isLightMode);
    const canvasBgColor = this.isLightMode ? this.COLOR_WHITE : this.COLOR_BLACK;

    new Set(placedMeubles.map(m => m.name)).forEach(name => {
      if (this.meubleCache[name]) {
        const symbol = this.createSvgElement("symbol", {
          id: `meuble-${name}`,
          viewBox: this.meubleCache[name].viewBox
        });

        this.meubleCache[name].innerNodes.forEach(node => {
          const clone = node.cloneNode(true);
          if (clone.setAttribute) {
            clone.setAttribute('fill', this.COLOR_WHITE);
            clone.setAttribute('stroke', 'none');
          }
          symbol.appendChild(clone);
        });

        defs.appendChild(symbol);
      }
    });

    svg.appendChild(defs);

    const canvasBg = this.createSvgElement("rect", {
      x: vX, y: vY, width: vW, height: vH, fill: canvasBgColor
    });
    svg.appendChild(canvasBg);

    const gDifference = this.createSvgElement("g");

    if (showPartitions) {
      const partitionD = this.partitionEngine.getPartitionPathD(partitionName);
      const fg = this.createSvgElement("path", {
        d: partitionD,
        fill: this.COLOR_WHITE,
        "fill-rule": "evenodd",
        "clip-path": "url(#ecu-clip)",
        style: "mix-blend-mode: difference;"
      });
      gDifference.appendChild(fg);
    } else {
      const bgUse = this.createSvgElement("path", {
        d: pathD,
        fill: this.COLOR_WHITE,
        style: "mix-blend-mode: difference;"
      });
      gDifference.appendChild(bgUse);
    }

    placedMeubles.forEach((candidate, index) => {
      const size = candidate.r * 2;
      const x = candidate.cx - candidate.r;
      const y = candidate.cy - candidate.r;

      let transformStr = `rotate(${candidate.rotation}, ${candidate.cx}, ${candidate.cy})`;
      if (candidate.mirrored) {
        transformStr += ` scale(-1, 1) translate(${-2 * candidate.cx}, 0)`;
      }

      const useEl = this.createSvgElement("use", {
        id: `meuble-use-${index}`,
        href: `#meuble-${candidate.name}`,
        x, y, width: size, height: size,
        transform: transformStr,
        style: "mix-blend-mode: difference;"
      });

      gDifference.appendChild(useEl);
    });

    glyphsData.forEach(g => {
      const textEl = this.createSvgElement("text", {
        x: g.x, y: g.y,
        fill: this.COLOR_WHITE,
        "font-family": "Geist, sans-serif",
        "font-weight": "bold",
        "font-size": g.size || "130",
        "text-anchor": "middle",
        "dominant-baseline": "central",
        style: "mix-blend-mode: difference;"
      });
      textEl.textContent = g.text;
      gDifference.appendChild(textEl);
    });

    colorShapes.forEach((shape, index) => {
      const posX = shape.x + shape.offsetX;
      const posY = shape.y + shape.offsetY;

      const gShape = this.createSvgElement("g", {
        id: `color-shape-${index}`,
        transform: `translate(${posX}, ${posY})`,
        style: "mix-blend-mode: difference;"
      });

      if (shape.isPattern) {
        const hatchGroup = this.createHatchGroup(
          defs, 
          `hatch-group-${index}`, 
          shape.width, 
          shape.height, 
          shape.hatchAngle, 
          shape.patternStrokeWidth, 
          shape.patternGap
        );
        gShape.appendChild(hatchGroup);
      } else {
        const rect = this.createSvgElement("rect", {
          width: shape.width,
          height: shape.height,
          fill: this.COLOR_WHITE
        });
        gShape.appendChild(rect);
      }

      gDifference.appendChild(gShape);
    });

    svg.appendChild(gDifference);
    container.appendChild(svg);
    this.updateUI();
  }

  handleKey(event) {
    if (document.activeElement.id === "seed-input") return;

    const key = event.key.toLowerCase();

    if (event.code === "Space" || key === " ") {
      this.generate();
    } else if (key === "s") {
      this.exportSVG();
    } else if (key === "l") {
      this.isLightMode = !this.isLightMode;
      this.renderSVG();
    } else if (key === "p") {
      this.showPartitions = !this.showPartitions;
      if (this.currentGenerationState) {
        this.currentGenerationState.showPartitions = this.showPartitions;
      }
      this.renderSVG();
    } else if (key === "c") {
      const seedDisplay = document.getElementById("seed-display");
      if (seedDisplay) this.copySeedToClipboard(seedDisplay);
    }
  }

  updateUI() {
    const seedDisplay = document.getElementById("seed-display");
    if (seedDisplay) {
      seedDisplay.innerText = this.currentSeedString;
    }
    const blazonEl = document.getElementById("blazon");
    if (blazonEl) blazonEl.textContent = describeBlazon(this);
  }

  exportSVG() {
    const svgEl = document.querySelector("svg");
    if (!svgEl) return;

    const clone = svgEl.cloneNode(true);
    const blob = new Blob([clone.outerHTML], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.href = url;
    downloadAnchor.download = `blason_${this.currentSeedString}.svg`;
    downloadAnchor.click();
    URL.revokeObjectURL(url);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const app = new HeraldicApp();
  app.init();
  window.app = app;
});