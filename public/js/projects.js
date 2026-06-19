function showProject(id, button) {

    document
        .querySelectorAll(".project-content")
        .forEach(project => {
            project.classList.remove("active");
        });

    document
        .querySelectorAll(".project-shape")
        .forEach(shape => {
            shape.classList.remove("active");
        });

    document
        .getElementById(id)
        .classList.add("active");

    button.classList.add("active");
}