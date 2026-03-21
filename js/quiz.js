function startQuiz() {
    resetQuiz();
    toggle.style.display = 'none';
    guessedCount = 0;
    totalAttempts = 0;
    currentIndex = 0;
    for (let key in failCounts) delete failCounts[key];

    const currentExclude = getCurrentExcludeList();

    shuffledPaths = getActivePaths().slice().sort(() => Math.random() - 0.5);

    svgPath.forEach(p => {
        if (p.style.display === "none") return;

        let currentExclude = getCurrentExcludeList();

        if (currentExclude.includes(p.id)) {
            p.style.fill = "#888";
        } else {
            p.style.fill = "#2c7448";
        }
    });

    updateScore();
}

function updateScore() {
    const percent = totalAttempts ? Math.round((guessedCount / totalAttempts) * 100) : 0;
    scoreDiv.innerHTML = `${guessedCount}/${shuffledPaths.length} | ${percent}%`;
}

function setupPaths() {
    svgPath.forEach(item => {
        item.addEventListener('mouseover', () => {
            const currentExclude = getCurrentExcludeList();
            if (!currentExclude.includes(item.id)) item.style.fill = "#4b9c6b";
        });
        item.addEventListener('mouseout', () => {
            if (blinkingIntervals[item.id]) return;
            const currentExclude = getCurrentExcludeList();

            if (currentExclude.includes(item.id)) {
                item.style.fill = "#888";
                return;
            }

            if (mode === "lernen") {
                item.style.fill = "#2c7448";
                return;
            }

            if (mode === "quiz") {
                if (guessedPaths.has(item.id)) {
                    item.style.fill = finalColors[item.id];
                    return;
                }

                item.style.fill = "#2c7448";
            }
        });

        item.addEventListener('click', () => {
            if (mode === "lernen") showTooltip(item);
        });

        if (!window.rightMouseSystemInitialized) {
            window.rightMouseDown = false;
            window.dragMode = null;

            document.addEventListener("mousedown", (e) => {
                if (e.button === 2) {
                    window.rightMouseDown = true;
                }
            });

            document.addEventListener("mouseup", (e) => {
                if (e.button === 2) {
                    window.rightMouseDown = false;
                    window.dragMode = null;
                }
            });

            document.addEventListener("contextmenu", (e) => {
                e.preventDefault();
            });

            window.rightMouseSystemInitialized = true;
        }

        function saveExcludeList(list) {
            if (activeMap === "default") {
                excludeList = list;
                localStorage.setItem("excludeList", JSON.stringify(excludeList));
            } else {
                mapExcludeLists[activeMap] = list;
                localStorage.setItem("mapExcludeLists", JSON.stringify(mapExcludeLists));
            }
        }

        function toggleExclude(itemToToggle) {
            if (itemToToggle.style.display === "none") return false;

            if (mode === "quiz" && totalAttempts > 0) {
                const confirmChange = confirm(
                    "Diese Aktion setzt deine Runde zurück.\n\nFortfahren und Karte verändern?"
                );
                if (!confirmChange) return false;
            }

            let currentExclude = getCurrentExcludeList();
            const isExcluded = currentExclude.includes(itemToToggle.id);

            window.dragMode = isExcluded ? "remove" : "add";

            if (window.dragMode === "add") {
                currentExclude.push(itemToToggle.id);
                itemToToggle.style.fill = "#888";
            } else {
                currentExclude = currentExclude.filter(id => id !== itemToToggle.id);
                itemToToggle.style.fill = "#2c7448";
            }

            saveExcludeList(currentExclude);

            if (mode === "quiz") startQuiz();
            return true;
        }

        item.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            toggleExclude(item);
        });

        let longPressTimer = null;
        let longPressTriggered = false;

        item.addEventListener('touchstart', (event) => {
            if (event.touches.length !== 1) return;
            event.preventDefault();
            longPressTriggered = false;

            longPressTimer = setTimeout(() => {
                longPressTriggered = true;
                const toggled = toggleExclude(item);
                if (toggled) {
                    item.dataset.suppressClick = "1";
                    setTimeout(() => {
                        delete item.dataset.suppressClick;
                    }, 800);
                }
            }, 500);
        }, { passive: false });

        item.addEventListener('touchend', (e) => {
            if (item.dataset.suppressClick) {
                e.preventDefault();
                e.stopPropagation();
            }
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
            if (longPressTriggered) {
                e.preventDefault();
            }
        }, { passive: false });

        item.addEventListener('touchcancel', () => {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
        });

        item.addEventListener('mouseenter', () => {
            if (!window.rightMouseDown) return;
            if (!window.dragMode) return;
            if (item.style.display === "none") return;

            let currentExclude = getCurrentExcludeList();
            const isExcluded = currentExclude.includes(item.id);

            if (window.dragMode === "add" && !isExcluded) {
                currentExclude.push(item.id);
                item.style.fill = "#888";
                saveExcludeList(currentExclude);
                if (mode === "quiz") startQuiz();
            }

            if (window.dragMode === "remove" && isExcluded) {
                currentExclude = currentExclude.filter(id => id !== item.id);
                item.style.fill = "#2c7448";
                saveExcludeList(currentExclude);
                if (mode === "quiz") startQuiz();
            }
        });

        item.addEventListener('click', (e) => {
            if (item.dataset.suppressClick) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }
            if (item.style.display === "none") return;

            const currentExclude = getCurrentExcludeList();
            let level = 0;
            const target = shuffledPaths[currentIndex];

            if (mode === "lernen") {
                showTooltip(item);
                return;
            }

            if (currentExclude.includes(item.id)) return;
            totalAttempts++;

            level = failCounts[target.id] ? Math.min(failCounts[target.id]-1, failColors.length-1) : 0;

            if (item === target) {
                if (blinkingIntervals[target.id]) {
                    clearTimeout(blinkingIntervals[target.id]);
                    delete blinkingIntervals[target.id];
                }

                guessedPaths.add(target.id);

                let color;

                if (failCounts[target.id]) {
                    const level = Math.min(failCounts[target.id]-1, failColors.length-1);
                    color = failColors[level];
                } else {
                    color = "#ffffff";
                }

                target.style.fill = color;
                finalColors[target.id] = color;

                guessedCount++;
                currentIndex++;

                correctSound.currentTime = 0;
                correctSound.play();
            } else {
                if (!failCounts[target.id]) failCounts[target.id] = 1;
                else failCounts[target.id]++;

                if (failCounts[target.id] >= 3) {
                    startBlinking(target);
                }

                wrongSound.currentTime = 0;
                wrongSound.play();
            }

            updateScore();

            if (shuffledPaths[currentIndex]) {
                toggle.innerHTML = `Klicke auf: <strong>${shuffledPaths[currentIndex].id}</strong>`;
                toggle.style.display = 'block';
            } else {
                toggle.style.display = 'none';
            }

            if (guessedCount === shuffledPaths.length) {
                winSound.play();
                alert("Glückwunsch! Alle Gemeinden erraten!");
                startQuiz();
            }
        });
    });
}

