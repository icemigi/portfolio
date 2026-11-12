// ==========================================
// CONFIGURATION GLOBALE ET CONSTANTES
// ==========================================
const INSTA_WIDTH = 1080;   
const INSTA_HEIGHT = 1350;  

const BG_COLOR = [15, 15, 18];       
const TEXT_COLOR = [240, 240, 235];  
const FONT_SIZE = 1200;              
const TRACKING = 0.95;               
const IMAGE_SCALE = 1.2;             

let cols, rows;             
let resolution = 4;         
let grid, nextGrid;         
let baseContourMask;        
let dynamicContourMask;     
let currentText = "a";      
let canvas;                 

let customImage = null;
let food;

let charCenters = [];       
const STEP_DELAY = 1;       
let simulationFrameCount = 0; 

let sphereBrushes = {
    small: [],   
    medium: [],  
    large: []    
};
let frameTimer = 0;         

// --- SÉQUENCE DE MORPHING EN BOUCLE (A -> Z) ---
const MORPH_SEQUENCE = "abcdefghijklmnopqrstuvwxyz";
let isMorphBatching = false;
let morphBatchZip;

// --- VARIABLES BATCH 200 FRAMES IMAGE ---
let isImageBatching = false;    
let imageBatchWarmup = 0;       
let imageBatchFrame = 0;        
let imageBatchZip;              

// --- CACHE & PRÉ-CHARGEMENT À LA DEMANDE (TOUCHE 'P') ---
let maskCache = {};
let isPreloadingAll = false;
let loadIndex = 0;
let isMorphing = false;
let morphProgress = 0.0;
let morphDuration = 25; // 25 frames pour le morphing
let maskA, maskB;
let centersA = [], centersB = [];

// ==========================================
// INITIALISATION DE L'ENVIRONNEMENT
// ==========================================
function setup() {
    canvas = createCanvas(INSTA_WIDTH, INSTA_HEIGHT); 
    pixelDensity(1);                                    
    
    canvas.parent('stage');

    cols = width / resolution;
    rows = height / resolution;
    
    grid = new Float32Array(cols * rows);
    nextGrid = new Float32Array(cols * rows);
    baseContourMask = new Float32Array(cols * rows);
    dynamicContourMask = new Float32Array(cols * rows);
    food = new Float32Array(cols * rows); // nourriture déposée à la souris, qui s'épuise
    
    buildSphereBrush(sphereBrushes.small, resolution * 0.6);
    buildSphereBrush(sphereBrushes.medium, resolution * 1.0);
    buildSphereBrush(sphereBrushes.large, resolution * 1.6);
    
    updateMaskSource();
}

function handleFile(file) {
    if (isMorphBatching || isImageBatching || isMorphing) return; 
    if (file.type === 'image') { 
        loadImage(file.data, (img) => {
            customImage = img;      
            updateMaskSource();     
        });
    } else {
        console.log("Veuillez importer un fichier image valide (PNG)."); 
    }
}

// ==========================================
// PRÉ-CALCUL DES PINCEAUX SPHÉRIQUES (HALFTONE)
// ==========================================
function buildSphereBrush(targetArray, radius) {
    let cx = radius / 2;             
    let rInt = ceil(radius);         
    for (let py = -rInt; py <= rInt; py++) {       
        for (let px = -rInt; px <= rInt; px++) {   
            let d = dist(px, py, 0, 0);            
            if (d <= cx) {                         
                let factor = map(d, 0, cx, 1.2, 0.25); 
                let pixelOffset = (px + py * width) * 4; 
                targetArray.push({ offset: pixelOffset, factor: factor }); 
            }
        }
    }
}

