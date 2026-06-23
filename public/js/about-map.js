window.addEventListener("load", () => {

    gsap.registerPlugin(ScrollTrigger);

    const tl = gsap.timeline({

    scrollTrigger: {
        trigger: ".journey-map",
        start: "top top",
        end: "+=1000",
        scrub: 1
    }

    });

    tl.to("#camera", {
        scale: 4,
        x: -1200,
        y: -300
    })

    .to("#camera", {
        scale: 10,
        x: -3500,
        y: -800
    })

    .to(".location-panel", {
        opacity: 1,
        right: 80
    });

});