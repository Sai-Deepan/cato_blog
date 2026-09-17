window.addEventListener("load", () => {

    gsap.registerPlugin(ScrollTrigger);

    const tl = gsap.timeline({

        scrollTrigger: {

            trigger: ".hero-transition",

            start: "top top",

            end: "+=800",

            scrub: 1,

            pin: true

        }

    });

    /*
     * Polygon and statue expand together
     */

    tl.to(".polygon", {

        scale: 5,

        duration: 2,

        ease: "none"

    }, 0);

    tl.to(".hero-statue", {

        scale: 1,

        duration: 2,

        ease: "none"

    }, 0);

    /*
     * Remove yellow layer
     */

    tl.to(".yellow-layer", {

        yPercent: -100,

        duration: 1,

        ease: "none"

    });

    /*
     * Reveal homepage
     */

    tl.to(".site-content", {

        opacity: 1,

        duration: 0.5,

        ease: "none"

    }, "<");

    /*
     * Reveal navigation
     */

    tl.to(".navbar", {

        opacity: 1,

        y: 0,

        duration: 0.5,

        ease: "none"

    }, "<");

});