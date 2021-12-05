const BTN_PLAY = document.querySelector("#play");
const BTN_LEADERBOARD = document.querySelector("#leaderboard");
const BTN_QUIT = document.querySelector("#quit");
const SPACESHIP1 = document.querySelector("#nave-play");
const SPACESHIP2 = document.querySelector("#nave-leaderboard");
const SPACESHIP3 = document.querySelector("#nave-quit");

BTN_PLAY.addEventListener("mouseover", function (e) {
    SPACESHIP1.style.display = "";
    SPACESHIP1.style.top = (getCoordinates(e.target).y + (e.target.offsetHeight / 2)) - (document.querySelectorAll("ul img")[0].offsetHeight / 2) + "px";
    SPACESHIP1.style.left = -document.querySelectorAll("ul img")[0].offsetWidth + "px";
    SPACESHIP1.style.visibility = "visible";
    SPACESHIP1.style.transform = "translateX(" + getCoordinates(document.querySelector("nav")).x + "px) rotate(90deg)";
});

BTN_PLAY.addEventListener("mouseleave", stopAnimation);
function stopAnimation() {
    SPACESHIP1.style.visibility = "hidden";
    SPACESHIP1.style.transform = "";
}

BTN_PLAY.addEventListener("click", function (e) {
    if (document.querySelector(".username input").value.trim().replace(" ", "").length > 2 && document.querySelector(".username input").value.trim().replace(" ", "").length <= 15) {
        BTN_PLAY.removeEventListener("mouseleave", stopAnimation);
        SPACESHIP1.style.visibility = "visible";
        const YCOORD = ((window.innerHeight / 2) - (document.querySelectorAll("ul img")[0].offsetHeight / 2)) - parseFloat(SPACESHIP1.style.top.replace('px', ''));
        const XCOORD = (window.innerWidth / 2) + (document.querySelectorAll("ul img")[0].offsetWidth / 2);
        SPACESHIP1.style.transform = "translateX(" + XCOORD + "px) translateY(" + YCOORD + "px) rotate(0deg)";
        document.querySelector(".menu").style.display = "none";
    
        setTimeout(function () {
            SPACESHIP1.style.display = "none";
            SPACESHIP1.style.visibility = "hidden";
            SPACESHIP1.style.transform = "";
            startGame();
        }, 1000);
    } else {
        alert("Introduza um nome válido!");
    }
});

BTN_LEADERBOARD.addEventListener("mouseover", function (e) {
    SPACESHIP2.style.top = (getCoordinates(e.target).y + (e.target.offsetHeight / 2)) - (document.querySelectorAll("ul img")[0].offsetHeight / 2) + "px";
    SPACESHIP2.style.left = -document.querySelectorAll("ul img")[0].offsetWidth + "px";

    SPACESHIP2.style.visibility = "visible";
    SPACESHIP2.style.transform = "translateX(" + getCoordinates(document.querySelector("nav")).x + "px) rotate(90deg)";
});

BTN_LEADERBOARD.addEventListener("mouseleave", function (e) {
    SPACESHIP2.style.visibility = "hidden";
    SPACESHIP2.style.transform = "";
});

BTN_QUIT.addEventListener("mouseover", function (e) {
    SPACESHIP3.style.top = (getCoordinates(e.target).y + (e.target.offsetHeight / 2)) - (document.querySelectorAll("ul img")[0].offsetHeight / 2) + "px";
    SPACESHIP3.style.left = -document.querySelectorAll("ul img")[0].offsetWidth + "px";

    SPACESHIP3.style.visibility = "visible";
    SPACESHIP3.style.transform = "translateX(" + getCoordinates(document.querySelector("nav")).x + "px) rotate(90deg)";
});

BTN_QUIT.addEventListener("mouseleave", function (e) {
    SPACESHIP3.style.visibility = "hidden";
    SPACESHIP3.style.transform = "";
});

document.querySelector("#render-menu").addEventListener("click", function (e) {
    BTN_PLAY.addEventListener("mouseleave", stopAnimation);
});

function getCoordinates(el) {
    const RECT = el.getBoundingClientRect();
    return {
      x: RECT.left + window.scrollX,
      y: RECT.top + window.scrollY
    };
}