// ==========================================
// GÉNÉRATEUR DE MASQUE OPTIMISÉ (TEXTE)
// ==========================================
function generateMaskForText(txt) {
    if (maskCache[txt]) {
        return maskCache[txt];
    }

    let targetMask = createGraphics(width, height);
    targetMask.pixelDensity(1);
    targetMask.background(0);      
    targetMask.fill(255);          
    targetMask.noStroke();         
    targetMask.textFont('Helvetica');
    targetMask.textAlign(CENTER, CENTER); 
    targetMask.textStyle(BOLD);           
    targetMask.textSize(FONT_SIZE);        

    let localCenters = [];
    let charCenterX = width / 2;
    let charCenterY = height / 2;
    
    targetMask.push();                        
    targetMask.translate(charCenterX, charCenterY); 
    targetMask.text(txt, 0, 0);              
    targetMask.pop();                         
    
    localCenters.push({
        x: charCenterX / resolution,
        y: charCenterY / resolution
    });

    targetMask.loadPixels(); 
    let localContour = new Float32Array(cols * rows);
    let rawMask = new Uint8Array(cols * rows);
    
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            let px = floor(x * resolution + resolution / 2); 
            let py = floor(y * resolution + resolution / 2); 
            let maskIdx = (px + py * width) * 4;             
            if (targetMask.pixels[maskIdx] > 127) {            
                rawMask[x + y * cols] = 1;                   
            }
        }
    }

    let noiseScale = 0.08;  
    let noiseOffset = 42;   
    
    for (let y = 4; y < rows - 4; y++) {
        for (let x = 4; x < cols - 4; x++) {
            let i = x + y * cols;
            let isBorder = false;
            
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    let cx = x + dx;
                    let cy = y + dy;
                    if (cx >= 0 && cx < cols && cy >= 0 && cy < rows) {
                        if (rawMask[cx + cy * cols] !== rawMask[i]) {
                            isBorder = true;
                        }
                    }
                }
            }
            
            if (isBorder) {
                let nVal = noise(x * noiseScale + noiseOffset, y * noiseScale + noiseOffset);
                let maxDist = floor(map(nVal, 0, 1, 1, 8));
                
                for (let dy = -maxDist; dy <= maxDist; dy++) {
                    for (let dx = -maxDist; dx <= maxDist; dx++) {
                        let cx = x + dx;
                        let cy = y + dy;
                        if (cx >= 4 && cx < cols - 4 && cy >= 4 && cy < rows - 4) { 
                            let idx = cx + cy * cols;
                            let d = dist(0, 0, dx, dy);
                            let falloff = map(d, 0, maxDist, 1.0, 0.05);
                            falloff *= noise(cx * 0.12 + noiseOffset, cy * 0.12 + noiseOffset);
                            
                            if (falloff > localContour[idx]) {
                                localContour[idx] = constrain(falloff, 0, 1);
                            }
                        }
                    }
                }
            }
        }
    }

    maskCache[txt] = { contour: localContour, centers: localCenters };
    return maskCache[txt];
}

// ==========================================
// MISE À JOUR DE LA SOURCE DU MASQUE
// ==========================================
function updateMaskSource() {
    frameTimer = 0;              
    simulationFrameCount = 0;
    baseContourMask.fill(0);     
    grid.fill(0);                
    charCenters = [];            
    isMorphing = false;
    
    if (customImage !== null) {
        let targetMask = createGraphics(width, height);
        targetMask.pixelDensity(1);
        targetMask.background(0);      
        targetMask.imageMode(CENTER); 
        
        let imgAspect = customImage.width / customImage.height; 
        let drawW = width * 0.70 * IMAGE_SCALE;                 
        let drawH = drawW / imgAspect;                          
        
        if (drawH > height * 0.70 * IMAGE_SCALE) {              
            drawH = height * 0.70 * IMAGE_SCALE;
            drawW = drawH * imgAspect;
        }
        
        targetMask.image(customImage, width / 2, height / 2, drawW, drawH); 
        charCenters.push({
            x: (width / 2) / resolution,
            y: (height / 2) / resolution
        });
        
        targetMask.loadPixels(); 
        let rawMask = new Uint8Array(cols * rows);
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                let px = floor(x * resolution + resolution / 2); 
                let py = floor(y * resolution + resolution / 2); 
                let maskIdx = (px + py * width) * 4;             
                if (targetMask.pixels[maskIdx] > 127) {            
                    rawMask[x + y * cols] = 1;                   
                }
            }
        }

        let noiseScale = 0.08;  
        let noiseOffset = 42;   
        
        for (let y = 4; y < rows - 4; y++) {
            for (let x = 4; x < cols - 4; x++) {
                let i = x + y * cols;
                let isBorder = false;
                
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        let cx = x + dx;
                        let cy = y + dy;
                        if (cx >= 0 && cx < cols && cy >= 0 && cy < rows) {
                            if (rawMask[cx + cy * cols] !== rawMask[i]) {
                                isBorder = true;
                            }
                        }
                    }
                }
                
                if (isBorder) {
                    let nVal = noise(x * noiseScale + noiseOffset, y * noiseScale + noiseOffset);
                    let maxDist = floor(map(nVal, 0, 1, 1, 8));
                    
                    for (let dy = -maxDist; dy <= maxDist; dy++) {
                        for (let dx = -maxDist; dx <= maxDist; dx++) {
                            let cx = x + dx;
                            let cy = y + dy;
                            if (cx >= 4 && cx < cols - 4 && cy >= 4 && cy < rows - 4) { 
                                let idx = cx + cy * cols;
                                let d = dist(0, 0, dx, dy);
                                let falloff = map(d, 0, maxDist, 1.0, 0.05);
                                falloff *= noise(cx * 0.12 + noiseOffset, cy * 0.12 + noiseOffset);
                                
                                if (falloff > baseContourMask[idx]) {
                                    baseContourMask[idx] = constrain(falloff, 0, 1);
                                }
                            }
                        }
                    }
                }
            }
        }
    } else {
        let res = generateMaskForText(currentText);
        baseContourMask = new Float32Array(res.contour);
        charCenters = JSON.parse(JSON.stringify(res.centers));
    }

    for (let i = 0; i < grid.length; i++) {
        if (baseContourMask[i] > 0.1 && random() < 0.85) {
            grid[i] = 1.0;
        }
    }
}

