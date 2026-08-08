function getCurrentExcludeList() {
    return activeMap === "default"
        ? excludeList
        : mapExcludeLists[activeMap] || [];
}

function getActivePaths() {
    const currentExclude = activeMap === "default"
        ? excludeList
        : mapExcludeLists[activeMap] || [];

    return svgPath.filter(p =>
        !currentExclude.includes(p.id) &&
        p.style.display !== "none"
    );
}

function saveCurrentExcludeList(list) {
    if (activeMap === "default") {
        excludeList = list;
        localStorage.setItem("excludeList", JSON.stringify(excludeList));
    } else {
        mapExcludeLists[activeMap] = list;
        localStorage.setItem("mapExcludeLists", JSON.stringify(mapExcludeLists));
    }
}

function updatePathColors() {
    const currentExclude = getCurrentExcludeList();

    svgPath.forEach(p => {
        if (p.style.display === "none") return;
        p.style.fill = currentExclude.includes(p.id) ? "#888" : "#2c7448";
    });
}

function confirmMapChangeIfNeeded() {
    if (mode !== "quiz" || totalAttempts === 0) return true;

    return confirm(
        "Diese Aktion setzt deine Runde zurueck.\n\nFortfahren und Karte veraendern?"
    );
}

function togglePathExclude(itemToToggle, dragMode = null) {
    if (itemToToggle.style.display === "none") return false;
    if (!confirmMapChangeIfNeeded()) return false;

    let currentExclude = getCurrentExcludeList();
    const isExcluded = currentExclude.includes(itemToToggle.id);
    const modeToApply = dragMode || (isExcluded ? "remove" : "add");

    if (modeToApply === "add" && !isExcluded) {
        currentExclude = [...currentExclude, itemToToggle.id];
        itemToToggle.style.fill = "#888";
    }

    if (modeToApply === "remove" && isExcluded) {
        currentExclude = currentExclude.filter(id => id !== itemToToggle.id);
        itemToToggle.style.fill = "#2c7448";
    }

    saveCurrentExcludeList(currentExclude);
    if (mode === "quiz") startQuiz();
    return true;
}

function buildRegionProvinceStructure() {
    const structure = {};

    const regionGroups = document.querySelectorAll("svg g.regioni > g");

    regionGroups.forEach(region => {
        const regionId = region.id;
        if (!regionId) return;

        structure[regionId] = [];

        const provinces = region.querySelectorAll("g.province");

        provinces.forEach(province => {
            const provinceId = province.id;
            if (provinceId) {
                structure[regionId].push(provinceId);
            }
        });
    });

    return structure;
}

function loadMaps() {
    mapSelect.innerHTML = `<option value="default">Standard</option>`;
    Object.keys(customMaps).forEach(name => {
        const opt = document.createElement("option");
        opt.value = name;
        opt.textContent = name;
        mapSelect.appendChild(opt);
    });
}

loadMaps();

addMapBtn.addEventListener("click", () => {
    regionProvinceList.innerHTML = "";

    const regionGroups = document.querySelectorAll("svg g.regioni > g");

    regionGroups.forEach(region => {
        const regionId = region.id;
        if (!regionId) return;

        const regionContainer = document.createElement("div");
        regionContainer.style.marginBottom = "8px";

        const header = document.createElement("div");
        header.style.display = "flex";
        header.style.alignItems = "center";
        header.style.cursor = "default";

        const arrow = document.createElement("span");
        arrow.textContent = "▶";
        arrow.style.cursor = "pointer";
        arrow.style.marginRight = "6px";

        const regionCheckbox = document.createElement("input");
        regionCheckbox.type = "checkbox";
        regionCheckbox.value = regionId;
        regionCheckbox.style.marginRight = "6px";

        const regionText = document.createElement("span");
        regionText.textContent = regionId;
        regionText.style.fontWeight = "bold";

        header.appendChild(arrow);
        header.appendChild(regionCheckbox);
        header.appendChild(regionText);

        const provinceContainer = document.createElement("div");
        provinceContainer.style.display = "none";
        provinceContainer.style.marginLeft = "22px";
        provinceContainer.style.marginTop = "4px";

        const provinces = region.querySelectorAll("g.province > g[id]");
        const provinceCheckboxes = [];

        provinces.forEach(province => {
            const provinceId = province.id;
            if (!provinceId) return;

            const label = document.createElement("label");
            const checkbox = document.createElement("input");

            checkbox.type = "checkbox";
            checkbox.value = provinceId;
            checkbox.style.marginRight = "6px";

            provinceCheckboxes.push(checkbox);

            checkbox.addEventListener("change", () => {
                const allChecked = provinceCheckboxes.every(cb => cb.checked);
                const noneChecked = provinceCheckboxes.every(cb => !cb.checked);

                regionCheckbox.checked = allChecked;
                regionCheckbox.indeterminate = !allChecked && !noneChecked;
            });

            label.appendChild(checkbox);
            label.append(provinceId);

            provinceContainer.appendChild(label);
            provinceContainer.appendChild(document.createElement("br"));
        });

        regionCheckbox.addEventListener("change", () => {
            provinceCheckboxes.forEach(cb => cb.checked = regionCheckbox.checked);
            regionCheckbox.indeterminate = false;
        });

        arrow.addEventListener("click", () => {
            const isOpen = provinceContainer.style.display === "block";
            provinceContainer.style.display = isOpen ? "none" : "block";
            arrow.textContent = isOpen ? "▶" : "▼";
        });

        regionContainer.appendChild(header);
        regionContainer.appendChild(provinceContainer);
        regionProvinceList.appendChild(regionContainer);
    });

    mapModal.style.display = "block";
});

