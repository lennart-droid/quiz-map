async function loadSVG() {
    const container = document.getElementById("mapContainer");
    container.textContent = "Lade Karte...";

    try {
        const res = await fetch("./svg/italyMap.svg");
        if (!res.ok) {
            console.error(`SVG fetch failed: ${res.status} ${res.statusText}`);
            container.textContent =
                "Karte konnte nicht geladen werden. Tipp: Seite ueber einen lokalen Server (http://...) oeffnen, nicht via file://.";
            return;
        }
        container.innerHTML = await res.text();

        initApp();
    } catch (err) {
        console.error("SVG konnte nicht geladen oder initialisiert werden:", err);
        container.textContent =
            "Karte konnte nicht geladen werden. Tipp: Seite ueber einen lokalen Server (http://...) oeffnen, nicht via file://.";
    }
}

function initApp() {
    svgPath = Array.from(document.querySelectorAll('svg g.comuni path'));
    provinceGroups = Array.from(document.querySelectorAll('svg g.province > g[id]'));

    setupPaths();
    startQuiz();

    provinceGroups.forEach(province => {
        province.addEventListener('mousemove', updateQuizTooltipPosition);
        province.addEventListener('mouseout', () => {
            if (mode === "quiz") toggle.style.display = 'none';
        });
    });
}

loadSVG();
