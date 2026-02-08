
// Neon Cyberpunk Theme Colors
const COLORS = {
  bg: '#050510',
  grid: '#1a1a3a',
  snake: '#00ff66',
  snakeTail: '#003366',
  snakeGlow: 'rgba(0, 255, 102, 0.4)',
  food: '#00f2ff',
  foodGlow: 'rgba(0, 242, 255, 0.5)',
  obstacle: '#ff00cc',
  obstacleGlow: 'rgba(255, 0, 204, 0.4)',
  ui: '#00f2ff',
  boundary: '#ff3366'
};

// Ensure Vehicle debug exists globally
if (typeof Vehicle !== 'undefined') {
  Vehicle.debug = false;
}

// Game snake mode variables
let snakes = []; // Array of snake bodies (each body is an array of Vehicles)
let gameFood = [];
let gameFoodVelocity = [];
let gameObstacles = [];
let gameScore = 0;
let sliderSnakeSpeed;
let sliderSeparation;
let numFoodPoints = 8;
let numObstacles = 6;
let foodDetectionRange = 100;
let snakeParticles = [];
let currentLevel = 1;
let fragsGoal = 20;
let gameState = "MENU"; // "MENU", "PLAYING", "SUCCESS", or "LOST"
let btnRestartLevel, btnNextLevel, btnResetGame, btnReplay, btnStart;
let gameEnemies = [];
let lastEnemySpawnTime = 0;
let enemySpawnInterval = 5000; // Spawn every 5 seconds
let enemyWaveSize = 1;
let bossEntity = null;
let bossProjectiles = [];

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Initialize UI (but keep hidden until PLAYING)
  sliderSnakeSpeed = createSlider(0.5, 5, 2, 0.5);
  sliderSnakeSpeed.position(20, 60);
  sliderSnakeSpeed.size(150);
  sliderSnakeSpeed.hide();

  sliderSeparation = createSlider(0, 100, 30, 1);
  sliderSeparation.position(20, 110);
  sliderSeparation.size(150);
  sliderSeparation.hide();

  // Show Start Menu
  showStartMenu();
}

function showStartMenu() {
  if (!btnStart) {
    btnStart = createButton('START GAME');
    btnStart.mousePressed(() => {
      btnStart.hide();
      initGame();
    });
    styleButton(btnStart, width / 2 - 80, height / 2 + 10);
  }
  btnStart.show();
}

function showStartUI() {
  push();
  // Deep space contrast
  fill(0, 0, 0, 150);
  rect(0, 0, width, height);

  textAlign(CENTER, CENTER);

  // Title Decoration
  noStroke();
  fill(COLORS.snakeGlow);
  textSize(120);
  text("CYBER-SNAKE", width / 2, height / 2 - 100);

  fill(COLORS.snake);
  textSize(116);
  text("CYBER-SNAKE", width / 2, height / 2 - 100);

  // Subtitle / Lore
  textSize(24);
  fill(COLORS.ui);

  fill(255, 200);
  textSize(16);

  // Controls hint
  fill(COLORS.obstacle);
  text("[D] TOGGLE DEBUG VIEW  |  [MOUSE] STEER SNAKE", width / 2, height / 2 + 130);
  pop();
}

function initGame() {
  snakes = [];
  spawnSnake(); // Start with one snake

  gameFood = [];
  gameFoodVelocity = [];
  gameObstacles = [];

  // Level configuration
  if (currentLevel === 1) {
    numObstacles = 6;
    fragsGoal = 20;
  } else if (currentLevel === 2) {
    numObstacles = 10;
    fragsGoal = 30;
    gameScore = 0;
    enemyWaveSize = 1;
  } else {
    // LEVEL 3: THE BOSS
    numObstacles = 12; // More obstacles
    fragsGoal = 40; // Survive/Grow to 40
    gameScore = 0;
    enemyWaveSize = 1;
    bossEntity = new Boss(width / 2, 100);
  }

  gameEnemies = [];
  bossProjectiles = [];
  lastEnemySpawnTime = millis();

  // Spawn random obstacles first
  for (let i = 0; i < numObstacles; i++) {
    gameObstacles.push(spawnObstacleAtSafeLocation());
  }

  // Then spawn food points at safe locations (avoiding obstacles)
  for (let i = 0; i < numFoodPoints; i++) {
    gameFood.push(spawnFoodAtSafeLocation());
    gameFoodVelocity.push(createVector(0, 0));
  }

  gameScore = 0;
  gameLost = false;
  gameState = "PLAYING";

  // Hide non-relevant menu buttons
  if (btnStart) btnStart.hide();
  if (btnRestartLevel) btnRestartLevel.hide();
  if (btnNextLevel) btnNextLevel.hide();
  if (btnResetGame) btnResetGame.hide();
  if (btnReplay) btnReplay.hide();

  // Show UI sliders
  sliderSnakeSpeed.show();
  sliderSeparation.show();
}

