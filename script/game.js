const canvas = document.querySelector("canvas");
canvas.width = window.innerWidth - 20;
canvas.height = window.innerHeight - 20;
const ctx = canvas.getContext("2d");
const W = canvas.width;
const H = canvas.height;
const ASTEROID_LEVELS = [
    // Utilizamos diferentes imagens com diferentes tamanhos pois o scale dinâmico da imagem afeta bastante a perfomance
    // https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas
    { level: 1, width: 210, height: 210, points: 10, img: "img/asteroid1.svg" },
    { level: 2, width: 150, height: 150, points: 25, img: "img/asteroid2.svg" },
    { level: 3, width: 75, height: 75, points: 50, img: "img/asteroid3.svg" }
];

//Guardar nome
let playerName = "";
// Array que irá ficar com as teclas pressionadas
let keys = new Array();

// Variável que irá conter o objeto da nave
let spaceship;

// Array que irá conter todas as balas disparadas
let bullets = new Array();

// Array que irá conter todos os asteróides ativos
let arrayAsteroids = new Array();

// Variável que irá ficar com as imagens da nave sem fogo, da nave com fogo e da explosão para o new Image() não estar sempre a ser chamado no draw()
let imgSpaceship = new Image();
let imgExplosion = new Image();
imgExplosion.src = "img/explosion.png";

// Se esta variável estiver a true, o utilizador não poderá usar os controlos (marioritariamente usado para quando a nave é atingida por um asteróide)
let enableControls = true;

// Variável que irá conter todas as informações do jogador e das suas estatísticas
let gameStats = {
    name: "John Doe",
    round: 1,
    score: 0,
    lives: 3,
    highestScore: localStorage.highscore ? localStorage.highscore : localStorage.setItem("highscore", 0)
}

// Variável que irá deicdir se renderização deverá ser executada ou não
let shouldRenderBeExecuted = true;

class Asteroid {
    constructor(x, y, level) {
        // Nível do asteróide
        this.level = level;

        // Largura do asteróide
        this.width = ASTEROID_LEVELS.filter(level => level.level == this.level)[0].width;

        // Altura do asteróide
        this.height = ASTEROID_LEVELS.filter(level => level.level == this.level)[0].height;

        // Se as coordenadas forem 0, 0 quer dizer que a posição do asteróide é suposto ser aleatória
        // Se forem diferentes de 0 o asteróide terá que ter essa posição
        if (x == 0 && y == 0) {
            // Impedir que o asteróide nasça em cima da nave
            do {
                // Posição inicial X
                this.x = Math.floor(Math.random() * ((W - this.width) - 0 + 1) + 0);

                // Posição inicial Y
                this.y = Math.floor(Math.random() * ((H - this.height) - 0 + 1) + 0);
            } while (areObjectsColliding(this.x + (this.width / 2), this.y + (this.height / 2), spaceship.getCenter("x"), spaceship.getCenter("y"), this.width / 2, spaceship.width * 2));
        } else {
            // Posição inicial X
            this.x = x;

            // Posição inicial Y
            this.y = y;
        }


        // Propriedade do objeto Image
        this.img = new Image();

        // Extrair o url do asteróide para o filter() não estar sempre a ser executado
        this.imgsrc = ASTEROID_LEVELS.filter(level => level.level == this.level)[0].img;

        // Ângulo aleatório
        this.angle = (Math.random() * 361) * (Math.PI / 180);

        // Velocidade do asteróide
        this.vel = 2;

        // Movimento no eixo X
        this.dX = Math.cos(this.angle - (Math.PI / 2)) * this.vel;

        // Movimento no eixo Y
        this.dY = Math.sin(this.angle - (Math.PI / 2)) * this.vel;

        // Guardar id para depois ser possível saber qual asteróide foi atingido
        this.id = new Date().getTime() + (Math.random() * 1000);
    }

    draw() {
        ctx.save();
        ctx.translate(this.x + (this.width / 2), this.y + (this.height / 2));
        ctx.rotate(this.angle);
        this.img.src = this.imgsrc;
        ctx.drawImage(this.img, 0 - (this.width / 2), 0 - (this.height / 2));
        ctx.restore();

        // Círculo por cima dos asteróides para haver uma melhor noção das colisões
        // ctx.beginPath();
        // ctx.arc(this.x + (this.width / 2), this.y + (this.height / 2), this.width / 2, 0, Math.PI * 2);
        // ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
        // ctx.fill();
        // ctx.closePath();
    }

