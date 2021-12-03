// As referências ao jogo original foram retiradas daqui
// https://atari.fandom.com/wiki/Asteroids
// http://www.classicgaming.cc/classics/asteroids/play-guide
// https://games.aarp.org/games/atari-asteroids
// https://youtu.be/WYSupJ5r2zo
// Foram apenas alterados alguns valores que, após as nossas simplificações, afetariam o jogo ao utilizador. Estes valores estão declarados no topo do documento
// como constantes, podendo serem facilmente alterados para os valores originais

const canvas = document.querySelector("canvas");
canvas.width = window.innerWidth - 20;
canvas.height = window.innerHeight - 20;
const ctx = canvas.getContext("2d");
const W = canvas.width;
const H = canvas.height;

// Informações sobre os asteróides
const ASTEROID_LEVELS = [
    // Utilizamos diferentes imagens com diferentes tamanhos pois o scale dinâmico da imagem afeta bastante a perfomance
    // https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas
    { level: 1, width: 210, height: 210, points: 50, img: "img/asteroid1.svg" },
    { level: 2, width: 150, height: 150, points: 100, img: "img/asteroid2.svg" },
    { level: 3, width: 75, height: 75, points: 200, img: "img/asteroid3.svg" }
];

// TO DO
// Animação da introdução (aperfeiçoar);
// Guardar nome do jogador;
// Leaderboard local com nome, pontuação e ronda;
// O jogador deverá poder enviar a nave para o hiperespaço, causando-a a desaparecer e aparecer num lugar aleatório no ecrã, com o risco de se autodestruír ou nascer em cima de um asteróide;
// A cada X pontos dar uma vida ao utilizador (que no máximo pode ter 5);
// Tornar cada ronda mais difícil até o jogador atingir os 30000 pontos, a partir daí terá sempre a mesma dificuldade;
// Resolver problema de alguns elementos SVG não funcionarem em certos browsers;
// As balas, se excederem os limites do canvas, deverão aparecer no lugar refletido;
// Só poderá haver 4 balas no ecrã de cada vez e as mesmas são removidas após terem percorrido uma certa distância.

// De quantos em quantos pontos é que o utilizador recebe uma vida
const POINTS_BETWEEN_LIVES = 5000;

// No jogo original, apenas são permitas 4 balas no ecrã de cada vez
const BULLETS_ALLOWED = 4;

// Quando o jogador atinge os 30000 pontos a dificuldade estabilizará
const DIFFICULTY_MULTIPLIER_LIMIT = 30000;

// Máximo de vidas que o utilizador poderá ter
const MAX_LIVES = 5;

// Guardar nome do utilizador
let playerName = "";

// Array que irá ficar com as teclas pressionadas
let keys = new Array();

// Variável que irá conter o objeto da nave
let spaceship = null;

// Array que irá conter todas as balas disparadas
let bullets = new Array();

// Array que irá conter todos os asteróides ativos
let asteroids = new Array();

// Variável auxiliar para dar vidas passado x pontos
let gamescore=0;

// Variável que irá ficar com as imagens da nave sem fogo, da nave com fogo e da explosão para o new Image() não estar sempre a ser chamado no draw()
let imgSpaceship = new Image();
imgSpaceship.src = "img/spaceship.svg";
let imgExplosion = new Image();
imgExplosion.src = "img/explosion.png";

// Variável que irá conter todas as informações do jogador e das suas estatísticas
let gameStats = {
    name: "John Doe",
    round: 1,
    score: 0,
    lives: 3, // Com quantas vidas é que o jogador começará
    highestScore: localStorage.highscore ? localStorage.highscore : 0
}

// Se esta variável estiver a true, o utilizador não poderá usar os controlos (marioritariamente usado para quando a nave é atingida por um asteróide)
let enableControls = false;