function spawnSnake() {
  let newSnake = [];
  newSnake.push(new SnakeHead(width / 2, height / 2));
  snakes.push(newSnake);
}

// appelée 60 fois par seconde
function draw() {
  background(COLORS.bg);

  // Draw sci-fi grid
  drawBackground();

  if (gameState === "MENU") {
    showStartUI();
  } else if (gameState === "PLAYING") {
    // Game snake logic
    displayGameSnake();

    // Check level completion
    if (gameScore >= fragsGoal) {
      gameState = "SUCCESS";
      showSuccessMenu();
    }

    // Check loss condition (all snakes destroyed)
    if (snakes.length === 0) {
      gameState = "LOST";
      showLostMenu();
    }
  } else if (gameState === "SUCCESS") {
    showSuccessUI();
  } else if (gameState === "LOST") {
    showLostUI();
  }

  // Level 2 Enemy Spawning Logic
  if (gameState === "PLAYING" && currentLevel >= 2) {
    if (millis() - lastEnemySpawnTime > enemySpawnInterval) {
      for (let i = 0; i < enemyWaveSize; i++) {
        spawnEnemy();
      }
      enemyWaveSize++; // Increase wave size for next time
      lastEnemySpawnTime = millis();
    }
  }

  // LEVEL 3 Boss Logic
  if (gameState === "PLAYING" && currentLevel === 3 && bossEntity) {
    bossEntity.show();

    // Firing logic
    if (millis() - bossEntity.lastShotTime > bossEntity.shootInterval) {
      // Find closest head to target
      let closestHead = null;
      let minDist = Infinity;
      snakes.forEach(s => {
        let d = p5.Vector.dist(bossEntity.pos, s[0].pos);
        if (d < minDist) {
          minDist = d;
          closestHead = s[0];
        }
      });

      if (closestHead) {
        let volley = bossEntity.fireVolley(closestHead);
        bossProjectiles.push(...volley);
        bossEntity.lastShotTime = millis();
      }
    }

    // Update Projectiles
    for (let i = bossProjectiles.length - 1; i >= 0; i--) {
      let p = bossProjectiles[i];
      p.update();
      p.show();

      // Collision check with snake heads
      let hit = false;
      for (let sIndex = snakes.length - 1; sIndex >= 0; sIndex--) {
        let snakeBody = snakes[sIndex];
        let head = snakeBody[0];
        if (head && p5.Vector.dist(p.pos, head.pos) < p.r + head.r) {
          // HEAVY HIT!
          gameScore = max(0, gameScore - 2);

          // Remove 2 segments
          for (let k = 0; k < 2; k++) {
            if (snakeBody.length > 0) snakeBody.pop();
          }

          // If snake is empty, remove it
          if (snakeBody.length === 0) {
            snakes.splice(sIndex, 1);
          }

          hit = true;
          break;
        }
      }

      if (hit || p.isOffscreen()) {
        bossProjectiles.splice(i, 1);
      }
    }
  }
}

function spawnEnemy() {
  let x, y;
  // Spawn from random edge
  if (random(1) > 0.5) {
    x = random(width);
    y = random(1) > 0.5 ? 0 : height;
  } else {
    x = random(1) > 0.5 ? 0 : width;
    y = random(height);
  }
  gameEnemies.push(new Enemy(x, y));
}

