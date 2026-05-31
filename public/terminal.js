const input = document.getElementById("terminal-input");
const output = document.getElementById("terminal-output");

const commands = {

    help: `
about
research
articles
cves
resume
contact
clear
`,

    about: `
Deepan Sai
Security Researcher
AI Researcher
Developer
`,

    research: `
Opening Research...
`,

    articles: `
Opening Articles...
`,

    cves: `
Opening CVEs...
`,

    resume: `
Resume available soon.
`,

    contact: `
GitHub: github.com/yourusername
Email: you@example.com
`
};

function addLine(text) {

    const div = document.createElement("div");

    div.className = "line";

    div.innerHTML = text;

    output.appendChild(div);

    output.scrollTop = output.scrollHeight;
}

input.addEventListener("keydown", function(e){

    if(e.key !== "Enter") return;

    const cmd = input.value.trim().toLowerCase();

    addLine(`<span class="prompt">root@root:~$</span> ${cmd}`);

    if(cmd === "clear") {

        output.innerHTML = "";

        input.value = "";

        return;
    }

    if(cmd === "research") {
        window.location.href = "/research/";
        return;
    }

    if(cmd === "articles") {
        window.location.href = "/articles/";
        return;
    }

    if(cmd === "cves") {
        window.location.href = "/cves/";
        return;
    }

    addLine(commands[cmd] || "Command not found.");

    input.value = "";
});