// Variável que irá deicdir se renderização deverá ser executada ou não
let shouldRenderBeExecuted = false;

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
            } while (areObjectsColliding(this.x + (this.width / 2), this.y + (this.height / 2), spaceship.getCenter("x"), spaceship.getCenter("y"), this.width / 2, spaceship.width * 4));
        } else {
            // Posição inicial X
            this.x = x;

            // Posição inicial Y
            this.y = y;
        }

        // Propriedade do objeto Image
        this.img = new Image();

        // Extrair o url do asteróide para o filter() não estar sempre a ser executado
        this.img.src = ASTEROID_LEVELS.filter(level => level.level == this.level)[0].img;

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
                    asteroids.push(new Asteroid(this.x + 2, this.y + 2, this.level + 1));
                    asteroids.push(new Asteroid(this.x - 2, this.y - 2, this.level + 1));
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
                asteroids.splice(asteroids.findIndex(asteroid => asteroid.id == this.id), 1);

                // Se entrar aqui, o jogador destruiu todos os asteróides e passou de nível
                if (asteroids.length == 0) {
                    gameStats.round += 1
                    document.querySelector(".current-round .text").innerHTML = gameStats.round;
                    // Desenhar asteróides
                    for (let i = 0; i < 5; i++) {
                        asteroids.push(new Asteroid(0, 0, 1));
                    }
                }
                //Verificar se o utiliador ganhou pontos suficientes para ganhar vida extra
                if(gameStats.lives< MAX_LIVES  && gameStats.score>=gamescore+POINTS_BETWEEN_LIVES){
                    gamescore=gameStats.score;
                    gameStats.lives+=1
                    document.querySelector(".lives").innerHTML=""
                    for (let j = 0; j < gameStats.lives; j++) {
                        document.querySelector(".lives").innerHTML += '<img src="img/heart.png" style="width: 40px;">\n';
                    }
                    for (let j = 0; j < MAX_LIVES - gameStats.lives; j++) {
                        document.querySelector(".lives").innerHTML += '<img src="img/heart_gray.png" style="width: 40px;">\n';
                    }
                }

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

        // Váriaveis usadas para controlar o tempo e animação de explosão
        this.isExploding = false;
        this.explosionTime = null;

        // Variável usada para controlar a animação da nave entre o fim da explosão e o início do respawn
        this.isRespawning = false;

        //
        this.countHyperspace++;
        this.clickTime=0;

        //
        this.forceExplosion=false;
    }

    draw() {
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
        if (!this.isExploding) {
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
            for (let i = 0; i < asteroids.length; i++) {
                // Se entrar neste if statement, quer dizer que a bala atingiu um asteróide
                if (areObjectsColliding(asteroids[i].getCenter("x"), asteroids[i].getCenter("y"), this.getCenter("x"), this.getCenter("y"), spaceship.width / 2, asteroids[i].width / 2) || this.forceExplosion)  {
                
                    // Decrementar e renderizar a quantidade de vidas do jogador
                    gameStats.lives--;
                    document.querySelector(".lives").innerHTML = "";
                    for (let j = 0; j < gameStats.lives; j++) {
                        document.querySelector(".lives").innerHTML += '<img src="img/heart.png" style="width: 40px;">\n';
                    }

                    for (let j = 0; j < MAX_LIVES - gameStats.lives; j++) {
                        document.querySelector(".lives").innerHTML += '<img src="img/heart_gray.png" style="width: 40px;">\n';
                    }

                    // Se o utilizador não tiver mais vidas, mostrar ecrã de game over
                    if (gameStats.lives < 1) {
                        // Mostrar imagem de uma explosão por cima da nave
                        ctx.drawImage(imgExplosion, this.getCenter("x") - 30, this.getCenter("y") - 30, 60, 60);

                        //Mostrar o ecrã de game over
                        document.querySelector(".game-over").style.display = "flex";
                        shouldRenderBeExecuted = false;
                    } else {
                        // Guardar as informações necessárias para a animação
                        this.isExploding = true;
                        this.explosionTime = new Date();

                        // Mostrar imagem de uma explosão por cima da nave
                        ctx.drawImage(imgExplosion, this.getCenter("x") - 30, this.getCenter("y") - 30, 60, 60);

                        // Impedir o utilizador de controlar a nave
                        enableControls = false;
                    }
                    //
                    if (asteroids[i].level < 3 && !this.forceExplosion) {
                        // Se o nível do asteróide atingido não for o último, dividi-lo em 2 com nível superior
                        asteroids.push(new Asteroid(asteroids[i].x + 2, asteroids[i].y + 2, asteroids[i].level + 1));
                        asteroids.push(new Asteroid(asteroids[i].x - 2, asteroids[i].y - 2, asteroids[i].level + 1));
                        asteroids.splice(i,1)
                    }

                    break;
                }
            }
        } else {
            if (!this.isRespawning) {
                ctx.drawImage(imgExplosion, this.getCenter("x") - 30, this.getCenter("y") - 30, 60, 60);
            } else {
                if (Math.random() > 0.5) {
                    imgSpaceship.src = "";
                } else {
                    imgSpaceship.src = "img/spaceship.svg";
                }
            }

            if (new Date().getTime() - this.explosionTime.getTime() >= 1000) {
                this.isRespawning = true;

                let isSpawnDoable = true;
                for (let i = 0; i < asteroids.length; i++) {
                    if (areObjectsColliding(asteroids[i].x + (asteroids[i].width / 2), asteroids[i].y + (asteroids[i].height / 2), W / 2, H / 2, asteroids[i].width / 2, this.width * 4)) {
                        isSpawnDoable = false;
                        break;
                    }
                }

                if (isSpawnDoable) {
                    this.x = (W / 2) - (this.width / 2);
                    this.y = (H / 2) - (this.height / 2)
                    this.curAccel = 0;
                    this.angle = 0;
                    enableControls = true;
                    this.isExploding = false;
                    this.isRespawning = false;
                    this.forceExplosion=false;
                }
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
    
        //clicar no x e dar spawn a nave numa posição aleatoria -- Ainda nao esta feito
        if(keys["x"]){
            if(new Date().getTime()-spaceship.clickTime<=5000){
                spaceship.countHyperspace++;
                let rnd = Math.floor(Math.random() * (100 - 1) ) + 1; 
                if (rnd <= 25 * (spaceship.countHyperspace - 1)) {
                    spaceship.countHyperspace=0;
                    spaceship.forceExplosion=true;
                }
                spaceship.x=Math.random()*W-40;
                spaceship.y=Math.random()*H-40;
            }
            else{
                spaceship.countHyperspace = 1
                spaceship.x=Math.random()*W-40;
                spaceship.y=Math.random()*H-40;
            }
            spaceship.clickTime=new Date().getTime()
            
            keys["x"]=false
        }

        if (keys["ArrowUp"]) {
            // Quando a nave se mover, alterar o source do SVG para ser mostrado o fogo
            if (imgSpaceship.src != "img/spaceship_fire.svg") {
                imgSpaceship.src = "img/spaceship_fire.svg";
            }

            // Aumentar a aceleração da nave quando a seta para cima for pressionada
            if (spaceship.curAccel < spaceship.accelLimit) {
                spaceship.curAccel += 0.02;
            }
        } else {
            // Quando a nave estiver parada, alterar o source do SVG para não ser mostrado o fogo
            if (imgSpaceship.src != "img/spaceship.svg") {
                imgSpaceship.src = "img/spaceship.svg";
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

    // Mover a nave quando as setas forem pressionadas
    handleSpaceshipControls();

    // Desenhar os asteróides
    asteroids.forEach(asteroid => {
        if (asteroid.img.complete) {
            // Se a imagem do asteróide já estiver carregada, mandar desenhar
            asteroid.draw();
            asteroid.update();
        } else {
            // Se não estiver carregada, esperar que carregue e só depois mandar desenhar
            asteroid.img.onload = function() {
                asteroid.draw();
                asteroid.update();
            }
        }
    });

    // Desenhar nave
    if (imgSpaceship.complete) {
        // Se a imagem da nave já estiver carregada, mandar desenhar
        spaceship.draw();
        spaceship.update();
    } else {
        // Se não estiver carregada, esperar que carregue e só depois mandar desenhar
        imgSpaceship.onload = function() {
            spaceship.draw();
            spaceship.update();
        }
    }

    // Desenhar balas
    bullets.forEach(bullet => {
        bullet.draw();
        bullet.update();
    });

    if (shouldRenderBeExecuted) {
        window.requestAnimationFrame(render);
    }

    
}

function startGame() {
    // Limpar o ecrã todas as vezes que o render for executado
    ctx.clearRect(0, 0, W, H);

    // Forçar a limpeza de todos os elementos do jogo
    spaceship = null;
    asteroids = new Array();
    bullets = new Array();

    // Esconder o menu e mostrar o canvas e as estatísticas
    document.querySelector(".game-over").style.display = "none";
    document.querySelector(".menu").style.display = "none";
    canvas.style.display = "block";
    document.querySelector(".game-stats").style.visibility = "visible";
    document.querySelector(".highest-score .text").innerHTML = gameStats.highestScore;
    document.querySelector(".countdown .text").innerHTML = "3";

    // Não permitir os controlos até que o countdown esteja completo
    enableControls = false;

    // Não permitir que o render se repita até que o countdown esteja terminado
    shouldRenderBeExecuted = false;

    // Resetar as estatísticas
    gameStats.score = 0;
    gameStats.lives = 3;
    gameStats.round = 1;

    // Renderizar as estatísticas resetadas
    for(let i=0; i<3;i++){
        document.querySelectorAll(".lives img")[i].src = "img/heart.png";
    }
    
    document.querySelector(".current-score .text").innerHTML = gameStats.score;
    document.querySelector(".current-round .text").innerHTML = gameStats.round;
    document.querySelector(".highest-score .text").innerHTML = gameStats.highestScore;

    // Desenhar nave
    spaceship = new Spaceship();

    // Desenhar asteróide
    for (let i = 0; i < 5; i++) {
        // Verificar se o asteróide não nasce em cima da nave
        asteroids.push(new Asteroid(0, 0, 1));
    }

    // Executar o render pelo menos uma vez para o jogador poder ver tanto a posição da nave como a dos asteróides
    render();

    // Começar o countdown
    createCountdown();
}

setTimeout(function () {
    document.querySelector(".intro").style.display = "none";
    document.querySelector(".menu").style.display = "flex";
    document.querySelector(".pop-up").style.display = "flex";
    // startGame();
}, 5000);

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

function mainMenu() {
    document.querySelector(".game-over").style.display = "none";
    canvas.style.display = "none";
    document.querySelector(".game-stats").style.visibility = "hidden";
    document.querySelector(".menu").style.display = "flex";
}

function runCountdown() {
    const ELEMENT = document.querySelector(".countdown p");
    ELEMENT.innerHTML = parseInt(ELEMENT.innerHTML) - 1;

    if (parseInt(ELEMENT.innerHTML) == 0) {
      // Parar de executar o countdown e limpar o ecrã
      clearInterval(countdownInterval);

      document.querySelector(".countdown").style.display = "none";

      // Permitir os controlos após o countdown
      enableControls = true;

      shouldRenderBeExecuted = true;

      // Start the animation
      render();
      console.log("The game has started");
    }
}

function createCountdown() {
    document.querySelector(".countdown").style.display = "flex";
    countdownInterval = setInterval(function() { runCountdown(); }, 1000);
}

let countdownInterval = null;