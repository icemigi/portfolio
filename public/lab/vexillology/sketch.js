// Systemic Vexillology — planches de drapeaux génératifs (kerningkastle).
// Les seize moteurs viennent du sketch d'origine (« Générateur d'étendards multi-stratégique »), inchangés.
// Couleurs de la première série (planches du dossier frames) : chaque drapeau est noir ou blanc, son motif dans l'autre
// valeur, et une couleur primaire (jaune, bleu, rouge ou vert), tirée pour chacun ; ou une seule pour toute la planche.
// Ajouts pour le Lab : la planche tient dans l'écran (dessin dans un carré virtuel de 3000 px, mis à l'échelle) ;
// clic sur un drapeau : il se relance seul ; ailleurs : nouvelle planche ; grille au hasard / 3×3 / 4×4 / 5×5 ;
// couleurs ; repères ; enregistrer ; mode jour / nuit du site. Pas d'animation à l'apparition.
const BOARD = 3000;
const CONFIG = { marginRatio: 0.12 };
const PRIMARIES = { '#F0D818': 'YELLOW', '#2478D8': 'BLUE', '#E8231E': 'RED', '#18D848': 'GREEN' };
const HEX = Object.keys(PRIMARIES);
const INK = '#1C1C1C', PAPER = '#F8F8F8';
const MODES = ['mix', ...HEX]; // « mix » : une primaire par drapeau
const GRID_OPTIONS = [{ cols: 3, rows: 3 }, { cols: 4, rows: 4 }, { cols: 5, rows: 5 }];
const BASE_ENGINES = [0, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15];
let flags = [], flagW, flagH, marginX, marginY, arrowImg, FLAG_ACCENTS = [], canvasBg, currentCols, currentRows;
let accentIx = 0, gridIx = -1, showGuides = false;
const accentFor = () => color(MODES[accentIx] === 'mix' ? HEX[Math.floor(Math.random() * HEX.length)] : MODES[accentIx]);
const fr = document.documentElement.lang !== 'en';

function preload() { arrowImg = loadImage('arrow.svg'); }

function fitSize() { return Math.max(240, Math.floor(Math.min(innerWidth - 32, innerHeight - 112))); }

function setup() {
  const c = createCanvas(fitSize(), fitSize());
  c.parent('stage');
  pixelDensity(Math.min(2, window.devicePixelRatio || 1));
  colorMode(HSB, 360, 100, 100, 100);
  applyTheme();
  setAccent(0);
  generateNewBoard();
}

function windowResized() { resizeCanvas(fitSize(), fitSize()); loop(); }

function applyTheme() { canvasBg = color(window.kkNight ? '#000000' : '#FFFFFF'); }
addEventListener('kk:theme', () => { if (typeof color === 'function' && flags.length) { applyTheme(); loop(); } });

function draw() {
  background(canvasBg);
  push();
  scale(width / BOARD);
  let busy = false;
  for (const f of flags) busy = f.display() || busy;
  if (showGuides) drawGuides();
  pop();
  if (!busy) noLoop();
}

function drawGuides() {
  push();
  stroke(0, 0, window.kkNight ? 50 : 40, 45);
  strokeWeight(2);
  for (let j = 0; j <= currentCols; j++) {
    line(j * flagW + marginX * j, 0, j * flagW + marginX * j, BOARD);
    line((j + 1) * marginX + j * flagW, 0, (j + 1) * marginX + j * flagW, BOARD);
  }
  for (let i = 0; i <= currentRows; i++) {
    line(0, i * flagH + marginY * i, BOARD, i * flagH + marginY * i);
    line(0, (i + 1) * marginY + i * flagH, BOARD, (i + 1) * marginY + i * flagH);
  }
  pop();
}


function relaunch(f) {
  const others = BASE_ENGINES.filter((e) => e !== f.engineType);
  f.engineType = others[Math.floor(Math.random() * others.length)];
  f.seed = Math.floor(Math.random() * 1e9);
  f.c.fg2 = accentFor();
  loop();
}

function setAccent(i) {
  accentIx = i % MODES.length;
  flags.forEach((f) => { f.c.fg2 = accentFor(); });
  const m = MODES[accentIx], sw = document.querySelector('#accent .sw');
  sw?.style.setProperty('--a', m === 'mix' ? `conic-gradient(${HEX.join(', ')})` : m);
  loop();
}

function setGrid(i) {
  gridIx = i;
  const b = document.getElementById('grid');
  if (b) b.textContent = (fr ? 'grille : ' : 'grid: ') + (i < 0 ? (fr ? 'au hasard' : 'random') : `${GRID_OPTIONS[i].cols}×${GRID_OPTIONS[i].rows}`);
  generateNewBoard();
}

function mousePressed(e) {
  if (e && e.target && e.target.tagName !== 'CANVAS') return;
  if (mouseX < 0 || mouseY < 0 || mouseX > width || mouseY > height) return;
  const k = BOARD / width, x = mouseX * k, y = mouseY * k;
  const f = flags.find((g) => x >= g.x && x <= g.x + g.w && y >= g.y && y <= g.y + g.h);
  if (f) relaunch(f); else generateNewBoard();
}

function keyPressed() {
  if (key === ' ') { generateNewBoard(); return false; }
  if (key === '3' || key === '4' || key === '5') { setGrid(+key - 3); return false; }
  if (key === 'g' || key === 'G') { document.getElementById('guides').click(); return false; }
  if (key === 's' || key === 'S') { saveCanvas('systemic-vexillology', 'png'); return false; }
}

document.getElementById('board').addEventListener('click', () => generateNewBoard());
document.getElementById('grid').addEventListener('click', () => setGrid(gridIx >= GRID_OPTIONS.length - 1 ? -1 : gridIx + 1));
document.getElementById('accent').addEventListener('click', () => setAccent(accentIx + 1));
document.getElementById('guides').addEventListener('click', (e) => { showGuides = !showGuides; e.currentTarget.setAttribute('aria-pressed', String(showGuides)); loop(); });
document.getElementById('save').addEventListener('click', () => saveCanvas('systemic-vexillology', 'png'));
if (!fr) {
  document.querySelector('.kk-bar .hint').textContent = 'click a flag: re-roll it · elsewhere: new board · 3 4 5: grid';
  [['board', 'board'], ['accent', 'colour'], ['guides', 'guides'], ['save', 'save']].forEach(([id, t]) => { const b = document.getElementById(id); b.firstChild.textContent = t; });
  document.getElementById('grid').textContent = 'grid: random';
}

function generateNewBoard() {
  randomSeed(Math.floor(Math.random() * 1e9));
  let chosenGrid = gridIx < 0 ? random(GRID_OPTIONS) : GRID_OPTIONS[gridIx];
  currentCols = chosenGrid.cols;
  currentRows = chosenGrid.rows;

  setupBoardDimensions();
  loop();
}