function showSuccessMenu() {
  sliderSnakeSpeed.hide();
  sliderSeparation.hide();

  if (currentLevel < 3) {
    if (!btnRestartLevel) {
      btnRestartLevel = createButton('RESTART LEVEL');
      btnRestartLevel.mousePressed(() => { initGame(); });
      styleButton(btnRestartLevel, width / 2 - 160, height / 2 + 50);
    }

    if (!btnNextLevel) {
      btnNextLevel = createButton('NEXT LEVEL');
      btnNextLevel.mousePressed(() => {
        currentLevel++;
        initGame();
      });
      styleButton(btnNextLevel, width / 2 + 40, height / 2 + 50);
    }
    btnRestartLevel.show();
    btnNextLevel.show();
  } else {
    // ULTIMATE VICTORY - REPLAY FROM START
    if (!btnReplay) {
      btnReplay = createButton('REPLAY GAME');
      btnReplay.mousePressed(() => {
        currentLevel = 1;
        initGame();
      });
      styleButton(btnReplay, width / 2 - 60, height / 2 + 50);
    }
    btnReplay.show();
  }
}

function styleButton(btn, x, y) {
  btn.position(x, y);
  btn.style('background-color', COLORS.snake);
  btn.style('color', COLORS.bg);
  btn.style('border', 'none');
  btn.style('padding', '10px 20px');
  btn.style('font-weight', 'bold');
  btn.style('cursor', 'pointer');
  btn.style('font-size', '16px');
  btn.style('border-radius', '4px');
  btn.style('box-shadow', '0 0 15px ' + COLORS.snakeGlow);
}

function showSuccessUI() {
  push();
  fill(0, 0, 0, 200);
  rect(0, 0, width, height);

  textAlign(CENTER, CENTER);
  fill(COLORS.snake);
  textSize(80);
  let msg = currentLevel === 3 ? "YOU WIN" : "SUCCESS";
  text(msg, width / 2, height / 2 - 50);

  textSize(24);
  fill(COLORS.ui);
  let subMsg = currentLevel === 3 ? "SYSTEM THREAT NEUTRALIZED. DOMINANCE RE-ESTABLISHED." : "LEVEL " + currentLevel + " COMPLETED";
  text(subMsg, width / 2, height / 2 + 10);
  pop();
}

function showLostMenu() {
  sliderSnakeSpeed.hide();
  sliderSeparation.hide();

  if (!btnResetGame) {
    btnResetGame = createButton('RESET GAME');
    btnResetGame.mousePressed(() => {
      currentLevel = 1; // RESET TO LEVEL 1
      initGame();
    });
    styleButton(btnResetGame, width / 2 - 60, height / 2 + 50);
  }
  btnResetGame.show();
}

function showLostUI() {
  push();
  fill(0, 0, 0, 220);
  rect(0, 0, width, height);

  textAlign(CENTER, CENTER);
  fill(COLORS.boundary);
  textSize(80);
  text("YOU LOOSE", width / 2, height / 2 - 50);

  textSize(24);
  fill(COLORS.ui);
  text("PLAYER DATA WIPED. COMMENCING REBOOT.", width / 2, height / 2 + 10);
  pop();
}

function drawBackground() {
  push();
  stroke(COLORS.grid);
  strokeWeight(1);

  // Grid lines
  let spacing = 50;
  for (let x = 0; x < width; x += spacing) {
    line(x, 0, x, height);
  }
  for (let y = 0; y < height; y += spacing) {
    line(0, y, width, y);
  }

  // Scanning line effect
  let scanY = (frameCount * 2) % height;
  stroke('rgba(0, 242, 255, 0.1)');
  strokeWeight(2);
  line(0, scanY, width, scanY);
  pop();

  // Boundary glow in debug mode
  if (typeof Vehicle !== 'undefined' && Vehicle.debug) {
    push();
    noFill();
    stroke(COLORS.boundary);
    strokeWeight(2);
    let d = 100;
    rect(d, d, width - 2 * d, height - 2 * d);
    pop();
  }
}

function mousePressed() {
  // Obstacle spawning via click REMOVED
}

function keyPressed() {
  if (key === 'd') {
    if (typeof Vehicle !== 'undefined') {
      Vehicle.debug = !Vehicle.debug;
    }
  } else if (key === 'g' || key === 'r') {
    initGame();
  }
}

function isPositionInObstacleRange(position) {
  for (let obstacle of gameObstacles) {
    // Check if food (r approx 10) is inside obstacle (r) + extra margin (20)
    if (p5.Vector.dist(position, obstacle.pos) < obstacle.r + 30) return true;
  }

  // Also avoid the Boss area if Level 3
  if (bossEntity) {
    if (p5.Vector.dist(position, bossEntity.pos) < bossEntity.r + 50) return true;
  }

  return false;
}

