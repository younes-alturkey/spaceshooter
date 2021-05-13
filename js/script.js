const canvas = document.getElementById('canvas')
const context = canvas.getContext('2d')

//Global variables
const cellSize = 100
const cellGap = 3
let frame = 0
let defeat = false
let victory = false
let bossMode = false
let score = 0

const projectiles = []
const enemies = []
const bossProjectiles = []
const obstacles = []
const floatingMessages = []
const Explosions = []

let screen,
  starsElements,
  starsParams = { speed: 4, number: 300, extinction: 4 }

// Player class
const playerShip = new Image()
playerShip.src = 'assets/player.png'
const explosion2 = new Image()
explosion2.src = 'assets/explosion2.png'

class Player {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.width = cellSize - cellGap * 2
    this.height = cellSize - cellGap * 2
    this.speed = 10
    this.moveLeft = false
    this.moveRight = false
    this.moveUp = false
    this.moveDown = false
    this.shooting = false
    this.alive = true
    this.timer = 0
    this.frameX = 0
    this.frameY = 0
    this.spriteWidth = 194
    this.spriteHeight = 240
    this.minFrame = 0
    this.maxFrame = 26
  }

  update() {
    if (frame % 3 === 0) {
      if (this.frameX < this.maxFrame) this.frameX++
      else this.frameX = this.minFrame
    }

    if (this.moveLeft && this.alive) {
      if (this.x - this.speed > 0) this.x -= this.speed
    } else if (this.moveRight && this.alive) {
      if (this.x + this.speed <= canvas.width - cellSize) this.x += this.speed
    } else if (this.moveUp && this.alive) {
      if (this.y - this.speed > 0) this.y -= this.speed
    } else if (this.moveDown && this.alive) {
      if (this.y + this.speed <= canvas.height - cellSize) this.y += this.speed
    }

    if (this.shooting && this.alive) {
      projectiles.push(new Projectiles(this.x + 15, this.y - 40))
      player.shooting = false
    }
  }

  draw() {
    if (this.alive) {
      context.drawImage(
        playerShip,
        this.frameX * this.spriteWidth,
        0,
        this.spriteWidth,
        this.spriteHeight,
        this.x,
        this.y,
        this.width,
        this.height
      )
    }
  }
}

// Default player starting location
const player = new Player(window.innerWidth / 2, window.innerHeight / 2)

function handlePlayer() {
  player.update()
  player.draw()

  // Check collision with falling enemies
  for (let i = 0; i < enemies.length; i++) {
    if (player.alive && isColliding(player, enemies[i])) {
      defeat = true
      Explosions.push(
        new Explosion(explosion2, player.x - 100, player.y - 75, 256, 256)
      )
    }
  }

  // Check if Boss is alive and collision with Boss
  if (boss.alive && player.alive && isColliding(player, boss)) {
    defeat = true
    Explosions.push(
      new Explosion(explosion2, player.x - 100, player.y - 75, 256, 256)
    )
  }
}

// Player Projectiles
const bullet = new Image()
bullet.src = 'assets/bullets.png'

class Projectiles {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.width = 64
    this.height = 64
    this.power = 5
    this.speed = 15
    this.timer = 0
    this.frameX = 0
    this.frameY = 0
    this.spriteWidth = 240
    this.spriteHeight = 240
    this.minFrame = 0
    this.maxFrame = 15
  }

  update() {
    if (frame % 3 === 0) {
      if (this.frameX < this.maxFrame) this.frameX++
      else this.frameX = this.minFrame
    }

    this.y -= this.speed
  }
  draw() {
    context.drawImage(
      bullet,
      this.frameX * this.spriteWidth,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y,
      this.width,
      this.height
    )
  }
}

