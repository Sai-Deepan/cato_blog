function resizeCanvas() {
    console.log("resizeCanvas");

    const parent = canvas.parentElement;

    const width = parent.offsetWidth;
    const height = parent.offsetHeight;

    console.log(width, height);

    canvas.width = width;
    canvas.height = height;

    columns = Math.ceil(width / charWidth);
    rows = Math.ceil(height / charHeight);

    letters = [];

    for (let i = 0; i < columns * rows; i++) {
        letters.push({
            char: randomChar(),
            color: randomColor()
        });
    }

    console.log("letters:", letters.length);
}