function startBlinking(target) {
    if (blinkingIntervals[target.id]) return;

    let isRed = false;

    function blink() {
        if (guessedPaths.has(target.id)) {
            clearTimeout(blinkingIntervals[target.id]);
            delete blinkingIntervals[target.id];

            const level = Math.min(failCounts[target.id]-1, failColors.length-1);
            target.style.fill = failColors[level] || "#ffffff";
            return;
        }

        target.style.fill = isRed ? "#2c7448" : "#ff0000";
        isRed = !isRed;

        blinkingIntervals[target.id] = setTimeout(blink, 400);
    }

    blink();
}

function resetQuiz() {
    guessedCount = 0;
    totalAttempts = 0;
    currentIndex = 0;

    Object.keys(failCounts).forEach(key => delete failCounts[key]);
    guessedPaths.clear();
    Object.keys(finalColors).forEach(key => delete finalColors[key]);

    Object.keys(blinkingIntervals).forEach(id => {
        clearTimeout(blinkingIntervals[id]);
        delete blinkingIntervals[id];
    });

    svgPath.forEach(item => {
        item.style.fill = "#2c7448";
    });

    shuffledPaths = svgPath.filter(p => !excludeList.includes(p.id));
    shuffledPaths.sort(() => Math.random() - 0.5);

    updateScore();

    if (shuffledPaths.length > 0) {
        toggle.innerHTML = `Klicke auf: <strong>${shuffledPaths[0].id}</strong>`;
    }
}

function showTooltip(item) {
    let provinceId = null;
    let parent = item.parentElement;
    while (parent && !parent.id.startsWith("p_")) {
        parent = parent.parentElement;
    }
    provinceId = parent?.id;

    const size = tooltipSettings.provinces[provinceId] || tooltipSettings.generalSize;

    const tempTooltip = document.createElement('div');
    tempTooltip.innerHTML = item.id;

    const padding = Math.max(1, Math.round(size / 3));

    Object.assign(tempTooltip.style, {
        position: 'absolute',
        background: 'rgba(50,50,50,0.85)',
        color: 'white',
        padding: `${padding}px ${padding*2}px`,
        borderRadius: '4px',
        fontSize: `${size}px`,
        pointerEvents: 'none',
        opacity: 1,
        whiteSpace: 'nowrap'
    });
    const bbox = item.getBoundingClientRect();
    tempTooltip.style.left = `${bbox.left + bbox.width/2 + window.scrollX}px`;
    tempTooltip.style.top = `${bbox.top + bbox.height/2 + window.scrollY}px`;
    document.body.appendChild(tempTooltip);
    setTimeout(() => {
        tempTooltip.style.opacity = 0;
        setTimeout(() => tempTooltip.remove(), 800);
    }, 1000);
}

function updateQuizTooltipPosition(event) {
    if (mode !== "quiz" || !shuffledPaths[currentIndex]) return;

    const province = event.currentTarget;
    const provinceId = province.id;

    const size = tooltipSettings.provinces[provinceId] || tooltipSettings.generalSize;

    const x = event.clientX + window.scrollX + 10;
    const y = event.clientY + window.scrollY + 10;

    toggle.style.left = `${x}px`;
    toggle.style.top = `${y}px`;
    toggle.innerHTML = `Klicke auf: <strong>${shuffledPaths[currentIndex].id}</strong>`;

    toggle.style.fontSize = `${Math.round(size * 1.20)}px`;
    toggle.style.background = 'rgba(50,50,50,0.85)';
    const paddingY = Math.max(1, Math.round(size / 8));
    const paddingX = Math.max(4, Math.round(size / 2));
    toggle.style.padding = `${paddingY}px ${paddingX}px`;

    toggle.style.display = 'block';
}

modeSelect.addEventListener('change', () => {
    mode = modeSelect.value;
    if (mode === "quiz") startQuiz();
    else {
        const currentExclude = getCurrentExcludeList();
        svgPath.forEach(p => {
            if (p.style.display === "none") return;

            if (currentExclude.includes(p.id)) p.style.fill = "#888";
            else p.style.fill = "#2c7448";
        });
        toggle.style.display = 'none';
    }
});