// ==========================================
// DÉCLENCHEMENT DU MORPHISME
// ==========================================
function startMorph(charTo) {
    if (customImage !== null || isMorphBatching || isImageBatching) return;
    
    maskA = new Float32Array(baseContourMask);
    centersA = JSON.parse(JSON.stringify(charCenters));
    
    let resB = generateMaskForText(charTo);
    maskB = resB.contour;
    centersB = resB.centers;
    
    isMorphing = true;
    morphProgress = 0.0;
    simulationFrameCount = 0;
}

// ==========================================
// MISE À JOUR DU MASQUE DYNAMIQUE & MORPH
// ==========================================
function updateDynamicMask() {
    let t = simulationFrameCount * 0.04;   
    let noiseScale = 0.09;        

    if (isMorphing) {
        morphProgress += 1.0 / morphDuration;
        if (morphProgress >= 1.0) {
            morphProgress = 1.0;
            isMorphing = false;
            baseContourMask = maskB;
            charCenters = centersB;
        } else {
            for (let i = 0; i < baseContourMask.length; i++) {
                baseContourMask[i] = lerp(maskA[i], maskB[i], morphProgress);
            }
            if (centersA.length > 0 && centersB.length > 0) {
                charCenters[0].x = lerp(centersA[0].x, centersB[0].x, morphProgress);
                charCenters[0].y = lerp(centersA[0].y, centersB[0].y, morphProgress);
            }
        }
    }

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            let i = x + y * cols;
            if (x < 4 || x >= cols - 4 || y < 4 || y >= rows - 4) {
                dynamicContourMask[i] = 0;
            } else {
                let baseVal = baseContourMask[i];
                if (baseVal < 0.05) {
                    dynamicContourMask[i] = 0;
                } else {
                    let n = noise(x * noiseScale, y * noiseScale, t);
                    let factor = map(n, 0, 1, 0.2, 1.8); 
                    dynamicContourMask[i] = constrain(baseVal * factor, 0, 1);
                }
            }
        }
    }
}

// ==========================================
// GESTION DES ENTRÉES CLAVIER
// ==========================================
function keyTyped() {
    if (isMorphBatching || isImageBatching || key.length !== 1 || !key.trim()) return;
    currentText = key;
    if (customImage !== null) { customImage = null; updateMaskSource(); return; }
    startMorph(key);
}

function keyPressed() {
    if (isMorphBatching || isImageBatching) return; 

    if (keyCode === ESCAPE) {
        customImage = null;
        currentText = "a";
        isMorphing = false;
        grid.fill(0);
        baseContourMask.fill(0);
        dynamicContourMask.fill(0);
        charCenters = [];
        updateMaskSource();
    }
}