function spawnFoodAtSafeLocation() {
  let position;
  let margin = 120;
  let isSafe = false;
  while (!isSafe) {
    position = createVector(random(margin, width - margin), random(margin, height - margin));
    isSafe = !isPositionInObstacleRange(position);
  }
  return position;
}

function spawnObstacleAtSafeLocation() {
  let pos;
  let r;
  let margin = 120;
  let isSafe = false;
  let attempts = 0;

  while (!isSafe && attempts < 100) {
    let w = random(50, 100);
    r = w / 2;
    pos = createVector(random(margin, width - margin), random(margin, height - margin));

    // Check overlap with existing obstacles
    isSafe = true;
    for (let other of gameObstacles) {
      if (p5.Vector.dist(pos, other.pos) < r + other.r + 40) {
        isSafe = false;
        break;
      }
    }

    // Also avoid center (where snakes start)
    if (p5.Vector.dist(pos, createVector(width / 2, height / 2)) < r + 100) {
      isSafe = false;
    }

    // Also avoid Boss area
    if (bossEntity && p5.Vector.dist(pos, bossEntity.pos) < r + bossEntity.r + 50) {
      isSafe = false;
    } else if (currentLevel === 3 && pos.y < 300 && abs(pos.x - width / 2) < 200) {
      // Early safety check for Level 3 even if boss hasn't fully init yet in some loops
      isSafe = false;
    }

    attempts++;
  }

  return { pos: pos, r: r, w: r * 2, h: r * 2 };
}

