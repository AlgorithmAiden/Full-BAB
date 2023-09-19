//setup the canvas
const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")


//for this code (as in code before this line), I almost always use the same stuff, so its going to stay here

//now create the grid of bricks
let gx = 5
let gy = 5
let bx
let by

const UPS = 30

/**make the canvas always fill the screen**/;
function resize() {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    window.onresize = resize

    bx = canvas.width / gx
    by = canvas.height / gy / 2
    //and make the bricks only fill half the screen
}
resize()


//create the bricks
let bricks

//create the paddle
let paddle = {
    width: 200,
    speed: canvas.width / UPS / 2,
    height: 25,
    x: canvas.width / 2
}

//grab the score
let highscore = localStorage.getItem('highscore') ?? 0
let score

//create the ball
let balls

//remember the mouse
let lastX = canvas.width / 2
document.addEventListener('mousemove', e => lastX = e.x)
document.addEventListener('touchmove', e => lastX = e.changedTouches[e.changedTouches.length - 1].clientX)

//resets the board
function resetBricks() {
    bricks = Array(gy).fill(0)
    for (let index in bricks) {
        bricks[index] = Array(gx).fill(0)
        for (let subindex in bricks[index])
            bricks[index][subindex] = (Math.random() > .1 ? 1 : Math.random() < .5 ? 2 : 3)
    }
}

let level = 1

//resets the game
function fullReset() {
    level = 1
    gx = 1
    gy = 1
    paddle.x = canvas.width / 2
    paddle.width = 200
    balls = []
    balls.push({
        x: canvas.width / 2,
        y: canvas.height / 4 * 3,
        r: 10,
        sx: (Math.round(Math.random()) * 2 - 1) * 10,
        sy: (Math.round(Math.random()) * 2 - 1) * 10
    })
    score = 0
    resetBricks()
    resize()

}
fullReset()

//making more levels
function nextLevel() {
    level++
    gx++
    gy++
    paddle.x = canvas.width / 2
    paddle.width = 200
    balls = []
    balls.push({
        x: canvas.width / 2,
        y: canvas.height / 4 * 3,
        r: 10,
        sx: (Math.round(Math.random()) * 2 - 1) * 10,
        sy: (Math.round(Math.random()) * 2 - 1) * 10
    })
    resetBricks()
    resize()
}

setInterval(() => {

    //run for each ball
    for (let index in balls) {
        let ball = balls[index]

        //move the ball
        ball.x += ball.sx
        ball.y += ball.sy

        //make it bounce off the sides
        if (ball.x - ball.r < 0) ball.sx = Math.abs(ball.sx)
        if (ball.x + ball.r > canvas.width) ball.sx = -Math.abs(ball.sx)
        if (ball.y - ball.r < 0) ball.sy = Math.abs(ball.sy)

        //make it bounce off the paddle
        if (ball.x + ball.r > paddle.x - paddle.width / 2 &&
            ball.x - ball.r < paddle.x + paddle.width / 2 &&
            ball.y + ball.r > canvas.height - paddle.height)
            ball.sy = -Math.abs(ball.sy)

        //check for brick hits
        for (let y in bricks)
            for (let x in bricks[y])
                if (bricks[y][x] != 0 &&
                    ball.x - ball.r < x * bx + bx &&
                    ball.x + ball.r > x * bx &&
                    ball.y - ball.r < y * by + by &&
                    ball.y + ball.r > y * by) {
                    if (bricks[y][x] == 2) {
                        let temp = []
                        for (let ball of balls) {
                            temp.push({ ...ball })
                            ball.sx *= -1
                            ball.sy *= -1
                            temp.push({ ...ball })
                        }
                        balls = temp
                    }
                    if (bricks[y][x] == 3) {
                        paddle.width += 50
                    }
                    bricks[y][x] = 0
                    score++
                    if (score > highscore) {
                        highscore = score
                        localStorage.setItem('highscore', highscore)
                    }
                    if (Math.random() < .5) ball.sx *= -1
                    else ball.sy *= -1
                }

        //check for the ball going off the bottom
        if (ball.y + ball.r > canvas.height) balls.splice(index, 1)
    }

    //check for lack of balls
    if (balls.length == 0) fullReset()

    //move the paddle
    paddle.x += (Math.max(Math.min(lastX - paddle.x, paddle.speed), -paddle.speed))

    //make the paddle stay on the screen
    paddle.x = Math.min(Math.max(paddle.x, 0 + paddle.width / 2), canvas.width - paddle.width / 2)

    //check for win
    let win = true
    for (let y in bricks)
        for (let x in bricks[y])
            if (bricks[y][x] != 0) win = false
    if (win) nextLevel()

}, 1000 / UPS)

    ;
(function render() {
    //first clear the screen
    ctx.fillStyle = 'rgb(0,0,0)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    //then draw the bricks
    ctx.shadowBlur = Math.floor(bx, by) / 2
    for (let y in bricks)
        for (let x in bricks[y]) {
            ctx.fillStyle = ['rgb(0,0,0,.1)', 'rgb(0,100,0,.1)', 'rgb(100,0,0,.1)', 'rgb(0,0,100,.1)'][bricks[y][x]]
            ctx.shadowBlur = 0
            ctx.fillRect(x * bx, y * by, bx, by)
            ctx.fillStyle = ['rgb(0,0,0)', 'rgb(0,100,0)', 'rgb(100,0,0)', 'rgb(0,0,100)'][bricks[y][x]]
            ctx.shadowColor = ctx.fillStyle
            ctx.shadowBlur = Math.floor(bx, by) / 4
            ctx.fillRect(x * bx + bx / 4, y * by + by / 4, bx - bx / 2, by - by / 2)

        }

    //render the paddle
    ctx.fillStyle = 'rgb(255,255,255)'
    ctx.shadowBlur = 50
    ctx.shadowColor = ctx.fillStyle
    ctx.fillRect(paddle.x - paddle.width / 2, canvas.height - paddle.height, paddle.width, paddle.height)

    //render the balls
    for (let ball of balls)
        ctx.fillRect(ball.x - ball.r, ball.y - ball.r, ball.r * 2, ball.r * 2)
    ctx.shadowBlur = 0

    //render the score
    ctx.fillStyle = 'rgb(255,255,255)'
    ctx.font = '25px arial'
    ctx.fillText(`Score: ${score} Highscore: ${highscore}`, 0, 25)
    ctx.fillText(`Level: ${level}`, 0, 50)

    requestAnimationFrame(render)
})()