// ==========================================
// BATCH SÉQUENTIEL ASYNCHRONE DE MORPHING (50 STATIQUES + 25 MORPH)
// ==========================================
async function startMorphBatchExport() {
    if (isMorphBatching || isImageBatching) return;
    isMorphBatching = true;
    noLoop(); 

    console.log("Pré-chargement et cache de toutes les lettres de la séquence...");
    morphBatchZip = new JSZip();

    let cachedMasks = {};
    for (let i = 0; i < MORPH_SEQUENCE.length; i++) {
        let char = MORPH_SEQUENCE[i];
        cachedMasks[char] = generateMaskForText(char);
    }

    let frameNum = 0;
    console.log("Génération de la séquence de morphing (1950 frames au total)...");

    let firstRes = cachedMasks[MORPH_SEQUENCE[0]];
    baseContourMask = new Float32Array(firstRes.contour);
    charCenters = JSON.parse(JSON.stringify(firstRes.centers));
    grid.fill(0);
    for (let i = 0; i < grid.length; i++) {
        if (baseContourMask[i] > 0.1) grid[i] = 1.0;
    }

    for (let idx = 0; idx < MORPH_SEQUENCE.length; idx++) {
        let charA = MORPH_SEQUENCE[idx];
        let charB = MORPH_SEQUENCE[(idx + 1) % MORPH_SEQUENCE.length];

        let resA = cachedMasks[charA];
        let resB = cachedMasks[charB];

        // Phase A : 50 frames de lettre statique
        for (let f = 0; f < 50; f++) {
            frameNum++;
            baseContourMask = new Float32Array(resA.contour);
            charCenters = JSON.parse(JSON.stringify(resA.centers));

            runSingleSimulationStep();
            renderToPixels();

            let blob = await getCanvasBlob(canvas);
            morphBatchZip.file(String(frameNum).padStart(4, '0') + '.png', blob);
        }

        // Phase B : 25 frames de morphing fluide vers la lettre suivante
        let mskA = resA.contour;
        let mskB = resB.contour;
        let ctrA = resA.centers;
        let ctrB = resB.centers;

        for (let f = 1; f <= 25; f++) {
            frameNum++;
            let morphProg = f / 25.0;

            for (let i = 0; i < baseContourMask.length; i++) {
                baseContourMask[i] = lerp(mskA[i], mskB[i], morphProg);
            }
            if (ctrA.length > 0 && ctrB.length > 0) {
                charCenters[0].x = lerp(ctrA[0].x, ctrB[0].x, morphProg);
                charCenters[0].y = lerp(ctrA[0].y, ctrB[0].y, morphProg);
            }

            runSingleSimulationStep();
            renderToPixels();

            let blob = await getCanvasBlob(canvas);
            morphBatchZip.file(String(frameNum).padStart(4, '0') + '.png', blob);
        }

        baseContourMask = new Float32Array(resB.contour);
        charCenters = JSON.parse(JSON.stringify(resB.centers));
    }

    console.log("Compression de l'archive ZIP en cours...");
    let content = await morphBatchZip.generateAsync({ type: "blob" });
    saveAs(content, "morph_loop_1950_frames.zip");
    console.log("Export ZIP de la séquence de morphing terminé avec succès !");

    isMorphBatching = false;
    loop(); 
}

function getCanvasBlob(cvs) {
    return new Promise((resolve) => {
        cvs.elt.toBlob((blob) => {
            resolve(blob);
        }, 'image/png');
    });
}

function startImageBatch() {
    if (customImage === null) {
        console.log("Veuillez d'abord importer un PNG.");
        return;
    }
    if (isMorphBatching || isImageBatching) return;

    isImageBatching = true;
    imageBatchWarmup = 0;
    imageBatchFrame = 0;
    imageBatchZip = new JSZip();
}

