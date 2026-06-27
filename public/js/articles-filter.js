document.addEventListener("DOMContentLoaded", () => {

    const tags = document.querySelectorAll(".tag-filter span");
    const articles = document.querySelectorAll(".article-card");

    tags.forEach(tag => {

        tag.addEventListener("click", () => {

            tags.forEach(t => t.classList.remove("active"));
            tag.classList.add("active");

            const selectedTag = tag.dataset.tag;

            articles.forEach(article => {

                if (selectedTag === "all") {

                    article.style.display = "";

                    return;

                }

                const articleTags =
                    article.dataset.tags.split(",");

                if (articleTags.includes(selectedTag)) {

                    article.style.display = "";

                } else {

                    article.style.display = "none";

                }

            });

        });

    });

});