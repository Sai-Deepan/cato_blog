document.addEventListener("DOMContentLoaded", () => {

    const searchInput =
        document.getElementById("articleSearch");

    const cards =
        document.querySelectorAll(".article-card");

    searchInput.addEventListener("input", () => {

        const query =
            searchInput.value.toLowerCase();

        cards.forEach(card => {

            const text =
                card.textContent.toLowerCase();

            if (text.includes(query)) {
                card.style.display = "";
            } else {
                card.style.display = "none";
            }

        });

    });

});