// ==========================================
// BOUCLE DE RENDU & SIMULATION STANDARD
// ==========================================
function draw() {
    if (isMorphBatching || isImageBatching) return;

    if (isPreloadingAll && loadIndex < MORPH_SEQUENCE.length) {
        let chunkSize = 2; 
        let endIdx = min(loadIndex + chunkSize, MORPH_SEQUENCE.length);
        
        for (let i = loadIndex; i < endIdx; i++) {
            generateMaskForText(MORPH_SEQUENCE[i]);
        }
        
        loadIndex = endIdx;
        
        let progress = floor((loadIndex / MORPH_SEQUENCE.length) * 100);
        push();
        fill(0, 255, 150);
        noStroke();
        textSize(20);
        textAlign(LEFT, TOP);
        text(`PRÉ-CHARGEMENT EN ARRIÈRE-PLAN : ${progress}%`, 40, 80);
        pop();

        if (loadIndex >= MORPH_SEQUENCE.length) {
            isPreloadingAll = false;
            console.log("Pré-chargement global terminé avec succès !");
        }
    }

    if (isImageBatching) {
        imageBatchWarmup++;

        if (imageBatchWarmup <= 60) {
            runSingleSimulationStep();
            renderToPixels();
            push();
            fill(255, 150, 0);
            noStroke();
            textSize(24);
            textAlign(LEFT, TOP);
            text(`STABILISATION...\nChauffe : ${imageBatchWarmup} / 60`, 40, 80);
            pop();
            return;
        }

        if (window._isCapturing) {
            return; 
        }

        if (imageBatchFrame < 200) {
            window._isCapturing = true;
            imageBatchFrame++;
            let currentFrameNum = imageBatchFrame;

            runSingleSimulationStep();
            renderToPixels();

            canvas.elt.toBlob((blob) => {
                imageBatchZip.file(`frame_${currentFrameNum}.png`, blob);
                window._isCapturing = false;

                if (currentFrameNum >= 200) {
                    isImageBatching = false;
                    imageBatchZip.generateAsync((content) => {
                        saveAs(content, "image_batch_200_frames.zip");
                        console.log("Export ZIP Image 200 frames terminé !");
                    });
                }
            }, 'image/png');

            push();
            fill(0, 255, 150);
            noStroke();
            textSize(24);
            textAlign(LEFT, TOP);
            text(`EXPORT SÉQUENTIEL...\nProgression : ${imageBatchFrame} / 200`, 40, 80);
            pop();
            return;
        }
    }

    frameTimer++;
    if (frameTimer >= STEP_DELAY) {
        frameTimer = 0;
        runSingleSimulationStep();
    }
    renderToPixels();
}

function runSingleSimulationStep() {
    simulationFrameCount++; 
    updateDynamicMask(); 
    for (let i = 0; i < food.length; i++) if (food[i] > 0.01) { if (food[i] > dynamicContourMask[i]) dynamicContourMask[i] = food[i]; food[i] *= 0.988; } else food[i] = 0;
    
    let waveTime = simulationFrameCount * 0.1; 
    
    for (let y = 4; y < rows - 4; y++) {
        for (let x = 4; x < cols - 4; x++) {
            let i = x + y * cols;
            let maskVal = dynamicContourMask[i];
            
            if (maskVal <= 0.02) {
                nextGrid[i] = 0;
                continue;
            }
            
            let interference = 0;
            if (charCenters.length > 0) {
                for (let cc = 0; cc < charCenters.length; cc++) {
                    let d = dist(x, y, charCenters[cc].x, charCenters[cc].y);
                    interference += sin(d * 0.2 - waveTime);
                }
                interference = interference / charCenters.length; 
            }
            
            let val = grid[i];
            let alive = val > 0.5 ? 1 : 0;
            let sum = 0; 
            
            for (let i_y = -1; i_y <= 1; i_y++) {
                for (let i_x = -1; i_x <= 1; i_x++) {
                    if (i_x === 0 && i_y === 0) continue;
                    let col = x + i_x;
                    let row = y + i_y;
                    if (col >= 0 && col < cols && row >= 0 && row < rows) {
                        if (grid[col + row * cols] > 0.5) sum++;
                    }
                }
            }
            
            let nextAlive = 0;
            if (alive === 1 && (sum === 2 || sum === 3)) nextAlive = 1;
            else if (alive === 0 && sum === 3) nextAlive = 1;
            
            let modThreshold = 0.30 + interference * 0.06; 
            
            if (alive === 0 && maskVal > modThreshold && random() < (0.035 + interference * 0.003) * maskVal) {
                nextAlive = 1;
            }

            if (nextAlive === 1 && maskVal < modThreshold && random() > maskVal) {
                nextAlive = 0;
            }
            
            if (nextAlive === 1) {
                nextGrid[i] = 1.0;
            } else {
                nextGrid[i] = val * 0.70; 
            }
        }
    }
    let temp = grid;
    grid = nextGrid;
    nextGrid = temp;
}

