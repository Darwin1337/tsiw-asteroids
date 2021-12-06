const BTN_PLAY = document.querySelector("#play");
const BTN_LEADERBOARD = document.querySelector("#leaderboard");
const BTN_QUIT = document.querySelector("#quit");
const SPACESHIP1 = document.querySelector("#nave-play");
const SPACESHIP2 = document.querySelector("#nave-leaderboard");
const SPACESHIP3 = document.querySelector("#nave-quit");

// Animação dos asteróides
animateAsteroids()
animationInterval = setInterval(function(){ animateAsteroids() }, 1000);

function animateAsteroids() {
    // Animação dos asteróides que aparecem na introdução
    document.querySelectorAll(".floating-asteroids img").forEach(asteroid => {
        // Obter coordenadas aleatórias para posteriormente ser aplicado o translate
        const coordX = Math.floor(Math.random() * ((document.querySelector("body").offsetWidth - 150) - 0 + 1) + 0);
        const coordY = Math.floor(Math.random() * ((document.querySelector("body").offsetHeight - 150) - 0 + 1) + 0);
        asteroid.style.transform = "translateX(" + coordX + "px) translateY(" + coordY + "px)";
    });
}

// Animações da nave no menu principal
BTN_PLAY.addEventListener("mouseover", function (e) {
    SPACESHIP1.style.display = "block";
    // Obter a coordenada Y do item do menu para posicionar a nave exatamente no meio
    SPACESHIP1.style.top = (getCoordinates(e.target).y + (e.target.offsetHeight / 2)) - (document.querySelectorAll("ul img")[0].offsetHeight / 2) + "px";
    // Dar um valor negativo à coordenada X para inicialmente a nave estar escondida
    SPACESHIP1.style.left = -document.querySelectorAll("ul img")[0].offsetWidth + "px";
    // Tornar a nave visível
    SPACESHIP1.style.visibility = "visible";
    // Animar a nave até ao X do elemento <nav>
    SPACESHIP1.style.transform = "translateX(" + getCoordinates(document.querySelector("nav")).x + "px) rotate(90deg)";
});

BTN_PLAY.addEventListener("mouseleave", stopAnimation);
function stopAnimation() {
    // Esconder a nave
    SPACESHIP1.style.visibility = "hidden";
    // Remover a animação
    SPACESHIP1.style.transform = "";
}

BTN_PLAY.addEventListener("click", function (e) {
    // Se o utilizador não introduzir um nome ou o mesmo não corresponder às regras definidas o jogo não deverá começar
    if (document.querySelector(".username input").value.trim().replace(" ", "").length > 2 && document.querySelector(".username input").value.trim().replace(" ", "").length <= 15) {
        // Se o nome for válido, não podemos fazer a animação de voltar a esconder (stopAnimation) porque queremos que a nave vá para a posição inicial da nave que irá ser controlada 
        BTN_PLAY.removeEventListener("mouseleave", stopAnimation);
        // Mostrar a nave
        SPACESHIP1.style.visibility = "visible";
        // Obter as coordenadas corretas da nave que irá ser controlada para podermos animar o SVG da nave até essa posição
        const YCOORD = ((window.innerHeight / 2) - (document.querySelectorAll("ul img")[0].offsetHeight / 2)) - parseFloat(SPACESHIP1.style.top.replace('px', ''));
        const XCOORD = (window.innerWidth / 2) + (document.querySelectorAll("ul img")[0].offsetWidth / 2);
        // Animar a nave
        SPACESHIP1.style.transform = "translateX(" + XCOORD + "px) translateY(" + YCOORD + "px) rotate(0deg)";
        // Esconder o menu
        document.querySelector(".menu").style.display = "none";
    
        setTimeout(function () {
            // Esconder o SVG da nave para que a nave que irá ser controlada ser a única visível
            SPACESHIP1.style.display = "none";
            SPACESHIP1.style.visibility = "hidden";
            SPACESHIP1.style.transform = "";
            startGame();
        }, 1000);
    } else {
        alert("O nome introduzido terá de conter pelo menos 3 letras e no máximo 15!");
    }
});

BTN_LEADERBOARD.addEventListener("mouseover", function (e) {
    // Obter a coordenada Y do item do menu para posicionar a nave exatamente no meio
    SPACESHIP2.style.top = (getCoordinates(e.target).y + (e.target.offsetHeight / 2)) - (document.querySelectorAll("ul img")[0].offsetHeight / 2) + "px";
    // Dar um valor negativo à coordenada X para inicialmente a nave estar escondida
    SPACESHIP2.style.left = -document.querySelectorAll("ul img")[0].offsetWidth + "px";
    // Tornar a nave visível
    SPACESHIP2.style.visibility = "visible";
    // Animar a nave até ao X do elemento <nav>
    SPACESHIP2.style.transform = "translateX(" + getCoordinates(document.querySelector("nav")).x + "px) rotate(90deg)";
});

BTN_LEADERBOARD.addEventListener("mouseleave", function (e) {
    // Esconder a nave
    SPACESHIP2.style.visibility = "hidden";
    // Remover a animação
    SPACESHIP2.style.transform = "";
});

BTN_QUIT.addEventListener("mouseover", function (e) {
    // Obter a coordenada Y do item do menu para posicionar a nave exatamente no meio
    SPACESHIP3.style.top = (getCoordinates(e.target).y + (e.target.offsetHeight / 2)) - (document.querySelectorAll("ul img")[0].offsetHeight / 2) + "px";
    // Dar um valor negativo à coordenada X para inicialmente a nave estar escondida
    SPACESHIP3.style.left = -document.querySelectorAll("ul img")[0].offsetWidth + "px";
    // Tornar a nave visível
    SPACESHIP3.style.visibility = "visible";
    // Animar a nave até ao X do elemento <nav>
    SPACESHIP3.style.transform = "translateX(" + getCoordinates(document.querySelector("nav")).x + "px) rotate(90deg)";
});

BTN_QUIT.addEventListener("mouseleave", function (e) {
    // Esconder a nave
    SPACESHIP3.style.visibility = "hidden";
    // Remover a animação
    SPACESHIP3.style.transform = "";
});

document.querySelector("#render-menu").addEventListener("click", function (e) {
    // Quando o utilizador morre, um botão para ir para o menu principal irá aparecer
    // Se o jogador escolher voltar para o menu principal é necessário tornar a adicionar a animação de esconder a nave
    BTN_PLAY.addEventListener("mouseleave", stopAnimation);
});

function getCoordinates(el) {
    // Retorna o x e o y de um certo elemento
    const RECT = el.getBoundingClientRect();
    return {
      x: RECT.left + window.scrollX,
      y: RECT.top + window.scrollY
    };
}