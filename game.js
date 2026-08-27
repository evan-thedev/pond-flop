// Game state and physics using Matter.js

const { Engine, Render, World, Bodies, Body, Events, Runner, Constraint } = Matter;

let engine, render, runner, world;
let player1, player2, pond;
let player1Line, player2Line;
let player1Hooked = null;
let player2Hooked = null;
let gameState = {
  round: 1,
  totalRounds: 3,
  player1Score: 0,
  player2Score: 0,
  roundStartTime: 0,
  player1Flopped: false,
  player2Flopped: false
};

const COLORS = {
  player: '#FF6B6B',
  fish: '#4ECDC4',
  junk: '#95A5A6',
  pond: '#2E86AB',
  ground: '#8B4513'
};

function initGame() {
  const canvas = document.getElementById('canvas');
  const width = window.innerWidth;
  const height = window.innerHeight;

  // Create engine
  engine = Engine.create();
  world = engine.world;
  world.gravity.y = 1;

  // Create renderer
  render = Render.create({
    canvas: canvas,
    engine: engine,
    options: {
      width: width,
      height: height,
      wireframes: false,
      background: '#87CEEB'
    }
  });

  // Ground
  const groundHeight = 50;
  const ground = Bodies.rectangle(width / 2, height - groundHeight / 2, width, groundHeight, {
    isStatic: true,
    render: { fillStyle: COLORS.ground }
  });

  // Pond (middle)
  const pondWidth = width * 0.4;
  const pondHeight = 150;
  pond = Bodies.rectangle(width / 2, height - groundHeight - pondHeight / 2, pondWidth, pondHeight, {
    isStatic: true,
    isSensor: true,
    render: { fillStyle: COLORS.pond },
    label: 'pond'
  });

  // Players (standing on sides)
  const playerRadius = 20;
  const playerY = height - groundHeight - playerRadius - 10;
  
  player1 = Bodies.circle(width * 0.2, playerY, playerRadius, {
    density: 0.04,
    friction: 0.8,
    restitution: 0.3,
    render: { fillStyle: COLORS.player },
    label: 'player1'
  });

  player2 = Bodies.circle(width * 0.8, playerY, playerRadius, {
    density: 0.04,
    friction: 0.8,
    restitution: 0.3,
    render: { fillStyle: COLORS.player },
    label: 'player2'
  });

  World.add(world, [ground, pond, player1, player2]);

  // Start engine
  runner = Runner.create();
  Runner.run(runner, engine);
  Render.run(render);

  // Input handlers
  setupInput();

  // Collision detection
  Events.on(engine, 'collisionStart', handleCollisions);

  // Start round
  startRound();
}

function setupInput() {
  const canvas = document.getElementById('canvas');
  
  // Keyboard
  document.addEventListener('keydown', (e) => {
    if (e.key === 'w' || e.key === 'W') castLine(1);
    if (e.key === 's' || e.key === 'S') yankLine(1);
    if (e.key === 'ArrowUp') castLine(2);
    if (e.key === 'ArrowDown') yankLine(2);
  });

  // Touch
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const canvasWidth = rect.width;
    
    if (x < canvasWidth / 2) {
      castLine(1);
    } else {
      castLine(2);
    }
  });

  let touchStartY = 0;
  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    if (touchStartY === 0) {
      touchStartY = touch.clientY;
    } else {
      const deltaY = touch.clientY - touchStartY;
      if (deltaY > 30) {
        const rect = canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const canvasWidth = rect.width;
        
        if (x < canvasWidth / 2) {
          yankLine(1);
        } else {
          yankLine(2);
        }
        touchStartY = 0;
      }
    }
  });

  canvas.addEventListener('touchend', () => {
    touchStartY = 0;
  });
}

function castLine(playerNum) {
  const player = playerNum === 1 ? player1 : player2;
  const hooked = playerNum === 1 ? player1Hooked : player2Hooked;
  const line = playerNum === 1 ? player1Line : player2Line;

  if (hooked || line) return; // Already cast

  // Create pond item
  const itemType = randomPondItem();
  const width = window.innerWidth;
  const itemX = width * (playerNum === 1 ? 0.4 : 0.6);
  const itemY = pond.position.y;
  
  const item = Bodies.circle(itemX, itemY, 15, {
    density: 0.02,
    friction: 0.5,
    restitution: 0.4,
    render: { 
      fillStyle: itemType === 'fish' ? COLORS.fish : COLORS.junk 
    },
    label: itemType
  });

  // Create fishing line constraint
  const constraint = Constraint.create({
    bodyA: player,
    bodyB: item,
    stiffness: 0.05,
    damping: 0.1,
    render: {
      strokeStyle: '#333',
      lineWidth: 2
    }
  });

  World.add(world, [item, constraint]);

  if (playerNum === 1) {
    player1Hooked = item;
    player1Line = constraint;
  } else {
    player2Hooked = item;
    player2Line = constraint;
  }

  updateStatus(playerNum, `Hooked: ${itemType}`);
}