function setupBoardDimensions() {
  let totalMarginX = BOARD * CONFIG.marginRatio; 
  let totalMarginY = BOARD * CONFIG.marginRatio;
  
  let availableW = (BOARD - totalMarginX) / currentCols;
  let availableH = (BOARD - totalMarginY) / currentRows;
  
  if (availableW / availableH > 1.5) {
    flagH = availableH * 0.9;
    flagW = flagH * 1.5;
  } else {
    flagW = availableW * 0.9;
    flagH = flagW / 1.5;
  }
  
  marginX = (BOARD - (flagW * currentCols)) / (currentCols + 1);
  marginY = (BOARD - (flagH * currentRows)) / (currentRows + 1);

  flags = [];
  let totalCells = currentCols * currentRows;
  let baseEngines = [0, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  
  let pool = [];
  while(pool.length < totalCells) {
    let shuffledBase = [...baseEngines];
    for (let i = shuffledBase.length - 1; i > 0; i--) {
      let j = floor(random(i + 1));
      let temp = shuffledBase[i];
      shuffledBase[i] = shuffledBase[j];
      shuffledBase[j] = temp;
    }
    pool.push(...shuffledBase);
  }
  pool = pool.slice(0, totalCells); 

  let grid = Array(currentRows).fill(0).map(() => Array(currentCols).fill(-1));
  let usedPool = Array(totalCells).fill(false);
  let fallbackMode = false;
  let attempts = 0;
  
  function solve(cellIndex) {
    if (cellIndex === totalCells) return true;
    
    attempts++;
    if (attempts > 15000) {
      fallbackMode = true;
      return true;
    }

    let r = floor(cellIndex / currentCols);
    let c = cellIndex % currentCols;
    
    let indices = Array(totalCells).fill(0).map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      let j = floor(random(i + 1));
      let temp = indices[i];
      indices[i] = indices[j];
      indices[j] = temp;
    }
    
    let tried = new Set();
    
    for (let idx of indices) {
      if (usedPool[idx]) continue;
      let eng = pool[idx];
      if (tried.has(eng)) continue;
      
      let rowDuplicate = false;
      if (!fallbackMode && currentCols <= baseEngines.length) {
        for (let prevC = 0; prevC < c; prevC++) {
          if (grid[r][prevC] === eng) {
            rowDuplicate = true;
            break;
          }
        }
      }
      if (rowDuplicate) continue;
      
      let colDuplicate = false;
      if (!fallbackMode && currentRows <= baseEngines.length) {
        for (let prevR = 0; prevR < r; prevR++) {
          if (grid[prevR][c] === eng) {
            colDuplicate = true;
            break;
          }
        }
      }
      if (colDuplicate) continue;
      
      if (!fallbackMode && r > 0 && grid[r-1][c] === eng) continue;
      
      tried.add(eng);
      usedPool[idx] = true;
      grid[r][c] = eng;
      
      if (solve(cellIndex + 1)) return true;
      
      usedPool[idx] = false;
      grid[r][c] = -1;
    }
    return false;
  }
  
  let isSolved = solve(0);

  if (!isSolved || fallbackMode) {
    let flatIndex = 0;
    for (let i = 0; i < currentRows; i++) {
      for (let j = 0; j < currentCols; j++) {
        grid[i][j] = pool[flatIndex++];
      }
    }
  }

  let engineInstances = {};

  for (let i = 0; i < currentRows; i++) {
    for (let j = 0; j < currentCols; j++) {
      let x = marginX + j * (flagW + marginX);
      let y = marginY + i * (flagH + marginY);
      
      let assignedEngine = grid[i][j] !== -1 ? grid[i][j] : 0;
      let variantIndex = engineInstances[assignedEngine] ? engineInstances[assignedEngine].count : 0;

      let isDarkBg;

      if (variantIndex === 0) {
        isDarkBg = random() > 0.5;
        engineInstances[assignedEngine] = {
          count: 1,
          isDarkBg: isDarkBg
        };
      } else {
        isDarkBg = !engineInstances[assignedEngine].isDarkBg;
        engineInstances[assignedEngine].count++;
      }

      // Alternance des fonds de drapeaux : noir ou blanc (première série)
      let bg = color(isDarkBg ? INK : PAPER);
      let fg1 = color(isDarkBg ? PAPER : INK);
      let fg2 = accentFor();
      let palette = { bg: bg, fg1: fg1, fg2: fg2 };

      flags.push(new MultiStrategyFlag(x, y, flagW, flagH, assignedEngine, palette, variantIndex));
    }
  }
}