function handleProjectiles() {
  for (let i = 0; i < projectiles.length; i++) {
    projectiles[i].update()
    projectiles[i].draw()

    // Check collision with falling enemies
    for (let j = 0; j < enemies.length; j++) {
      if (
        enemies[j] &&
        projectiles[i] &&
        isColliding(projectiles[i], enemies[j])
      ) {
        enemies[j].health -= projectiles[i].power
        projectiles.splice(i, 1)
        i--
      }
    }

    // Check collision with boss
    if (
      bossMode &&
      boss.alive &&
      projectiles[i] &&
      isColliding(boss, projectiles[i])
    ) {
      if (score < 70) score += 1
      floatingMessages.push(
        new FloatingMessage('hit', boss.x, boss.y, 25, 'green')
      )
      projectiles.splice(i, 1)
      i--
    }

    // Check collision with canvas walls
    if (projectiles[i] && projectiles[i].y < 30) {
      projectiles.splice(i, 1)
      i--
    }
  }
}

// Map Obstacles
const asteroid = new Image()
asteroid.src = 'assets/asteroid.png'
class Obstacle {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.width = 120
    this.height = 124
    this.timer = 0
    this.frameX = 0
    this.frameY = 0
    this.spriteWidth = 232
    this.spriteHeight = 171
    this.minFrame = 0
    this.maxFrame = 19
  }

  update() {
    if (frame % 6 === 0) {
      if (this.frameX < this.maxFrame) this.frameX++
      else this.frameX = this.minFrame
    }
  }

  draw() {
    context.drawImage(
      asteroid,
      this.frameX * this.spriteWidth,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y,
      this.width,
      this.height
    )
  }
}
// create 2 obstacles
function createObstacles() {
  obstacles.push(
    new Obstacle(350 + Math.random() * 50, 450 + Math.random() * 200)
  )
  obstacles.push(
    new Obstacle(900 + Math.random() * 50, 250 + Math.random() * 200)
  )
}

createObstacles()

function handleObstacles() {
  for (let i = 0; i < obstacles.length; i++) {
    obstacles[i].update()
    obstacles[i].draw()

    for (let j = 0; j < enemies.length; j++) {
      if (enemies[j] && obstacles[i] && isColliding(obstacles[i], enemies[j])) {
        Explosions.push(
          new Explosion(
            explosion1,
            enemies[j].x + 15,
            enemies[j].y - 30,
            128,
            128
          )
        )
        enemies.splice(j, 1)
        j++
      }
    }

    // Check collision with player projectiles
    for (let j = 0; j < projectiles.length; j++) {
      if (
        projectiles[j] &&
        obstacles[i] &&
        isColliding(obstacles[i], projectiles[j])
      ) {
        projectiles.splice(j, 1)
        j--
      }
    }
  }
}

// Falling Enemy (divs) class
const enemyplayerShip = new Image()
enemyplayerShip.src = 'assets/enemy.png'
const explosion1 = new Image()
explosion1.src = 'assets/explosion1.png'

class Enemy {
  constructor(horizontalPosition) {
    this.x = horizontalPosition
    this.y = 20
    this.width = 50
    this.height = 50
    this.speed = Math.random() * 0.5 + 2
    this.movement = this.speed
    this.health = 10
    this.maxHealth = this.health
    this.timer = 0
    this.frameX = 0
    this.frameY = 0
    this.spriteWidth = 188
    this.spriteHeight = 198
    this.minFrame = 0
    this.maxFrame = 26
  }
  update() {
    if (frame % 3 === 0) {
      if (this.frameX < this.maxFrame) this.frameX++
      else this.frameX = this.minFrame
    }

    this.y += this.movement
  }
  draw() {
    context.drawImage(
      enemyplayerShip,
      this.frameX * this.spriteWidth,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y,
      this.width,
      this.height
    )
  }
}

function handleEnemies() {
  for (let i = 0; i < enemies.length; i++) {
    enemies[i].update()
    enemies[i].draw()

    if (enemies[i].health <= 0) {
      if (score < 50) score += 1
      Explosions.push(
        new Explosion(
          explosion1,
          enemies[i].x + 15,
          enemies[i].y - 30,
          128,
          128
        )
      )
      enemies.splice(i, 1)
    } else if (enemies[i].y >= canvas.height - cellSize) {
      Explosions.push(
        new Explosion(
          explosion1,
          enemies[i].x + 15,
          enemies[i].y - 30,
          128,
          128
        )
      )
      enemies.splice(i, 1)
      i--
    }
  }
  if (frame % 24 === 0 && !bossMode) {
    let horizontalPosition = Math.floor(Math.random() * canvas.width - cellSize)
    enemies.push(new Enemy(horizontalPosition))
  }
}