    update() {
        // Se o asteróide ultrapassar os limites do canvas, trocar-lhe as coordenadas
        if (this.x < 0 - this.width) {
            this.x = W + this.width;
        } else if (this.x > W + this.width) {
            this.x = 0 - this.width;
        }

        if (this.y < 0 - this.height) {
            this.y = H + this.height;
        } else if (this.y > H + this.height) {
            this.y = 0 - this.height;
        }

        // Atualiza o movimento do asteróide
        this.x += this.dX;
        this.y += this.dY;

        // Verificar se alguma bala se encontra dentro do asteróide
        for (let i = 0; i < bullets.length; i++) {
            // Se entrar neste if statement, quer dizer que a bala atingiu um asteróide
            if (areObjectsColliding(this.getCenter("x"), this.getCenter("y"), bullets[i].x, bullets[i].y, this.width / 2, bullets[i].r)) {
                if (this.level < 3) {
                    // Se o nível do asteróide atingido não for o último, dividi-lo em 2 com nível superior
                    arrayAsteroids.push(new Asteroid(this.x + 2, this.y + 2, this.level + 1));
                    arrayAsteroids.push(new Asteroid(this.x - 2, this.y - 2, this.level + 1));
                }

                // Remover a bala que atingiu o asteróide
                bullets.splice(i, 1);

                // Incrementar a pontuação
                gameStats.score += ASTEROID_LEVELS.filter(level => level.level == this.level)[0].points;
                document.querySelector(".current-score .text").innerHTML = gameStats.score;

                // Verificar se a pontuação atual é maior que a melhor pontuação
                if (gameStats.score > gameStats.highestScore) {
                    localStorage.setItem("highscore", gameStats.score);
                    gameStats.highestScore = gameStats.score;
                    document.querySelector(".highest-score .text").innerHTML = gameStats.score;
                }

                // Remover o asteróide atingido
                arrayAsteroids.splice(arrayAsteroids.findIndex(asteroid => asteroid.id == this.id), 1);

                // Apesar de removermos o atual asteróide ele continua a executar o resto da função
                break;
            }
        }
    }

    getCenter(coord) {
        return coord == "x" ? this.x + (this.width / 2) : this.y + (this.height / 2);
    }
}

class Spaceship {
    constructor() {
        // Largura da nave
        this.width = 50;

        // Altura da nave
        this.height = 50;

        // Posição inicial X
        this.x = (W / 2) - (this.width / 2);

        // Posição inicial Y
        this.y = (H / 2) - (this.height / 2);

        // Velociade máxima
        this.accelLimit = 3;

        // Velocidade atual
        this.curAccel = 0;

        // Ângulo da nave
        this.angle = 0;

        // Propriedade para poder ser possível alterar a imagem quando a nave está em movimento
        this.imgsrc = "img/spaceship.svg";
    }

    draw() {
        imgSpaceship.src = this.imgsrc;
        ctx.save();
        ctx.translate(this.x + (this.width / 2), this.y + (this.height / 2));
        ctx.rotate(this.angle);
        ctx.drawImage(imgSpaceship, 0 - (this.width / 2), 0 - (this.height / 2));
        ctx.restore();

        // Círculo por cima da nave para haver uma melhor noção das colisões
        // ctx.beginPath();
        // ctx.arc(this.x + (this.width / 2), this.y + (this.height / 2), this.width * 2, 0, Math.PI * 2);
        // ctx.strokeStyle = "red";
        // ctx.stroke();
        // ctx.closePath();
    }