function displayGameSnake() {
  // UI Display
  push();
  fill(COLORS.ui);
  noStroke();
  textSize(14);
  text("NEURAL SPEED: " + sliderSnakeSpeed.value().toFixed(1), 20, 50);
  text("SEPARATION: " + sliderSeparation.value().toFixed(1), 20, 105);

  text("STATUS: MANUAL LINK ACTIVE", 20, 85);

  stroke(COLORS.ui);
  strokeWeight(1);
  line(20, 135, 200, 135);
  pop();

  // Draw obstacles
  gameObstacles.forEach(obstacle => {
    push();
    translate(obstacle.pos.x, obstacle.pos.y);
    noFill();
    stroke(COLORS.obstacleGlow);
    strokeWeight(4);
    let pulse = 5 * sin(frameCount * 0.1);
    circle(0, 0, obstacle.r * 2 + pulse);
    fill(COLORS.obstacle);
    noStroke();
    circle(0, 0, obstacle.r * 1.5);
    stroke(255, 100);
    strokeWeight(2);
    noFill();
    rotate(frameCount * 0.02);
    rect(-obstacle.r / 2, -obstacle.r / 2, obstacle.r, obstacle.r);
    pop();
  });

  // Collect all heads for separation
  let allHeads = snakes.map(s => s[0]);
  let headTarget = createVector(mouseX, mouseY);

  // Update and show all snakes
  snakes.forEach(snakeBody => {
    let head = snakeBody[0];
    if (head) {
      head.maxSpeed = sliderSnakeSpeed.value() * 3;

      // Apply behaviors through the specialized class method
      head.applyBehaviors(headTarget, gameObstacles, allHeads, sliderSeparation.value());
      head.update();

      // Body segments behavior
      for (let i = 1; i < snakeBody.length; i++) {
        let current = snakeBody[i];
        let prev = snakeBody[i - 1];
        // Specialize body behavior: follow previous part and avoid obstacles
        current.applyBehaviors(prev.pos, gameObstacles);
        current.update();
      }

      // --- Visuals: Plasma Stream ---
      push();
      noFill();
      strokeCap(ROUND);
      strokeJoin(ROUND);

      for (let i = 0; i < snakeBody.length - 1; i++) {
        let size = map(i, 0, snakeBody.length, 25, 10);
        stroke(COLORS.snakeGlow);
        strokeWeight(size + 15);
        line(snakeBody[i].pos.x, snakeBody[i].pos.y, snakeBody[i + 1].pos.x, snakeBody[i + 1].pos.y);
      }

      for (let i = 0; i < snakeBody.length - 1; i++) {
        let percent = i / snakeBody.length;
        let col = lerpColor(color(COLORS.snake), color(COLORS.snakeTail), percent);
        let size = map(i, 0, snakeBody.length, 16, 6);
        stroke(col);
        strokeWeight(size);
        line(snakeBody[i].pos.x, snakeBody[i].pos.y, snakeBody[i + 1].pos.x, snakeBody[i + 1].pos.y);
        stroke(255, 150);
        strokeWeight(size * 0.3);
        line(snakeBody[i].pos.x, snakeBody[i].pos.y, snakeBody[i + 1].pos.x, snakeBody[i + 1].pos.y);
      }
      pop();

      // Use specialized show() for the head
      head.show();

      // Tail Particles
      if (snakeBody.length > 0) {
        let tail = snakeBody[snakeBody.length - 1];
        if (frameCount % 4 === 0) {
          snakeParticles.push({
            pos: createVector(tail.pos.x, tail.pos.y),
            vel: p5.Vector.random2D().mult(random(0.5, 1.5)),
            alpha: 255,
            col: color(COLORS.snakeTail)
          });
        }
      }
    }
  });

  // Particles update
  for (let i = snakeParticles.length - 1; i >= 0; i--) {
    let p = snakeParticles[i];
    p.pos.add(p.vel);
    p.alpha -= 5;
    if (p.alpha <= 0) {
      snakeParticles.splice(i, 1);
    } else {
      push();
      noStroke();
      p.col.setAlpha(p.alpha);
      fill(p.col);
      circle(p.pos.x, p.pos.y, map(p.alpha, 255, 0, 4, 0));
      pop();
    }
  }

  // Food
  gameFood.forEach((foodPoint, foodIndex) => {
    push();
    translate(foodPoint.x, foodPoint.y);
    rotate(frameCount * 0.05);
    let pulse = sin(frameCount * 0.1) * 5;
    noStroke();
    fill(COLORS.foodGlow);
    rect(-8 - pulse / 2, -8 - pulse / 2, 16 + pulse, 16 + pulse);
    fill(COLORS.food);
    stroke(255);
    strokeWeight(1);
    rect(-6, -6, 12, 12);
    pop();

    // All snakes try to eat food
    snakes.forEach(snakeBody => {
      let head = snakeBody[0];
      if (head && p5.Vector.dist(head.pos, foodPoint) < 20) {
        gameScore++;
        let lastPart = snakeBody[snakeBody.length - 1];
        // Initialization of new segment follows the rules
        snakeBody.push(new SnakeSegment(lastPart.pos.x, lastPart.pos.y));
        gameFood[foodIndex] = spawnFoodAtSafeLocation();
      }
    });
  });

  // Update and draw Enemies (Level 2+)
  for (let i = gameEnemies.length - 1; i >= 0; i--) {
    let enemy = gameEnemies[i];

    // Find closest snake head to pursue
    let closestHead = null;
    let minDist = Infinity;
    snakes.forEach(s => {
      if (s[0]) {
        let d = p5.Vector.dist(enemy.pos, s[0].pos);
        if (d < minDist) {
          minDist = d;
          closestHead = s[0];
        }
      }
    });

    if (closestHead) {
      enemy.applyBehaviors(closestHead, gameObstacles, gameEnemies);
    }
    enemy.update();
    enemy.show();

    // Collision check with snake heads
    for (let sIndex = snakes.length - 1; sIndex >= 0; sIndex--) {
      let snakeBody = snakes[sIndex];
      let head = snakeBody[0];
      if (head && p5.Vector.dist(enemy.pos, head.pos) < enemy.r + head.r) {
        // HIT! 
        gameScore = max(0, gameScore - 1);

        // Remove a segment
        snakeBody.pop();

        // If snake is empty, remove it
        if (snakeBody.length === 0) {
          snakes.splice(sIndex, 1);
        }

        // Remove enemy
        gameEnemies.splice(i, 1);
        break; // Stop checking other snakes for this enemy
      }
    }
  }

  // Global Frags UI
  push();
  fill(COLORS.ui);
  noStroke();
  textSize(24);
  textAlign(RIGHT);
  text("TOTAL FRAGS: " + gameScore, width - 40, 50);
  pop();
}

/**
 * Shared utility to draw a vector arrow for debugging
 */
function drawVector(pos, v, color) {
  push();
  strokeWeight(3);
  stroke(color || 255);
  line(pos.x, pos.y, pos.x + v.x, pos.y + v.y);
  let arrowSize = 6;
  translate(pos.x + v.x, pos.y + v.y);
  rotate(v.heading());
  translate(-arrowSize / 2, 0);
  triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
  pop();
}

// Global debug property for Vehicle class compatibility
Vehicle.debug = false;