// Boss class
const bossShip = new Image()
bossShip.src = 'assets/boss-eye.png'

class Boss {
  constructor(horizontalPosition) {
    this.x = horizontalPosition
    this.y = 20
    this.width = 125
    this.height = 125
    this.movementX = Math.random() * 0.5 + 2
    this.movementY = Math.random() * 0.5 + 3
    this.alive = true
    this.timer = 0
    this.frameX = 0
    this.frameY = 0
    this.spriteWidth = 195
    this.spriteHeight = 195
    this.minFrame = 0
    this.maxFrame = 10
  }

  update() {
    if (frame % 3 === 0) {
      if (this.frameX < this.maxFrame) this.frameX++
      else this.frameX = this.minFrame
    }
    if (this.alive) {
      if (this.x >= canvas.width - this.width || this.x <= 0)
        this.movementX *= -1
      if (this.y >= canvas.height - this.height || this.y <= 0)
        this.movementY *= -1

      for (let i = 0; i < obstacles.length; i++) {
        if (isColliding(this, obstacles[i])) {
          this.movementX *= -1
          this.movementY *= -1
        }
      }

      this.x += this.movementX
      this.y += this.movementY

      if (frame % 30 === 0) {
        bossProjectiles.push(
          new BossProjectiles(this.x + 30, this.y + 30, 'up')
        )
        bossProjectiles.push(
          new BossProjectiles(this.x + 30, this.y + 30, 'down')
        )
        bossProjectiles.push(
          new BossProjectiles(this.x + 30, this.y + 30, 'left')
        )
        bossProjectiles.push(
          new BossProjectiles(this.x + 30, this.y + 30, 'right')
        )
      }
    }
  }

  draw() {
    if (this.alive) {
      context.drawImage(
        bossShip,
        this.frameX * this.spriteWidth,
        0,
        this.spriteWidth,
        this.spriteHeight,
        this.x,
        this.y,
        this.width,
        this.height
      )
    }
  }
}

// Default Boss starting
const boss = new Boss(450)

function handleBoss() {
  if (bossMode) {
    starsParams.speed = 10
    starsParams.speed = 20
    boss.update()
    boss.draw()
  }
}

function handleGameStatus() {
  context.fillStyle = 'white'
  context.font = '30px Reggae One'
  context.fillText('Score: ' + score, 20, 40)

  if (defeat) {
    if (player.alive) {
      Explosions.push(
        new Explosion(explosion2, player.x - 100, player.y - 75, 256, 256)
      )
      player.alive = false
    }
    context.fillStyle = 'red'
    context.font = '50px Reggae One'
    context.fillText('YOU ARE DEAD', canvas.width / 2 - 200, 100)
  } else if (victory) {
    context.fillStyle = 'green'
    context.font = '50px Reggae One'
    context.fillText('YOU WIN', canvas.width / 2 - 100, 100)
  } else if (score >= 70) {
    boss.alive = false
    Explosions.push(
      new Explosion(explosion1, boss.x + 15, boss.y - 30, 256, 256)
    )
    victory = true
  } else if (score >= 50) {
    bossMode = true
  }
}

// Boss Projectiles class
const bossBulletUp = new Image()
const bossBulletDown = new Image()
const bossBulletLeft = new Image()
const bossBulletRight = new Image()
bossBulletUp.src = 'assets/boss-bullet-up.png'
bossBulletDown.src = 'assets/boss-bullet-down.png'
bossBulletLeft.src = 'assets/boss-bullet-left.png'
bossBulletRight.src = 'assets/boss-bullet-right.png'

