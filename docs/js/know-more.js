(() => {
const sidebar = document.getElementById("aboutSidebar");
const overlay = document.getElementById("sidebarOverlay");

const heroLeft = document.querySelector(".about-left");
const heroRight = document.querySelector(".about-right");

if (!sidebar || !overlay || !document.getElementById("knowMoreBtn") ||
    !document.getElementById("closeSidebar")) return;

document
    .getElementById("knowMoreBtn")
    .addEventListener("click", openSidebar);

document
    .getElementById("closeSidebar")
    .addEventListener("click", closeSidebar);

overlay.addEventListener("click", closeSidebar);

function openSidebar() {

    sidebar.classList.add("open");
    overlay.classList.add("show");

    gsap.to([heroLeft, heroRight], {
        x: -30,
        duration: 0.45,
        ease: "power3.out"
    });

}

function closeSidebar() {

    sidebar.classList.remove("open");
    overlay.classList.remove("show");

    gsap.to([heroLeft, heroRight], {
        x: 0,
        duration: 0.45,
        ease: "power3.out"
    });

}
})();
