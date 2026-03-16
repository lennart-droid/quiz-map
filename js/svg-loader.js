async function loadSVG() {
    const container = document.getElementById("mapContainer");
    container.textContent = "Lade Karte...";

    try {
        const res = await fetch("./svg/italyMap.svg");
        if (!res.ok) throw new Error(`SVG fetch failed: ${res.status} ${res.statusText}`);
        const svgText = await res.text();

        container.innerHTML = svgText;

        initApp();
    } catch (err) {
        console.error(err);
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