    update() {
        // Se a nave ultrapassar os limites do canvas, trocar-lhe as coordenadas
        if (this.x < 0 - this.width) {
            this.x = W + this.width;
        } else if (this.x > W + this.width) {
            this.x = 0 - this.width;
        }

        if (this.y < 0 - this.height) {
            this.y = H + this.height;
        } else if (this.y > H + this.height) {
            this.y = 0 - this.height;
        }

        // Verificar colisões da nave com asteróides
        for (let i = 0; i < arrayAsteroids.length; i++) {
            // Se entrar neste if statement, quer dizer que a bala atingiu um asteróide
            if (areObjectsColliding(arrayAsteroids[i].getCenter("x"), arrayAsteroids[i].getCenter("y"), this.getCenter("x"), this.getCenter("y"), spaceship.width / 2, arrayAsteroids[i].width / 2)) {
                // Desabilitar os controlos da nave
                // enableControls = false;

                // Mostrar imagem de uma explosão por cima da nave
                ctx.drawImage(imgExplosion, this.getCenter("x") - 30, this.getCenter("y") - 30, 60, 60);

                // Resetar as posições da nave
                spaceship.x = (W / 2) - (this.width / 2);
                spaceship.y = (H / 2) - (this.height / 2)
                spaceship.curAccel = 0;
                spaceship.angle = 0;

                // Decrementar e renderizar a quantidade de vidas do jogador
                gameStats.lives--;
                document.querySelector(".lives").innerHTML = "";
                for (let j = 0; j < gameStats.lives; j++) {
                    document.querySelector(".lives").innerHTML += '<img src="img/heart.png" style="width: 40px;">\n';
                }

                for (let j = 0; j < 3 - gameStats.lives; j++) {
                    document.querySelector(".lives").innerHTML += '<img src="img/heart_gray.png" style="width: 40px;">\n';
                }

                // Se o utilizador não tiver mais vidas, mostrar ecrã de game over
                if (gameStats.lives < 1) {
                    canvas.style.display = "none";
                    document.querySelector(".game-over").style.display = "flex";
                    shouldRenderBeExecuted = false;
                    arrayAsteroids = new Array();
                }

                break;
            }
        }
    }

    getCenter(coord) {
        return coord == "x" ? this.x + (this.width / 2) : this.y + (this.height / 2);
    }
}

class Bullet {
    constructor() {
        // Raio da bala
        this.r = 5;

        // Velocidade da bala
        this.vel = 5;

        // Ângulo de direção da bala
        this.angle = spaceship.angle;

        // Posição inicial X
        this.x = spaceship.x + (spaceship.width / 2) + spaceship.width / 2 * Math.cos(this.angle - (Math.PI / 2));

        // Posição inicial Y
        this.y = spaceship.y + (spaceship.height / 2) + spaceship.height / 2 * Math.sin(this.angle - (Math.PI / 2));

        // Guardar a data do disparo da bala para poder ser possível aplicar o delay
        this.date = new Date();

        // Delay entre o disparo das balas em milissegundos
        this.delay = 150;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = "#F69125";
        ctx.fill();
        ctx.closePath();
    }

    update() {
        // Remover as balas que já saíram do ecrã
        for (let i = 0; i < bullets.length; i++) {
            if (bullets[i].y < 0 - this.r) {
                bullets.splice(i, 1);
            }
        }

        // Atualizar o movimento das balas que estão ativas 
        this.x += Math.cos(this.angle - (Math.PI / 2)) * this.vel;
        this.y += Math.sin(this.angle - (Math.PI / 2)) * this.vel;
    }
}

window.addEventListener("keydown", event => {
    keys[event.key] = true;
    event.preventDefault();
});

window.addEventListener("keyup", event => {
    keys[event.key] = false;
});

function handleSpaceshipControls() {
    if (enableControls) {
        if (keys["ArrowUp"]) {
            // Quando a nave se mover, alterar o source do SVG para ser mostrado o fogo
            if (spaceship.imgsrc != "img/spaceship_fire.svg") {
                spaceship.imgsrc = "img/spaceship_fire.svg";
            }

            // Aumentar a aceleração da nave quando a seta para cima for pressionada
            if (spaceship.curAccel < spaceship.accelLimit) {
                spaceship.curAccel += 0.02;
            }
        } else {
            // Quando a nave estiver parada, alterar o source do SVG para não ser mostrado o fogo
            if (spaceship.imgsrc != "img/spaceship.svg") {
                spaceship.imgsrc = "img/spaceship.svg";
            }

            // Diminuir a aceleração da nave quando a seta para cima for largada
            if (spaceship.curAccel > 0) {
                spaceship.curAccel -= 0.01;
            }
        }

        // Atualizar o movimento da nave de acordo com o ângulo para onde está virada
        spaceship.x += Math.cos(spaceship.angle - (Math.PI / 2)) * spaceship.curAccel;
        spaceship.y += Math.sin(spaceship.angle - (Math.PI / 2)) * spaceship.curAccel;

        if (keys["ArrowLeft"]) {
            spaceship.angle -= 0.05;
        }

        if (keys["ArrowRight"]) {
            spaceship.angle += 0.05;
        }

        if (keys[" "]) { // Lidar com a tecla de espaço
            // Se a última bala tiver sido disparada há mais de X milissegudos atrás, permitir novo disparo
            const LAST_BULLET = bullets[bullets.length - 1];

            if (bullets.length == 0 || new Date().getTime() - LAST_BULLET.date.getTime() >= LAST_BULLET.delay) {
                bullets.push(new Bullet());
            }
        }
    }
}

