function showProject(id, button) {
    const section = button?.closest(".projects-section");
    const panel = document.getElementById(id);
    if (!section || !panel || !section.contains(panel) || button.disabled) return;
    if (panel.classList.contains("active")) return;

    section.querySelectorAll(".project-content").forEach(project => {
        const active = project === panel;
        project.classList.toggle("active", active);
        project.inert = !active;
        project.setAttribute("aria-hidden", String(!active));
    });
    section.querySelectorAll(".project-shape").forEach(shape => {
        const active = shape === button;
        shape.classList.toggle("active", active);
        shape.setAttribute("aria-pressed", String(active));
    });
}

document.querySelectorAll(".projects-section").forEach(section => {
    section.querySelectorAll(".project-content").forEach(panel => {
        const active = panel.classList.contains("active");
        panel.inert = !active;
        panel.setAttribute("aria-hidden", String(!active));
    });
    section.querySelectorAll(".project-shape").forEach(button => {
        button.setAttribute("aria-pressed", String(button.classList.contains("active")));
    });
});
