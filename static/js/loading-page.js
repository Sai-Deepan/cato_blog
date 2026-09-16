(() => {
    const loader = document.getElementById("loader");
    if (!loader) return;
    let timeline;
    const dismiss = () => {
        timeline?.kill();
        loader.style.display = "none";
        clearTimeout(fallback);
    };
    // Never leave a blocking overlay behind if a CDN or page asset fails to load.
    const fallback = setTimeout(dismiss, 4000);

window.addEventListener("load", () => {

    if (loader.style.display === "none") return;
    if (!window.gsap || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        dismiss();
        return;
    }

    const tl = timeline = gsap.timeline({ onComplete: dismiss });

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
})();