/* =================================================================
   CLASSE PRINCIPALE : GESTION DES MOTEURS STRATÉGIQUES
================================================================= */
class MultiStrategyFlag {
  constructor(x, y, w, h, forcedEngine, forcedPalette, variantIndex = 0) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    
    this.engineType = forcedEngine !== undefined ? forcedEngine : floor(random(13)); 
    this.c = forcedPalette !== undefined ? forcedPalette : this.getPalette();
    this.variantIndex = variantIndex;
    this.seed = Math.floor(Math.random() * 1e9);
  }

  getPalette() {
    let isDarkBg = random() > 0.5;
    let bg = color(isDarkBg ? INK : PAPER);
    let fg1 = color(isDarkBg ? PAPER : INK);
    let fg2 = accentFor();
    return { bg: bg, fg1: fg1, fg2: fg2 };
  }

  display() {
    randomSeed(this.seed); noiseSeed(this.seed);
    push();
    translate(this.x, this.y);
    
    fill(this.c.bg);
    noStroke();
    rect(0, 0, this.w, this.h);

    if (this.engineType !== 6) {
      drawingContext.save();
      drawingContext.beginPath();
      drawingContext.rect(0, 0, this.w, this.h);
      drawingContext.clip();
    }

    switch(this.engineType) {
      case 0: this.drawSegmentedStripes(); break;
      case 1: this.drawOrthogonalLabyrinth(); break;
      case 2: this.drawBrutalistTension(); break;
      case 3: this.drawAbstractMatrix(); break;
      case 4: this.drawRadialSymmetry(); break;
      case 5: this.drawModularSwarm(); break;
      case 6: this.drawMondrianGrid(); break;
      case 7: this.drawConstellationCircle(); break;
      case 8: this.drawComicExplosion(); break;
      case 9: this.drawMagneticGrid(); break;
      case 10: this.drawNordicFault(); break;
      case 11: this.drawBrokenStripesFlag(); break;
      case 12: this.drawMonolithicCluster(); break;
      case 13: this.drawHalftoneGrid(); break;
      case 14: this.drawSimpleTrisectFlag(); break;
      case 15: this.drawChaoticPendulum(); break; 
    }

    if (this.engineType !== 6) {
      drawingContext.restore();
    }

    noFill();
    stroke(0, 0, 40, 40);
    strokeWeight(2);
    rect(0, 0, this.w, this.h);
    pop();
    return false;
  }

  // --- MOTEUR 0 : Taille fixe, centrage optique strict & horizontal stable ---
  drawSegmentedStripes() {
    let structuralChars = ['A', 'a', 'C', 'c', 'E', 'e', 'M', 'm', 'n', 'O', 'o', 'R', 'r', 'U', 'u', 'V', 'v', 'W', 'w'];
    let giantChar = random(structuralChars);
    
    let leftBound = floor(this.w * random(0.2, 0.4));
    let rightBound = floor(this.w * random(0.6, 0.8));
    let boundaries = [0, leftBound, rightBound, this.w];
    
    noStroke();
    let charColor = (this.variantIndex === 1) ? this.c.fg2 : (random() > 0.5 ? this.c.fg1 : this.c.fg2);
    let blockPalette = [this.c.bg, this.c.fg1, this.c.fg2].filter(c => c !== charColor);
    
    for (let i = 0; i < boundaries.length - 1; i++) {
      let x1 = boundaries[i];
      let x2 = boundaries[i + 1];
      fill(random(blockPalette));
      rect(x1, 0, (x2 - x1) + 1, this.h);
    }
    
    push();
    textFont('Helvetica');
    textStyle(BOLD);
    
    let fontSize = this.h * 2.2;
    textSize(fontSize);
    textAlign(CENTER, CENTER);
    
    fill(charColor);
    
    let textX = this.w / 2;
    let verticalOffset = fontSize * 0.055; 
    let textY = (this.h / 2) + verticalOffset;
    
    let angles = [0, PI];
    let chosenAngle = random(angles);
    
    translate(textX, textY);
    rotate(chosenAngle);
    
    text(giantChar, 0, 0);
    pop();
  }

  // --- MOTEUR 1 : Labyrinthe orthogonal ---
  drawOrthogonalLabyrinth() {
    let gridSize = this.h / 4;
    strokeCap(SQUARE);

    let wThick = gridSize * 0.36;
    let wThin = gridSize * 0.08;
    let offset = gridSize * 0.14;

    for (let x = 0; x <= this.w; x += gridSize) {
      for (let y = 0; y <= this.h; y += gridSize) {
        push();
        translate(x + gridSize / 2, y + gridSize / 2);
        
        let tileVariant = floor(random(4));
        let isFractured = random() > 0.5;
        
        noFill();
        
        if (!isFractured) {
          stroke(this.c.fg1);
          strokeWeight(wThick);
          
          if (tileVariant === 0) {
            arc(-gridSize/2, -gridSize/2, gridSize, gridSize, 0, HALF_PI);
            arc(gridSize/2, gridSize/2, gridSize, gridSize, PI, PI + HALF_PI);
          } else if (tileVariant === 1) {
            arc(gridSize/2, -gridSize/2, gridSize, gridSize, HALF_PI, PI);
            arc(-gridSize/2, gridSize/2, gridSize, gridSize, PI + HALF_PI, TWO_PI);
          } else if (tileVariant === 2) {
            line(0, -gridSize/2, 0, gridSize/2);
          } else {
            line(-gridSize/2, 0, gridSize/2, 0);
          }
        } else {
          stroke(this.c.fg2);
          strokeWeight(wThin);
          
          let drawTripleArc = (cx, cy, start, stop) => {
            arc(cx, cy, gridSize - offset*2, gridSize - offset*2, start, stop);
            arc(cx, cy, gridSize, gridSize, start, stop);
            arc(cx, cy, gridSize + offset*2, gridSize + offset*2, start, stop);
          };
          
          if (tileVariant === 0) {
            drawTripleArc(-gridSize/2, -gridSize/2, 0, HALF_PI);
            drawTripleArc(gridSize/2, gridSize/2, PI, PI + HALF_PI);
          } else if (tileVariant === 1) {
            drawTripleArc(gridSize/2, -gridSize/2, HALF_PI, PI);
            drawTripleArc(-gridSize/2, gridSize/2, PI + HALF_PI, TWO_PI);
          } else if (tileVariant === 2) {
            line(-offset, -gridSize/2, -offset, gridSize/2);
            line(0, -gridSize/2, 0, gridSize/2);
            line(offset, -gridSize/2, offset, gridSize/2);
          } else {
            line(-gridSize/2, -offset, gridSize/2, -offset);
            line(-gridSize/2, 0, gridSize/2, 0);
            line(-gridSize/2, offset, gridSize/2, offset);
          }
        }
        pop();
      }
    }
  }

  // --- MOTEUR 2 : Tension brutaliste ---
  drawBrutalistTension() {
    let side = floor(random(4)); 
    let thickness = min(this.w, this.h) * random(0.18, 0.28);
    
    fill(this.c.fg1);
    noStroke();
    
    if (side === 0) {
      rect(0, 0, thickness, this.h);
      fill(this.c.fg2);
      rect(thickness, 0, this.w - thickness, this.h);
    } else if (side === 1) {
      rect(this.w - thickness, 0, thickness, this.h);
      fill(this.c.fg2);
      rect(0, 0, this.w - thickness, this.h);
    } else if (side === 2) {
      rect(0, 0, this.w, thickness);
      fill(this.c.fg2);
      rect(0, thickness, this.w, this.h - thickness);
    } else {
      rect(0, this.h - thickness, this.w, thickness);
      fill(this.c.fg2);
      rect(0, 0, this.w, this.h - thickness);
    }
    
    fill(this.c.bg);
    let cutoutType = floor(random(3));
    
    if (cutoutType === 0) {
      let ch = this.h * random(0.15, 0.3);
      let cy = random(ch, this.h - ch * 2);
      rect(this.w * 0.2, cy, this.w * 0.6, ch);
    } else if (cutoutType === 1) {
      let fw = this.w * random(0.3, 0.5);
      let fh = this.h * random(0.3, 0.5);
      rect((this.w - fw) / 2, (this.h - fh) / 2, fw, fh);
    } else {
      let vw = this.w * random(0.25, 0.4);
      let vh = this.h * random(0.6, 0.9);
      rect((this.w - vw) / 2, (this.h - vh) / 2, vw, vh);
    }
  }

  // --- MOTEUR 3 : Matrice abstractive ---
  drawAbstractMatrix() {
    let boxSize = this.h * 0.48;
    let cy = this.h * 0.5;
    let gap = (this.w - 2 * boxSize) / 3;

    let cx1 = gap + boxSize / 2;
    let startX2 = gap * 2 + boxSize;
    let startY2 = cy - boxSize / 2;

    let S = boxSize / 2;
    let outerR = S;
    let innerR = S * 0.5;

    push();
    translate(cx1, cy);
    noStroke();

    let mode = floor(random(4));
    let rots = [0, 0, 0, 0];

    if (mode === 0) {
      let r = floor(random(4)) * HALF_PI;
      rots = [r, r + HALF_PI, r + PI, r + 1.5 * PI];
    } else if (mode === 1) {
      let r1 = floor(random(4)) * HALF_PI;
      let r2 = floor(random(4)) * HALF_PI;
      rots = [r1, r2, (TWO_PI - r2) % TWO_PI, (TWO_PI - r1) % TWO_PI];
    } else if (mode === 2) {
      let r1 = floor(random(4)) * HALF_PI;
      let r2 = floor(random(4)) * HALF_PI;
      rots = [r1, r1, r2, r2];
    } else {
      let r = floor(random(4)) * HALF_PI;
      rots = [r, r, r + HALF_PI, r + HALF_PI];
    }

    let cells = [
      { x: -S / 2, y: -S / 2, baseRot: 0, rot: rots[0] },
      { x:  S / 2, y: -S / 2, baseRot: HALF_PI, rot: rots[1] },
      { x:  S / 2, y:  S / 2, baseRot: PI, rot: rots[2] },
      { x: -S / 2, y:  S / 2, baseRot: 1.5 * PI, rot: rots[3] }
    ];

    for (let cell of cells) {
      push();
      translate(cell.x, cell.y);
      rotate(cell.baseRot + cell.rot);

      let cornerX = S / 2;
      let cornerY = S / 2;
      let overlap = 0.015;

      fill(this.c.fg1);
      beginShape();
      let steps = 30;

      for (let a = PI - overlap; a <= 1.5 * PI + overlap; a += (HALF_PI + 2 * overlap) / steps) {
        vertex(cornerX + cos(a) * outerR, cornerY + sin(a) * outerR);
      }
      for (let a = 1.5 * PI + overlap; a >= PI - overlap; a -= (HALF_PI + 2 * overlap) / steps) {
        vertex(cornerX + cos(a) * innerR, cornerY + sin(a) * innerR);
      }
      endShape(CLOSE);

      pop();
    }
    pop();

    let pixelSize = boxSize / 5;
    fill(this.c.fg2);
    noStroke();

    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        if (random() > 0.55) {
          rect(startX2 + i * pixelSize, startY2 + j * pixelSize, pixelSize + 0.5, pixelSize + 0.5);
        }
      }
    }
  }

  // --- MOTEUR 4 : Symétrie radiale ---
  drawRadialSymmetry() {
    let cx = this.w / 2, cy = this.h / 2;
    let elements = floor(random(4, 16)); 
    let radius = this.h * 0.32;
    
    push();
    translate(cx, cy);

    fill(this.c.fg1);
    noStroke();
    ellipse(0, 0, this.h * 0.08);

    let chordLength = 2 * radius * sin(PI / elements);
    let maxStarSize = (chordLength / 2) * 0.9;
    let starBaseSize = min(maxStarSize, this.h * 0.16);

    for (let i = 0; i < elements; i++) {
      let angle = (TWO_PI / elements) * i - HALF_PI;
      let x = cos(angle) * radius;
      let y = sin(angle) * radius;

      fill(this.c.fg2);
      noStroke();
      this.drawSolidStar(x, y, starBaseSize * 0.4, starBaseSize, 5);
    }
    
    pop();
  }

  drawSolidStar(x, y, radius1, radius2, npoints) {
    let angle = TWO_PI / npoints;
    let halfAngle = angle / 2.0;
    beginShape();
    for (let a = -HALF_PI; a < TWO_PI - HALF_PI; a += angle) {
      let sx = x + cos(a) * radius2;
      let sy = y + sin(a) * radius2;
      vertex(sx, sy);
      sx = x + cos(a + halfAngle) * radius1;
      sy = y + sin(a + halfAngle) * radius1;
      vertex(sx, sy);
    }
    endShape(CLOSE);
  }

  // --- MOTEUR 5 : Essaim modulaire ---
  drawModularSwarm() {
    let colsGrid = 6;
    let rowsGrid = 4;
    let cellW = this.w / colsGrid;
    let cellH = this.h / rowsGrid;

    let layoutSubtype = floor(random(4));

    if (layoutSubtype === 3) {
      let centerChoice = random() > 0.5 ? 'giant' : 'quad';
      
      if (centerChoice === 'giant') {
        push();
        translate(this.w / 2, this.h / 2);
        rotate(floor(random(4)) * HALF_PI);
        let size = min(this.w, this.h) * 0.6;
        imageMode(CENTER);
        
        let arrowCol = random() < 0.7 ? this.c.fg1 : this.c.fg2;
        tint(arrowCol);
        image(arrowImg, 0, 0, size, size);
        noTint();
        pop();
      } else {
        let cx = this.w / 2;
        let cy = this.h / 2;
        let offset = cellW * 0.8;
        let size = cellW * 1.1;

        let positions = [
          { x: cx - offset, y: cy - offset },
          { x: cx + offset, y: cy - offset },
          { x: cx - offset, y: cy + offset },
          { x: cx + offset, y: cy + offset }
        ];

        for (let pos of positions) {
          push();
          translate(pos.x, pos.y);
          rotate(floor(random(4)) * HALF_PI);
          imageMode(CENTER);
          
          let arrowCol = random() < 0.7 ? this.c.fg1 : this.c.fg2;
          tint(arrowCol);
          image(arrowImg, 0, 0, size, size);
          noTint();
          pop();
        }
      }
    } else {
      let occupancy = [];
      for (let i = 0; i < colsGrid; i++) {
        occupancy[i] = [];
        for (let j = 0; j < rowsGrid; j++) {
          occupancy[i][j] = false;
        }
      }

      for (let i = 0; i < colsGrid; i++) {
        for (let j = 0; j < rowsGrid; j++) {
          if (occupancy[i][j]) continue;

          if (layoutSubtype === 1 && i >= colsGrid / 2) continue; 
          if (layoutSubtype === 2 && i < colsGrid / 2) continue;  

          if (random() > 0.45) continue;

          let canFit2x2 = (i + 1 < colsGrid) && (j + 1 < rowsGrid) && 
                          !occupancy[i+1][j] && !occupancy[i][j+1] && !occupancy[i+1][j+1];
          let span = (canFit2x2 && random() < 0.25) ? 2 : 1;

          for (let dx = 0; dx < span; dx++) {
            for (let dy = 0; dy < span; dy++) {
              occupancy[i + dx][j + dy] = true;
            }
          }

          push();
          let posX = (i * cellW) + (span * cellW) / 2;
          let posY = (j * cellH) + (span * cellH) / 2;
          
          translate(posX, posY);
          rotate(floor(random(4)) * HALF_PI);
          
          let arrowSize = (span * cellW) * 0.85; 
          imageMode(CENTER);
          
          let arrowCol = random() < 0.75 ? this.c.fg1 : this.c.fg2;
          tint(arrowCol);
          image(arrowImg, 0, 0, arrowSize, arrowSize);
          noTint();
          pop();
        }
      }
    }
  }

  // --- MOTEUR 6 : SUBDIVISION NÉOPLASTICISTE ---
  drawMondrianGrid() {
    let rects = [];
    
    let subdivide = (x, y, w, h, depth) => {
      if (depth <= 0 || (w < this.w * 0.22 && h < this.h * 0.22) || random() < 0.25) {
        rects.push({ x: x, y: y, w: w, h: h });
        return;
      }
      
      let splitHoriz = w > h ? false : (h > w ? true : random() > 0.5);
      let splitRatio = random(0.3, 0.7);
      
      if (splitHoriz) {
        let h1 = h * splitRatio;
        let h2 = h - h1;
        subdivide(x, y, w, h1, depth - 1);
        subdivide(x, y + h1, w, h2, depth - 1);
      } else {
        let w1 = w * splitRatio;
        let w2 = w - w1;
        subdivide(x, y, w1, h, depth - 1);
        subdivide(x + w1, y, w2, h, depth - 1);
      }
    };
    
    subdivide(0, 0, this.w, this.h, 3);
    
    if (rects.length === 1) {
      fill(this.c.fg2);
      noStroke();
      rect(0, 0, this.w, this.h);

      fill(this.c.bg);
      let circleDiameter = min(this.w, this.h) * 0.42;
      ellipse(this.w / 2, this.h / 2, circleDiameter, circleDiameter);
      return;
    }
    
    let palette = [
      this.c.bg, 
      this.c.fg1, 
      this.c.fg2, 
      color(INK), 
      color(PAPER)
    ];
    
    noStroke();
    for (let r of rects) {
      fill(random(palette));
      rect(r.x, r.y, r.w, r.h);
    }
    
    stroke(0, 0, 10);
    strokeWeight(max(2, this.w * 0.015));
    noFill();
    for (let r of rects) {
      rect(r.x, r.y, r.w, r.h);
    }
  }

  // --- MOTEUR 7 : Constellation de cercles ---
  drawConstellationCircle() {
    let count = floor(random(5, 9));
    let points = [];
    
    let padW = this.w * 0.18;
    let padH = this.h * 0.22;
    let maxAttempts = 100;
    let circleSize = this.h * 0.12;

    for (let i = 0; i < count; i++) {
      let attempts = 0;
      let valid = false;
      let newP;
      
      while (!valid && attempts < maxAttempts) {
        newP = {
          x: random(padW, this.w - padW),
          y: random(padH, this.h - padH)
        };
        valid = true;
        
        for (let p of points) {
          let minDist = circleSize * 1.6;
          if (dist(newP.x, newP.y, p.x, p.y) < minDist) {
            valid = false;
            break;
          }
        }
        attempts++;
      }
      if (valid) points.push(newP);
    }
    
    points.sort((a, b) => a.x - b.x);
    
    let startY = random(padH, this.h - padH);
    let endY = random(padH, this.h - padH);
    
    let topBgColor = this.c.bg;
    let bottomBgColor = this.c.fg1;
    let circleColor = this.c.fg2;

    noStroke();
    fill(topBgColor);
    rect(0, 0, this.w, this.h);

    let isPolygonBottom = random() > 0.5;
    fill(bottomBgColor);
    beginShape();
    if (isPolygonBottom) {
      vertex(0, this.h);
      vertex(this.w, this.h);
      vertex(this.w, endY);
      for (let i = points.length - 1; i >= 0; i--) {
        vertex(points[i].x, points[i].y);
      }
      vertex(0, startY);
    } else {
      vertex(0, 0);
      vertex(this.w, 0);
      vertex(this.w, endY);
      for (let i = points.length - 1; i >= 0; i--) {
        vertex(points[i].x, points[i].y);
      }
      vertex(0, startY);
    }
    endShape(CLOSE);
    
    fill(circleColor);
    noStroke();
    
    for (let p of points) {
      circle(p.x, p.y, circleSize);
    }
  }

  // --- MOTEUR 8 : Explosion Structurée ---
  drawComicExplosion() {
    fill(this.c.bg);
    noStroke();
    rect(0, 0, this.w, this.h);

    let cx = this.w * random(0.2, 0.8);
    let cy = this.h * random(0.2, 0.8);
    let zoomScale = random(0.3, 1.0);
    let axes = [0, PI / 4, PI / 2, 3 * PI / 4];
    let maxD = dist(0, 0, this.w, this.h) * 1.5;

    for (let i = 0; i < axes.length; i++) {
      let angle = axes[i] + random(-0.15, 0.15); 
      let t1 = min(this.w, this.h) * random(0.02, 0.45) * zoomScale;
      let t2 = min(this.w, this.h) * random(0.02, 0.45) * zoomScale;

      let xA = cx + cos(angle) * maxD;
      let yA = cy + sin(angle) * maxD;
      let xB = cx - cos(angle) * maxD;
      let yB = cy - sin(angle) * maxD;

      let pA_x = cos(angle + HALF_PI) * t1;
      let pA_y = sin(angle + HALF_PI) * t1;
      let pB_x = cos(angle + HALF_PI) * t2;
      let pB_y = sin(angle + HALF_PI) * t2;

      fill((i % 2 === 0) ? this.c.fg1 : this.c.fg2);
      
      beginShape();
      vertex(xA + pA_x, yA + pA_y);
      vertex(xA - pA_x, yA - pA_y);
      vertex(xB - pB_x, yB - pB_y);
      vertex(xB + pB_x, yB + pB_y);
      endShape(CLOSE);
    }
  }

  // --- MOTEUR 9 : Grille magnétique orientée ---
  drawMagneticGrid() {
    let cols = 7;
    let rows = 5;
    let cellW = this.w / cols;
    let cellH = this.h / rows;

    let targetCol = floor(random(1, cols - 1));
    let targetRow = floor(random(1, rows - 1));

    let centerX = (targetCol + 0.5) * cellW;
    let centerY = (targetRow + 0.5) * cellH;

    noStroke();
    
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        let posX = (i + 0.5) * cellW;
        let posY = (j + 0.5) * cellH;

        push();
        translate(posX, posY);

        let elemCol = random() < 0.7 ? this.c.fg1 : this.c.fg2;
        fill(elemCol);

        let elemW = min(cellW, cellH) * 0.6;
        let elemH = elemW * 0.25;

        if (i === targetCol && j === targetRow) {
          rect(-elemW / 2, -elemH / 2, elemW, elemH);
          rect(-elemH / 2, -elemW / 2, elemH, elemW);
        } else {
          let angle = atan2(centerY - posY, centerX - posX);
          rotate(angle);
          rect(-elemW / 2, -elemH / 2, elemW, elemH);
        }
        pop();
      }
    }
  }

  // --- MOTEUR 10 : Croix Déstructurée ---
  drawNordicFault() {
    fill(this.c.bg);
    noStroke();
    rect(0, 0, this.w, this.h);

    let cx = this.w * random(0.25, 0.6);
    let cy = this.h * random(0.3, 0.7);
    
    let nTL = { x: cx - random(this.w * 0.02, this.w * 0.1), y: cy - random(this.h * 0.02, this.h * 0.1) };
    let nTR = { x: cx + random(this.w * 0.02, this.w * 0.1), y: cy - random(this.h * 0.02, this.h * 0.1) };
    let nBR = { x: cx + random(this.w * 0.02, this.w * 0.1), y: cy + random(this.h * 0.02, this.h * 0.1) };
    let nBL = { x: cx - random(this.w * 0.02, this.w * 0.1), y: cy + random(this.h * 0.02, this.h * 0.1) };

    let yL1 = random(0.05, 0.35) * this.h;
    let yL2 = random(0.65, 0.95) * this.h;
    let xT1 = random(0.05, 0.4) * this.w;
    let xT2 = random(0.6, 0.95) * this.w;
    let yR1 = random(0.05, 0.35) * this.h;
    let yR2 = random(0.65, 0.95) * this.h;
    let xB1 = random(0.05, 0.4) * this.w;
    let xB2 = random(0.6, 0.95) * this.w;

    let crossColor = (this.variantIndex === 1) ? this.c.fg2 : (random() > 0.5 ? this.c.fg1 : this.c.fg2);
    fill(crossColor);
    
    beginShape();
    vertex(0, yL1);       
    vertex(nTL.x, nTL.y); 
    vertex(xT1, 0);       
    vertex(xT2, 0);       
    vertex(nTR.x, nTR.y); 
    vertex(this.w, yR1);  
    vertex(this.w, yR2);  
    vertex(nBR.x, nBR.y); 
    vertex(xB2, this.h);  
    vertex(xB1, this.h);  
    vertex(nBL.x, nBL.y); 
    vertex(0, yL2);       
    endShape(CLOSE);
  }

  // --- MOTEUR 11 : Bandes à cassure unique & Canton dynamique ---
  drawBrokenStripesFlag() {
    let colors = shuffle([this.c.bg, this.c.fg1, this.c.fg2], true);
    let bgColor = colors[0];
    let stripeColor = colors[1];
    let symbolColor = colors[2];

    fill(bgColor);
    noStroke();
    rect(0, 0, this.w, this.h);

    let numTracks = 6;
    let trackStep = this.h / numTracks;
    let stripeThickness = trackStep * 0.35; 
    let numStripes = 5;

    for (let i = 0; i < numStripes; i++) {
      let startTrack = floor(random(numTracks));
      let endTrack = floor(random(numTracks));
      let pivotTrack = floor(random(numTracks));

      let yStart = startTrack * trackStep + trackStep / 2;
      let yEnd = endTrack * trackStep + trackStep / 2;
      
      let pivotX = this.w * random(0.35, 0.65);
      let pivotY = pivotTrack * trackStep + trackStep / 2 + random(-trackStep * 0.2, trackStep * 0.2);

      stroke(stripeColor);
      strokeWeight(stripeThickness);
      noFill();

      beginShape();
      vertex(0, yStart);
      vertex(pivotX, pivotY);
      vertex(this.w, yEnd);
      endShape();
    }

    let cantonW = this.w * 0.82;
    let cantonH = this.h * 0.82;
    let cantonX = (this.w - cantonW) / 2;
    let cantonY = (this.h - cantonH) / 2;

    let numSymbols = floor(random(1, 11));
    
    let rowPattern;
    switch(numSymbols) {
      case 1:  rowPattern = [1]; break;
      case 2:  rowPattern = [2]; break;
      case 3:  rowPattern = [3]; break;
      case 4:  rowPattern = [2, 2]; break;
      case 5:  rowPattern = [3, 2]; break;
      case 6:  rowPattern = [3, 3]; break;
      case 7:  rowPattern = [4, 3]; break;
      case 8:  rowPattern = [4, 4]; break;
      case 9:  rowPattern = [5, 4]; break;
      case 10: rowPattern = [5, 5]; break;
      default: rowPattern = [3, 3];
    }

    let maxCols = Math.max(...rowPattern);
    let rows = rowPattern.length;
    
    let rowStepH = cantonH / (rows + 1);
    let colStepW = cantonW / (maxCols + 1);
    
    let scaleFactor = map(numSymbols, 1, 10, 0.90, 0.60);
    let symbolSize = min(colStepW, rowStepH) * scaleFactor;
    let cantonCenterX = cantonX + cantonW / 2;

    for (let r = 0; r < rows; r++) {
      let countInRow = rowPattern[r];
      let y = cantonY + rowStepH * (r + 1);
      
      let rowWidth = (countInRow - 1) * colStepW;
      let startX = cantonCenterX - rowWidth / 2;

      for (let c = 0; c < countInRow; c++) {
        let x = (countInRow === 1) ? cantonCenterX : (startX + c * colStepW);
        this.drawPlusSign(x, y, symbolSize, symbolColor);
      }
    }
  }

  drawPlusSign(cx, cy, sz, col) {
    push();
    translate(cx, cy);
    fill(col);
    noStroke();
    rectMode(CENTER);
    let barW = sz * 0.3;
    let barL = sz;
    rect(0, 0, barL, barW);
    rect(0, 0, barW, barL);
    pop();
  }

  // --- MOTEUR 12 : La Gerbe Flamboyante ---
  drawMonolithicCluster() {
    fill(this.c.bg);
    noStroke();
    rect(0, 0, this.w, this.h);

    let blockColor = (this.variantIndex === 1) ? this.c.fg2 : (random() > 0.5 ? this.c.fg1 : this.c.fg2);
    fill(blockColor);
    noStroke();

    let side = floor(random(4)); 
    let cx, cy, centralAngle, arcSpread;
    let padding = 15;

    if (side === 0) { 
      cx = this.w * random(0.05, 0.15);
      cy = this.h * random(0.4, 0.7);
      centralAngle = 0;
      arcSpread = PI * 0.75;
    } else if (side === 1) { 
      cx = this.w * random(0.85, 0.95);
      cy = this.h * random(0.4, 0.7);
      centralAngle = PI;
      arcSpread = PI * 0.75;
    } else if (side === 2) { 
      cx = this.w * random(0.3, 0.7);
      cy = this.h * random(0.85, 0.95);
      centralAngle = -HALF_PI;
      arcSpread = PI * 0.75;
    } else { 
      cx = this.w * random(0.3, 0.7);
      cy = this.h * random(0.05, 0.15);
      centralAngle = HALF_PI;
      arcSpread = PI * 0.75;
    }

    let numBars = floor(random(11, 16)); 
    let fixedWidth = min(this.w, this.h) * random(0.07, 0.12); 

    for (let i = 0; i < numBars; i++) {
      let angle = map(i, 0, numBars - 1, centralAngle - arcSpread / 2, centralAngle + arcSpread / 2) + random(-0.04, 0.04);

      let maxDist = 9999;
      let cosA = cos(angle);
      let sinA = sin(angle);

      if (cosA > 0.0001) maxDist = min(maxDist, (this.w - cx - padding) / cosA);
      else if (cosA < -0.0001) maxDist = min(maxDist, (-cx + padding) / cosA);

      if (sinA > 0.0001) maxDist = min(maxDist, (this.h - cy - padding) / sinA);
      else if (sinA < -0.0001) maxDist = min(maxDist, (-cy + padding) / sinA);

      let lengthFactor = random(0.45, 0.96);
      let barLength = maxDist * lengthFactor;

      push();
      translate(cx, cy);
      rotate(angle);
      rectMode(CORNER);
      rect(0, -fixedWidth / 2, barLength, fixedWidth);
      pop();
    }
  }

  // --- MOTEUR 13 : Trame Modulaire Éditoriale ---
  drawHalftoneGrid() {
    fill(this.c.bg);
    noStroke();
    rect(0, 0, this.w, this.h);

    let gridCols = 12;
    let gridRows = 8;
    let cellW = this.w / gridCols;
    let cellH = this.h / gridRows;

    let grid = [];
    for (let i = 0; i < gridCols; i++) {
      grid[i] = [];
      for (let j = 0; j < gridRows; j++) {
        grid[i][j] = false;
      }
    }

    let zones = [];
    for (let attempts = 0; attempts < 35; attempts++) {
      let wCells = floor(random(2, 6));
      let hCells = floor(random(2, 5));
      let xCells = floor(random(0, gridCols - wCells + 1));
      let yCells = floor(random(0, gridRows - hCells + 1));

      let available = true;
      for (let i = xCells; i < xCells + wCells; i++) {
        for (let j = yCells; j < yCells + hCells; j++) {
          if (grid[i][j]) available = false;
        }
      }

      if (available) {
        for (let i = xCells; i < xCells + wCells; i++) {
          for (let j = yCells; j < yCells + hCells; j++) {
            grid[i][j] = true;
          }
        }
        zones.push({
          x: xCells * cellW,
          y: yCells * cellH,
          w: wCells * cellW,
          h: hCells * cellH,
          wCells: wCells,
          hCells: hCells
        });
      }
    }

    for (let i = 0; i < gridCols; i++) {
      for (let j = 0; j < gridRows; j++) {
        if (!grid[i][j]) {
          zones.push({
            x: i * cellW,
            y: j * cellH,
            w: cellW,
            h: cellH,
            wCells: 1,
            hCells: 1
          });
        }
      }
    }

    let fgColor = this.c.fg1;
    let altColor = this.c.fg2;

    for (let z of zones) {
      let normX = (z.x + z.w / 2) / this.w;
      let probSolid = map(normX, 0, 1, 0.75, 0.05);
      let randVal = random();

      let patternType;
      if (randVal < probSolid) {
        patternType = 0; 
      } else {
        if (normX < 0.4) {
          patternType = (random() < 0.6) ? 3 : 2; 
        } else {
          patternType = (random() < 0.6) ? 1 : 2; 
        }
      }

      let col = (random() > 0.35) ? fgColor : altColor;
      noStroke();

      if (patternType === 0) {
        fill(col);
        rect(z.x - 0.2, z.y - 0.2, z.w + 0.4, z.h + 0.4);
      } else {
        fill(this.c.bg);
        rect(z.x - 0.2, z.y - 0.2, z.w + 0.4, z.h + 0.4);

        fill(col);

        let baseSub = (patternType === 1) ? 3 : ((patternType === 2) ? 2 : 1);
        let subDivider = floor(baseSub + normX * 1.8);

        let totalCols = z.wCells * subDivider;
        let totalRows = z.hCells * subDivider;

        let inset = min(z.w, z.h) * 0.04;
        let innerW = z.w - inset * 2;
        let innerH = z.h - inset * 2;

        let stepX = innerW / totalCols;
        let stepY = innerH / totalRows;

        let windScale = map(normX, 0, 1, 0.85, 0.45);
        let dotDiam = min(stepX, stepY) * windScale;

        for (let sx = 0; sx < totalCols; sx++) {
          for (let sy = 0; sy < totalRows; sy++) {
            let px = z.x + inset + (sx + 0.5) * stepX;
            let py = z.y + inset + (sy + 0.5) * stepY;

            let n = noise(px * 0.015, py * 0.015);
            if (normX > 0.45 && n < map(normX, 0.45, 1, 0.1, 0.55)) {
              continue; 
            }

            ellipseMode(CENTER);
            ellipse(px, py, dotDiam);
          }
        }
      }
    }
  }

  // --- MOTEUR 14 : System Flag ---
  drawSimpleTrisectFlag() {
    let blackObj = { name: "BLACK", val: color(INK), isLight: false };
    let greyObj = { name: "WHITE", val: color(PAPER), isLight: true };
    const hex = '#' + [red(this.c.fg2), green(this.c.fg2), blue(this.c.fg2)].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase();
    let chosenAccent = { name: PRIMARIES[hex] || 'COLOR', val: this.c.fg2, isLight: hex === '#F0D818' || hex === '#18D848' };
    let colorPool = [blackObj, greyObj, chosenAccent];

    noStroke();

    let isFullJapanState = random() < 0.3;

    if (isFullJapanState) {
      let bgColObj = random(colorPool);
      let circleColObj = random(colorPool.filter(c => c.name !== bgColObj.name));

      fill(bgColObj.val);
      rect(0, 0, this.w, this.h);

      fill(circleColObj.val);
      let diam = min(this.w, this.h) * 0.5;
      circle(this.w / 2, this.h / 2, diam);

      let contrastColor = bgColObj.isLight ? color(INK) : color(0, 0, 98);
      fill(contrastColor);
      textSize(max(10, min(this.w, this.h) * 0.09));
      textAlign(LEFT, TOP);
      text(`[${bgColObj.name}]`, 12, 12);

    } else {
      let blockColors = shuffle([...colorPool]);

      let splitX = this.w * random(0.35, 0.65);
      let splitY = this.h * random(0.35, 0.65);

      let blocks = [
        { x: 0, y: 0, w: splitX, h: this.h },
        { x: splitX, y: 0, w: this.w - splitX, h: splitY },
        { x: splitX, y: splitY, w: this.w - splitX, h: this.h - splitY }
      ];

      let pad = 12;
      let minW = this.w * 0.12;
      let minH = this.h * 0.12;
      let blockData = [];

      for (let i = 0; i < blocks.length; i++) {
        let b = blocks[i];
        let colObj = blockColors[i];
        let hasCircle = (colObj.name === "GREY" && random() < 0.45);
        let circleCx = b.x + b.w / 2;
        let circleCy = b.y + b.h / 2;
        let circleRadius = 0;
        let circleColObj = null;

        if (hasCircle) {
          let availableCircleCols = colorPool.filter(c => c.name !== "GREY");
          circleColObj = random(availableCircleCols);
          let diam = min(b.w, b.h) * 0.45;
          circleRadius = diam / 2;
        }

        let hasText = (b.w > minW && b.h > minH);

        blockData.push({
          b: b,
          colObj: colObj,
          hasCircle: hasCircle,
          circleCx: circleCx,
          circleCy: circleCy,
          circleRadius: circleRadius,
          circleColObj: circleColObj,
          hasText: hasText,
          labelStr: `[${colObj.name}]`
        });
      }

      let uniformTSize = Infinity;

      for (let data of blockData) {
        if (!data.hasText) continue;

        let b = data.b;
        let bSize = max(10, min(b.w, b.h) * 0.09);

        if (data.hasCircle) {
          let safetyMargin = 6;
          let minAllowedDist = data.circleRadius + safetyMargin;

          push();
          while (bSize > 5) {
            textSize(bSize);
            let txtW = textWidth(data.labelStr);
            let cornerX = b.x + pad + txtW;
            let cornerY = b.y + pad + bSize;

            if (dist(cornerX, cornerY, data.circleCx, data.circleCy) >= minAllowedDist) {
              break;
            }
            bSize -= 0.5;
          }
          pop();
        }

        uniformTSize = min(uniformTSize, bSize);
      }

      if (uniformTSize === Infinity) {
        uniformTSize = max(10, min(this.w, this.h) * 0.09);
      }

      for (let data of blockData) {
        let b = data.b;

        fill(data.colObj.val);
        rect(b.x, b.y, b.w, b.h);

        if (data.hasCircle) {
          fill(data.circleColObj.val);
          circle(data.circleCx, data.circleCy, data.circleRadius * 2);
        }

        if (data.hasText) {
          let contrastColor = data.colObj.isLight ? color(INK) : color(0, 0, 98);

          push();
          noStroke();
          fill(contrastColor);
          textSize(uniformTSize);
          textAlign(LEFT, TOP);
          text(data.labelStr, b.x + pad, b.y + pad);
          pop();
        }
      }
    }
  }

  // --- MOTEUR 15 : Partition Harmonique de Phi ---
  drawChaoticPendulum() {
    fill(this.c.bg);
    noStroke();
    rect(0, 0, this.w, this.h);

    const PHI = (1 + sqrt(5)) / 2; 
    let col1 = (this.variantIndex === 1) ? this.c.fg2 : (random() > 0.5 ? this.c.fg1 : this.c.fg2);
    let col2 = (col1 === this.c.fg1) ? this.c.fg2 : this.c.fg1;

    let currX = 0, currY = 0, currW = this.w, currH = this.h;
    let depth = floor(random(4, 7));
    let boxes = [];

    for (let d = 0; d < depth; d++) {
      let isVert = currW > currH;
      let split = isVert ? currW / PHI : currH / PHI;

      if (isVert) {
        let leftW = (d % 2 === 0) ? split : currW - split;
        boxes.push({ x: currX, y: currY, w: leftW, h: currH, dir: d % 4 });
        currX += leftW;
        currW -= leftW;
      } else {
        let topH = (d % 2 === 0) ? split : currH - split;
        boxes.push({ x: currX, y: currY, w: currW, h: topH, dir: d % 4 });
        currY += topH;
        currH -= topH;
      }
    }
    boxes.push({ x: currX, y: currY, w: currW, h: currH, dir: depth % 4 });

    noStroke();
    for (let i = 0; i < boxes.length; i++) {
      let b = boxes[i];
      let bCol = (i % 2 === 0) ? col1 : col2;
      let altCol = (bCol === col1) ? col2 : this.c.bg;

      let bx = floor(b.x);
      let by = floor(b.y);
      let bw = floor(b.w + 1.5);
      let bh = floor(b.h + 1.5);

      fill(bCol);
      rect(bx, by, bw, bh);

      let style = floor(random(3));
      fill(altCol);

      if (style === 0) {
        let r = min(b.w, b.h) * 2;
        let corners = [
          { cx: floor(b.x), cy: floor(b.y), start: 0, stop: HALF_PI },
          { cx: floor(b.x + b.w), cy: floor(b.y), start: HALF_PI, stop: PI },
          { cx: floor(b.x + b.w), cy: floor(b.y + b.h), start: PI, stop: 1.5 * PI },
          { cx: floor(b.x), cy: floor(b.y + b.h), start: 1.5 * PI, stop: TWO_PI }
        ];
        let c = corners[b.dir];
        arc(c.cx, c.cy, r, r, c.start, c.stop);

      } else if (style === 1) {
        beginShape();
        if (b.dir % 2 === 0) {
          vertex(floor(b.x), floor(b.y));
          vertex(floor(b.x + b.w), floor(b.y + b.h));
          vertex(floor(b.x), floor(b.y + b.h));
        } else {
          vertex(floor(b.x + b.w), floor(b.y));
          vertex(floor(b.x + b.w), floor(b.y + b.h));
          vertex(floor(b.x), floor(b.y));
        }
        endShape(CLOSE);
      }
    }

    if (random() > 0.35) {
      let focalX = floor((random() > 0.5) ? this.w / PHI : this.w - (this.w / PHI));
      let focalY = floor((random() > 0.5) ? this.h / PHI : this.h - (this.h / PHI));

      let outerDiam = floor((min(this.w, this.h) / PHI) * 0.5);
      fill(this.c.bg);
      circle(focalX, focalY, outerDiam);

      fill(random() > 0.5 ? col1 : col2);
      circle(focalX, focalY, floor(outerDiam / PHI));
    }
  }
}