function areObjectsColliding(x1, y1, x2, y2, r1, r2) {
    // PDF 07_OBJECTS_COLLISIONS, pág. 20/29
    return (Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)) < r1 + r2) ? true : false;
}

function render() {
    // Limpar o ecrã todas as vezes que o render for executado
    ctx.clearRect(0, 0, W, H);

    // Se verdade, o render não deverá ser mais executado
    if (shouldRenderBeExecuted) {
        // Mover a nave quando as setas forem pressionadas
        handleSpaceshipControls();

        // Desenhar os asteróides
        arrayAsteroids.forEach(asteroid => {
            asteroid.draw();
            asteroid.update();
        });

        // Desenhar nave
        spaceship.draw();
        spaceship.update();

        // Desenhar balas
        bullets.forEach(bullet => {
            bullet.draw();
            bullet.update();
        });

        if (arrayAsteroids.length == 0) {

            gameStats.round += 1
            document.querySelector(".current-round .text").innerHTML = gameStats.round;
            // Desenhar asteróide
            for (let i = 0; i < 5; i++) {
                // Verificar se o asteróide não nasce em cima da nave
                arrayAsteroids.push(new Asteroid(0, 0, 1));
            }
        }

        window.requestAnimationFrame(render);
    }
}

function startGame() {
    arrayAsteroids = [];
    bullets = [];
    // Esconder o menu e mostrar o canvas e as estatísticas
    document.querySelector(".game-over").style.display = "none";
    document.querySelector(".menu").style.display = "none";
    canvas.style.display = "block";
    document.querySelector(".game-stats").style.visibility = "visible";
    document.querySelector(".highest-score .text").innerHTML = gameStats.highestScore;

    // Permitir o render
    shouldRenderBeExecuted = true;

    // Resetar as estatísticas
    gameStats.points = 0;
    gameStats.lives = 3;
    gameStats.round = 1;

    // Renderizar as estatísticas resetadas
    document.querySelectorAll(".lives img").forEach(heart => heart.src = "img/heart.png");
    document.querySelector(".current-score .text").innerHTML = gameStats.points;
    document.querySelector(".current-round .text").innerHTML = gameStats.round;
    document.querySelector(".highest-score .text").innerHTML = gameStats.highestScore;

    // Desenhar nave
    if (!spaceship) {
        spaceship = new Spaceship();
    }

    // Desenhar asteróide
    for (let i = 0; i < 1; i++) {
        // Verificar se o asteróide não nasce em cima da nave
        arrayAsteroids.push(new Asteroid(0, 0, 1));
    }

    // Start the animation
    render();
    console.log("The game has started");
}

setTimeout(function () {
    document.querySelector(".intro").style.display = "none";
    document.querySelector(".menu").style.display = "flex";
    document.querySelector(".pop-up").style.display = "flex";
    // startGame();
}, 1000);

function unmute() {
    const AUDIO = document.querySelector("#menu-hover");
    AUDIO.volume = 0.05;
    document.querySelector(".pop-up").style.display = "none";

    document.querySelectorAll(".menu li").forEach(span => {
        span.addEventListener("mouseover", function (e) {
            AUDIO.currentTime = 0;
            AUDIO.play();
        });

        span.addEventListener("mouseleave", function (e) {
            AUDIO.currentTime = 0;
            AUDIO.pause();
        });
    });
}