class BossProjectiles {
  constructor(x, y, dir) {
    this.x = x
    this.y = y
    this.width = 64
    this.height = 64
    this.power = 5
    this.speed = 15
    // direction of projectile
    this.direction = dir
  }
  update() {
    switch (this.direction) {
      case 'up':
        this.y -= this.speed
        break
      case 'down':
        this.y += this.speed
        break
      case 'left':
        this.x -= this.speed
        break
      case 'right':
        this.x += this.speed
        break
    }
  }
  draw() {
    let selectedBullet
    let w
    let h
    switch (this.direction) {
      case 'up':
        selectedBullet = bossBulletUp
        w = 142
        h = 309
        break
      case 'down':
        selectedBullet = bossBulletDown
        w = 142
        h = 309
        break
      case 'left':
        selectedBullet = bossBulletLeft
        w = 309
        h = 142
        break
      case 'right':
        selectedBullet = bossBulletRight
        w = 309
        h = 142
        break
    }
    context.drawImage(
      selectedBullet,
      0,
      0,
      w,
      h,
      this.x,
      this.y,
      this.width,
      this.height
    )
  }
}

function handleBossProjectiles() {
  for (let i = 0; i < bossProjectiles.length; i++) {
    bossProjectiles[i].update()
    bossProjectiles[i].draw()

    // Check collision with obstacles
    for (let j = 0; j < obstacles.length; j++) {
      if (bossProjectiles[i] && isColliding(obstacles[j], bossProjectiles[i])) {
        bossProjectiles.splice(i, 1)
        i--
      }
    }

    // Check collision with player
    if (bossProjectiles[i] && isColliding(player, bossProjectiles[i])) {
      defeat = true
      bossProjectiles.splice(i, 1)
      i--
    }

    // Check collision with canvas walls
    if (bossProjectiles[i]) {
      if (
        bossProjectiles[i].x >= canvas.width - bossProjectiles[i].width ||
        bossProjectiles[i].x <= 0 ||
        bossProjectiles[i].y >= canvas.height - bossProjectiles[i].height ||
        bossProjectiles[i].y <= 0
      ) {
        bossProjectiles.splice(i, 1)
      }
    }
  }
}

// Floating Messages class
class FloatingMessage {
  constructor(value, x, y, size, color) {
    this.value = value
    this.x = x
    this.y = y
    this.size = size
    this.lifeSpan = 0
    this.color = color
    this.opacity = 1
  }

  update() {
    this.y -= 0.3
    this.lifeSpan += 1
    if (this.opacity > 0.03) this.opacity -= 0.03
  }

  draw() {
    context.globalAlpha = this.opacity
    context.fillStyle = this.color
    context.font = this.size + 'px Reggae One'
    context.fillText(this.value, this.x, this.y)
    context.globalAlpha = 1
  }
}

function handlFloatingMessages() {
  for (let i = 0; i < floatingMessages.length; i++) {
    floatingMessages[i].update()
    floatingMessages[i].draw()

    // delete the message after 100 frames
    if (floatingMessages[i].lifeSpan >= 100) {
      floatingMessages.splice(i, 1)
      i--
    }
  }
}

// Floating Images class
class Explosion {
  constructor(value, x, y, width = 64, height = 64) {
    this.value = value
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.lifeSpan = 0
    this.opacity = 1
    this.timer = 0
    this.frameX = 0
    this.frameY = 0
    this.spriteWidth = 256
    this.spriteHeight = 256
    this.minFrame = 0
    this.maxFrame = 34
  }

  update() {
    if (frame % 3 === 0) {
      if (this.frameX < this.maxFrame) this.frameX++
      else this.frameX = this.minFrame
    }
    this.y -= 0.3
    this.lifeSpan += 1
    if (this.opacity > 0.03) this.opacity -= 0.03
  }

  draw() {
    context.globalAlpha = this.opacity
    context.drawImage(
      this.value,
      this.frameX * this.spriteWidth,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y,
      this.width,
      this.height
    )
    context.globalAlpha = 1
  }
}