function yankLine(playerNum) {
  const player = playerNum === 1 ? player1 : player2;
  const hooked = playerNum === 1 ? player1Hooked : player2Hooked;
  const line = playerNum === 1 ? player1Line : player2Line;

  if (!hooked || !line) return; // Nothing to yank

  // Apply strong upward force to item (and reaction to player)
  const yankForce = 0.015;
  const randomX = (Math.random() - 0.5) * 0.01; // Add chaos
  
  Body.applyForce(hooked, hooked.position, { x: randomX, y: -yankForce });
  Body.applyForce(player, player.position, { x: -randomX * 0.5, y: yankForce * 0.3 });

  // Score the item
  const itemType = hooked.label;
  const points = scoreItem(itemType);
  
  if (playerNum === 1) {
    gameState.player1Score += points;
    updateScore(1, gameState.player1Score);
  } else {
    gameState.player2Score += points;
    updateScore(2, gameState.player2Score);
  }

  // Clean up line and item after brief delay
  setTimeout(() => {
    World.remove(world, [hooked, line]);
    if (playerNum === 1) {
      player1Hooked = null;
      player1Line = null;
      updateStatus(1, points > 0 ? `+${points}!` : `${points}`);
    } else {
      player2Hooked = null;
      player2Line = null;
      updateStatus(2, points > 0 ? `+${points}!` : `${points}`);
    }
  }, 300);
}

function handleCollisions(event) {
  event.pairs.forEach(pair => {
    const { bodyA, bodyB } = pair;
    
    // Check if player fell in pond
    if ((bodyA.label === 'player1' || bodyB.label === 'player1') && 
        (bodyA.label === 'pond' || bodyB.label === 'pond')) {
      if (!gameState.player1Flopped) {
        gameState.player1Flopped = true;
        updateStatus(1, '💦 FLOPPED IN! 💦');
      }
    }
    
    if ((bodyA.label === 'player2' || bodyB.label === 'player2') && 
        (bodyA.label === 'pond' || bodyB.label === 'pond')) {
      if (!gameState.player2Flopped) {
        gameState.player2Flopped = true;
        updateStatus(2, '💦 FLOPPED IN! 💦');
      }
    }
  });
}

function startRound() {
  gameState.roundStartTime = Date.now();
  gameState.player1Flopped = false;
  gameState.player2Flopped = false;
  
  updateRound(gameState.round);
  updateStatus(1, 'Cast!');
  updateStatus(2, 'Cast!');
  
  // Round timer
  const roundInterval = setInterval(() => {
    const elapsed = (Date.now() - gameState.roundStartTime) / 1000;
    const remaining = Math.max(0, 30 - Math.floor(elapsed));
    updateTimer(remaining);
    
    if (isRoundOver(elapsed, gameState.player1Flopped, gameState.player2Flopped)) {
      clearInterval(roundInterval);
      endRound();
    }
  }, 100);
}

function endRound() {
  // Clean up any remaining items
  if (player1Hooked) World.remove(world, player1Hooked);
  if (player2Hooked) World.remove(world, player2Hooked);
  if (player1Line) World.remove(world, player1Line);
  if (player2Line) World.remove(world, player2Line);
  
  player1Hooked = null;
  player2Hooked = null;
  player1Line = null;
  player2Line = null;

  gameState.round++;
  
  if (isGameComplete(gameState.round, gameState.totalRounds)) {
    setTimeout(() => endGame(), 1000);
  } else {
    // Reset player positions
    Body.setPosition(player1, { 
      x: window.innerWidth * 0.2, 
      y: window.innerHeight - 50 - 30 
    });
    Body.setPosition(player2, { 
      x: window.innerWidth * 0.8, 
      y: window.innerHeight - 50 - 30 
    });
    Body.setVelocity(player1, { x: 0, y: 0 });
    Body.setVelocity(player2, { x: 0, y: 0 });
    Body.setAngularVelocity(player1, 0);
    Body.setAngularVelocity(player2, 0);
    
    setTimeout(() => startRound(), 1500);
  }
}

function endGame() {
  const winner = determineWinner(gameState.player1Score, gameState.player2Score);
  
  document.getElementById('game').classList.add('hidden');
  document.getElementById('endScreen').classList.remove('hidden');
  
  document.getElementById('finalP1').textContent = gameState.player1Score;
  document.getElementById('finalP2').textContent = gameState.player2Score;
  
  if (winner === 1) {
    document.getElementById('winnerText').textContent = '🎉 Player 1 Wins! 🎉';
  } else if (winner === 2) {
    document.getElementById('winnerText').textContent = '🎉 Player 2 Wins! 🎉';
  } else {
    document.getElementById('winnerText').textContent = '🤝 It\'s a Tie! 🤝';
  }

  // Clean up
  Render.stop(render);
  Runner.stop(runner);
  World.clear(world);
  Engine.clear(engine);
}

// UI updates
function updateScore(playerNum, score) {
  document.getElementById(`p${playerNum}Score`).textContent = score;
}

function updateStatus(playerNum, text) {
  document.getElementById(`p${playerNum}Status`).textContent = text;
}

function updateRound(roundNum) {
  document.getElementById('roundNum').textContent = roundNum;
}

function updateTimer(seconds) {
  document.getElementById('timer').textContent = `${seconds}s`;
}

// Menu handlers
document.getElementById('startBtn').addEventListener('click', () => {
  document.getElementById('menu').classList.add('hidden');
  document.getElementById('game').classList.remove('hidden');
  initGame();
});

document.getElementById('replayBtn').addEventListener('click', () => {
  // Reset game state
  gameState = {
    round: 1,
    totalRounds: 3,
    player1Score: 0,
    player2Score: 0,
    roundStartTime: 0,
    player1Flopped: false,
    player2Flopped: false
  };
  
  updateScore(1, 0);
  updateScore(2, 0);
  
  document.getElementById('endScreen').classList.add('hidden');
  document.getElementById('game').classList.remove('hidden');
  initGame();
});

// Handle window resize
window.addEventListener('resize', () => {
  if (render) {
    render.canvas.width = window.innerWidth;
    render.canvas.height = window.innerHeight;
    render.options.width = window.innerWidth;
    render.options.height = window.innerHeight;
  }
});