cancelMapBtn.addEventListener("click", () => {
    mapModal.style.display = "none";
});

saveMapBtn.addEventListener("click", () => {
    const selectedProvinces = Array.from(
        regionProvinceList.querySelectorAll("input:checked")
    ).map(cb => cb.value);

    if (selectedProvinces.length === 0) return;

    const name = prompt("Name der Map:");
    if (!name) return;

    customMaps[name] = selectedProvinces;
    mapExcludeLists[name] = [];

    localStorage.setItem("customMaps", JSON.stringify(customMaps));
    localStorage.setItem("mapExcludeLists", JSON.stringify(mapExcludeLists));

    loadMaps();
    mapModal.style.display = "none";
});

mapSelect.addEventListener("change", () => {
    activeMap = mapSelect.value;

    if (activeMap === "default") {
        deleteMapBtn.style.display = "none";
    } else {
        deleteMapBtn.style.display = "inline-block";
    }

    if (activeMap === "default") {
        provinceGroups.forEach(province => {
            province.style.display = "block";
        });

        svgPath.forEach(p => {
            p.style.display = "block";
        });
    } else {
        const allowedProvinces = customMaps[activeMap];

        provinceGroups.forEach(province => {
            if (allowedProvinces.includes(province.id)) {
                province.style.display = "block";
            } else {
                province.style.display = "none";
            }
        });

        svgPath.forEach(p => {
            const provinceId = p.closest("g[id^='p_']").id;

            if (allowedProvinces.includes(provinceId)) {
                p.style.display = "block";
            } else {
                p.style.display = "none";
            }
        });
    }

    if (mode === "quiz") startQuiz();
});

deleteMapBtn.addEventListener("click", () => {
    if (activeMap === "default") return;

    const confirmDelete = confirm(
        `Map "${activeMap}" wirklich löschen?`
    );

    if (!confirmDelete) return;

    delete customMaps[activeMap];
    delete mapExcludeLists[activeMap];

    localStorage.setItem("customMaps", JSON.stringify(customMaps));
    localStorage.setItem("mapExcludeLists", JSON.stringify(mapExcludeLists));

    activeMap = "default";
    mapSelect.value = "default";

    deleteMapBtn.style.display = "none";

    loadMaps();

    provinceGroups.forEach(p => p.style.display = "block");
    svgPath.forEach(p => p.style.display = "block");

    if (mode === "quiz") startQuiz();
});

toggleMapBtn.addEventListener("click", () => {
    if (!confirmMapChangeIfNeeded()) return;

    const currentExclude = getCurrentExcludeList();

    if (currentExclude.length === 0) {
        const pathsToExclude = getActivePaths().map(p => p.id);
        saveCurrentExcludeList(pathsToExclude);
    } else {
        saveCurrentExcludeList([]);
    }

    updatePathColors();
    if (mode === "quiz") startQuiz();
    mapMenu.classList.remove("open");
    mapMenuBtn.setAttribute("aria-expanded", "false");
});

mapMenuBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = mapMenu.classList.toggle("open");
    mapMenuBtn.setAttribute("aria-expanded", String(isOpen));
});

mapMenu.addEventListener("click", (event) => {
    event.stopPropagation();
});

document.addEventListener("click", () => {
    mapMenu.classList.remove("open");
    mapMenuBtn.setAttribute("aria-expanded", "false");
});

markModeToggle.addEventListener("change", () => {
    markMode = markModeToggle.checked;
    document.body.classList.toggle("markModeActive", markMode);
});
