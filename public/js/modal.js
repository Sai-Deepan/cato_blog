function openSkill(id) {

    document.getElementById("overlay").style.display = "flex";

    document.querySelectorAll(".modal").forEach(modal => {
        modal.style.display = "none";
    });

    document.getElementById(id).style.display = "block";
}

function closeSkill() {
    document.getElementById("overlay").style.display = "none";
}