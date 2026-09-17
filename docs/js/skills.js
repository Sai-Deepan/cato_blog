function showSkill(id, button) {

    const panel = document.getElementById(id);

    // Close if already open
    if (panel.style.display === "block") {

        panel.style.display = "none";
        button.classList.remove("active");

        return;
    }

    // Hide all panels
    document.querySelectorAll(".skill-panel")
        .forEach(panel => {
            panel.style.display = "none";
        });

    // Reset tabs
    document.querySelectorAll(".skill-tab")
        .forEach(tab => {
            tab.classList.remove("active");
        });

    // Show selected panel
    panel.style.display = "block";
    button.classList.add("active");
}
