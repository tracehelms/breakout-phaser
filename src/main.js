window.game = new Phaser.Game(640, 480, Phaser.AUTO, '', { preload: preload, create: create, update: update });

const brickColors = [
  'red',
  'orange',
  'yellow',
  'green',
  'teal',
  'blue'
]
const margin = 50;
const brickHorizontalSpacing = 60;
const brickVerticalSpacing = 40;
const paddleWidth = 100;
const paddleHeight = 15;
const ballRadius = 14;
var cursors;
var paddle;
var ball;
var bricks;
var score = 0;
var scoreText;
var lives = 3;
var livesText;
var ballHeld = true;
var overlayText;

function preload() {
  game.load.image('background', 'assets/images/background.png');
  game.load.image('paddle', 'assets/images/paddle.png');
  game.load.image('ball', 'assets/images/ball.png');
  for (let color of brickColors) {
    game.load.image(color, `assets/images/${color}.png`);
  }
}

function create() {
  //  We're going to be using physics, so enable the Arcade Physics system
  game.physics.startSystem(Phaser.Physics.ARCADE);
  game.physics.arcade.checkCollision.down = false;
  cursors = game.input.keyboard.createCursorKeys();

  game.add.sprite(0, 0, 'background');

  bricks = game.add.group();
  bricks.enableBody = true;
  bricks.physicsBodyType = Phaser.Physics.ARCADE;

  for (var [index, color] of brickColors.entries()) {
    for (let i = 0; i < 9; i++) {
      let x = margin + i * brickHorizontalSpacing;
      let y = margin + index * brickVerticalSpacing;
      let newBrick = bricks.create(x, y, color);
      newBrick.body.immovable = true;
    }
  }

  paddle = game.add.sprite(50, 400, 'paddle');
  game.physics.enable(paddle, Phaser.Physics.ARCADE);
  paddle.body.immovable = true;
  paddle.body.collideWorldBounds = true;

  ball = game.add.sprite(93, 384, 'ball');
  game.physics.enable(ball, Phaser.Physics.ARCADE);
  ball.body.collideWorldBounds = true;
  ball.checkWorldBounds = true;
  ball.body.bounce.setTo(1, 1);
  ball.events.onOutOfBounds.add(ballLost, this);

  scoreText = game.add.text(10, 440, `Score: ${score}`, { font: "20px Arial", fill: "#ffffff", align: "left" });
  livesText = game.add.text(560, 440, `Lives: ${lives}`, { font: "20px Arial", fill: "#ffffff", align: "left" });
  overlayText = game.add.text(game.world.centerX, 340, 'Press Up To Start', { font: "24px Arial", fill: "#ffffff", align: "center" });
  overlayText.anchor.setTo(0.5, 0.5);
}

function update() {
  if (cursors.left.isDown) {
    paddle.body.velocity.x = -500;
  } else if (cursors.right.isDown) {
    paddle.body.velocity.x = 500;
  } else {
    paddle.body.velocity.setTo(0, 0);
  }

  if (ballHeld) {
    ball.body.x = paddle.body.x + (paddleWidth / 2) - (ballRadius / 2);
    ball.body.y = 384;
    if (cursors.up.isDown) {
      releaseBall();
    }
  } else {
    game.physics.arcade.collide(ball, paddle, ballHitPaddle, null, this);
    game.physics.arcade.collide(ball, bricks, ballHitBrick, null, this);
  }
}

function releaseBall() {
  ballHeld = false;
  overlayText.visible = false;
  ball.body.velocity.setTo(100, 200);
}

function ballLost() {
  lives -= 1;
  livesText.text = `Lives: ${lives}`;
  if (lives > 0) {
    ballHeld = true;
  } else {
    overlayText.text = 'Game Over!';
    overlayText.visible = true;
  }
}

function ballHitPaddle(thisBall, thisPaddle) {
  thisBall.body.velocity.x = (thisBall.x - thisPaddle.x - (paddleWidth / 2) + (ballRadius / 2)) * 5;
}

function ballHitBrick(thisBall, brick) {
  brick.kill();
  score += 10;
  scoreText.text = `Score: ${score}`;
  if (bricks.countLiving() == 0) {
    ball.kill()
    overlayText.text = "You Win!";
    overlayText.visible = "true";
  }
}