function handlExplosions() {
  for (let i = 0; i < Explosions.length; i++) {
    Explosions[i].update()
    Explosions[i].draw()

    // delete the message after 100 frames
    if (Explosions[i].lifeSpan >= 200) {
      Explosions.splice(i, 1)
      i--
    }
  }
}

// run stars
setupStars()
updateStars()

// star constructor
function Star() {
  this.x = Math.random() * canvas.width
  this.y = Math.random() * canvas.height
  this.z = Math.random() * canvas.width

  this.move = function () {
    this.z -= starsParams.speed
    if (this.z <= 0) {
      this.z = canvas.width
    }
  }

  this.show = function () {
    let x, y, rad, opacity
    x = (this.x - screen.c[0]) * (canvas.width / this.z)
    x = x + screen.c[0]
    y = (this.y - screen.c[1]) * (canvas.width / this.z)
    y = y + screen.c[1]
    rad = canvas.width / this.z
    opacity =
      rad > starsParams.extinction
        ? 1.5 * (2 - rad / starsParams.extinction)
        : 1

    context.beginPath()
    context.fillStyle = 'rgba(255, 255, 255, ' + opacity + ')'
    context.arc(x, y, rad, 0, Math.PI * 2)
    context.fill()
  }
}

// setup <canvas>, create all the starts
function setupStars() {
  screen = {
    w: window.innerWidth,
    h: window.innerHeight,
    c: [window.innerWidth * 0.5, window.innerHeight * 0.5],
  }
  window.cancelAnimationFrame(updateStars)
  canvas.width = screen.w
  canvas.height = screen.h
  starsElements = []
  for (let i = 0; i < starsParams.number; i++) {
    starsElements[i] = new Star()
  }
}

// redraw the frame
function updateStars() {
  context.fillStyle = 'black'
  context.fillRect(0, 0, canvas.width, canvas.height)
  starsElements.forEach(function (s) {
    s.show()
    s.move()
  })
}

// Collision check function
function isColliding(first, second) {
  if (
    !(
      first.x > second.x + second.width ||
      first.x + first.width < second.x ||
      first.y > second.y + second.height ||
      first.y + first.height < second.y
    )
  ) {
    return true
  }
}

// Detect keys pressed
function checkKeyDown(e) {
  // Play main theme on player first move
  document.getElementById('audio').muted = false
  document.getElementById('audio').volume = 0.04
  document.getElementById('audio').play()

  e = e || window.event

  // left arrow key down
  if (e.keyCode == '37') {
    player.moveLeft = true
    // right arrow key down
  } else if (e.keyCode == '39') {
    player.moveRight = true
    // up arrow key down
  } else if (e.keyCode == '38') {
    player.moveUp = true
  } else if (e.keyCode == '40') {
    // down arrow key down
    player.moveDown = true
  } else if (e.keyCode == '13') {
    // enter key down
    player.shooting = true
  }
}

function checkKeyUp(e) {
  e = e || window.event
  // left arrow key up
  if (e.keyCode == '37') {
    player.moveLeft = false
    // right arrow key up
  } else if (e.keyCode == '39') {
    player.moveRight = false
    // up arrow key up
  } else if (e.keyCode == '38') {
    player.moveUp = false
    // down arrow key up
  } else if (e.keyCode == '40') {
    player.moveDown = false
    // 'r' key up
  } else if (e.keyCode == '82') {
    location.reload()
  }
}

// Map keys to document keys
document.onkeydown = checkKeyDown
document.onkeyup = checkKeyUp

// Adjust canvas on resize
window.addEventListener('resize', function () {
  canvasPosition = canvas.getBoundingClientRect()
  setupStars()
})

// Game animation loop
function animate() {
  context.clearRect(0, 0, canvas.width, canvas.height)
  updateStars()
  handlePlayer()
  handleProjectiles()
  handleEnemies()
  handleGameStatus()
  handleObstacles()
  handlFloatingMessages()
  handlExplosions()
  handleBoss()
  handleBossProjectiles()
  frame++
  requestAnimationFrame(animate)
}
animate()