function renderToPixels() {
    background(BG_COLOR[0], BG_COLOR[1], BG_COLOR[2]); 
    loadPixels();
    for (let y = 2; y < rows - 2; y++) {
        let yResWidth = y * resolution * width;
        for (let x = 2; x < cols - 2; x++) {
            let idxGrid = x + y * cols;
            let val = grid[idxGrid];
            
            if (val > 0.05) { 
                let maskVal = dynamicContourMask[idxGrid];
                let baseNorm = val; 
                let baseIdx = (x * resolution + yResWidth) * 4;
                
                let brush;
                if (maskVal > 0.45) {
                    brush = sphereBrushes.small;   
                } else if (maskVal > 0.20) {
                    brush = sphereBrushes.medium;  
                } else {
                    brush = sphereBrushes.large;   
                }
                
                for (let i = 0; i < brush.length; i++) {
                    let bInfo = brush[i];
                    let pixIdx = baseIdx + bInfo.offset;
                    
                    if (pixIdx >= 0 && pixIdx < pixels.length - 3) {
                        let intensity = constrain(baseNorm * bInfo.factor, 0, 1);
                        let redVal   = lerp(BG_COLOR[0], TEXT_COLOR[0], intensity);
                        let greenVal = lerp(BG_COLOR[1], TEXT_COLOR[1], intensity);
                        let blueVal  = lerp(BG_COLOR[2], TEXT_COLOR[2], intensity);
                        
                        pixels[pixIdx]     = redVal;   
                        pixels[pixIdx + 1] = greenVal; 
                        pixels[pixIdx + 2] = blueVal;  
                        pixels[pixIdx + 3] = 255;      
                    }
                }
            }
        }
    }
    updatePixels(); 
}

// ==========================================
// INTERACTION : nourrir à la souris, déposer une image, inverser, enregistrer, filmer
// ==========================================
function feed(mx, my) {
    const cx = mx / resolution, cy = my / resolution, r = 11;
    for (let y = Math.max(4, Math.floor(cy - r)); y < Math.min(rows - 4, cy + r); y++)
        for (let x = Math.max(4, Math.floor(cx - r)); x < Math.min(cols - 4, cx + r); x++) {
            const d = Math.hypot(x - cx, y - cy) / r;
            if (d > 1) continue;
            const i = x + y * cols, v = 0.95 * (1 - d * d);
            if (v > food[i]) food[i] = v;
            if (Math.random() < 0.18 * (1 - d)) grid[i] = 1;
        }
}
function mouseDragged() { if (mouseX >= 0 && mouseY >= 0 && mouseX < width && mouseY < height) feed(mouseX, mouseY); }
function mousePressed() { if (mouseX >= 0 && mouseY >= 0 && mouseX < width && mouseY < height) feed(mouseX, mouseY); }
function touchMoved() { mouseDragged(); return false; }

(() => {
    const $ = (s) => document.querySelector(s);
    if (window.top !== window) document.body.classList.add('in-room'); // dans une salle du Lab : la barre passe sous le menu du site
    const useImage = (file) => { if (!file || !/^image\//.test(file.type)) return; const url = URL.createObjectURL(file); loadImage(url, (img) => { customImage = img; updateMaskSource(); }); };
    $('#pick').onclick = () => $('#file').click();
    $('#file').onchange = (e) => useImage(e.target.files[0]);
    addEventListener('dragover', (e) => { e.preventDefault(); document.body.classList.add('over'); });
    addEventListener('dragleave', () => document.body.classList.remove('over'));
    addEventListener('drop', (e) => { e.preventDefault(); document.body.classList.remove('over'); useImage(e.dataTransfer.files[0]); });
    $('#invert').onclick = () => { for (let k = 0; k < 3; k++) [BG_COLOR[k], TEXT_COLOR[k]] = [TEXT_COLOR[k], BG_COLOR[k]]; document.body.classList.toggle('light'); };
    $('#save').onclick = () => saveCanvas('lettres-qui-poussent', 'png');
    const rec = $('#rec');
    rec.onclick = () => {
        if (!window.MediaRecorder || rec.dataset.on) return;
        const type = ['video/mp4', 'video/webm;codecs=vp9', 'video/webm'].find((t) => MediaRecorder.isTypeSupported(t)) || '';
        const mr = new MediaRecorder(canvas.elt.captureStream(30), type ? { mimeType: type, videoBitsPerSecond: 8e6 } : undefined), parts = [];
        mr.ondataavailable = (e) => e.data.size && parts.push(e.data);
        mr.onstop = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(parts, { type: mr.mimeType })); a.download = 'lettres-qui-poussent.' + (/mp4/.test(mr.mimeType) ? 'mp4' : 'webm'); a.click(); rec.textContent = 'vidéo 6 s'; delete rec.dataset.on; };
        rec.dataset.on = '1'; mr.start(); let t = 6; rec.textContent = `● ${t} s`;
        const iv = setInterval(() => { t--; rec.textContent = `● ${t} s`; if (t <= 0) { clearInterval(iv); mr.stop(); } }, 1000);
    };
})();
