window.addEventListener("load", () => {

    const tl = gsap.timeline();

    tl.fromTo(".loader-logo",
    {
        opacity: 0
    },
    {
        opacity: 1,
        duration: 0.6
    })

    // Keep the loader visible
    .to({}, {
        duration: 1.5
    })

    // Fade the entire loader out
    .to("#loader", {
        opacity: 0,
        duration: 0.8,
        ease: "power2.out"
    })

    // Remove it from the page
    .set("#loader", {
        display: "none"
    });

});