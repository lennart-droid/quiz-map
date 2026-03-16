mouseBtn.addEventListener("click", () => {
    provinceTooltipList.innerHTML = "";

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

        const regionText = document.createElement("span");
        regionText.textContent = regionId;
        regionText.style.fontWeight = "bold";

        header.appendChild(arrow);
        header.appendChild(regionText);

        const provinceContainer = document.createElement("div");
        provinceContainer.style.display = "none";
        provinceContainer.style.marginLeft = "22px";
        provinceContainer.style.marginTop = "4px";

        const provinces = region.querySelectorAll("g.province > g[id]");
        provinces.forEach(province => {
            const provinceId = province.id;
            if (!provinceId) return;

            const label = document.createElement("label");
            label.style.display = "block";
            label.style.marginBottom = "4px";

            const input = document.createElement("input");
            input.type = "number";
            input.min = 8;
            input.max = 50;
            input.value = tooltipSettings.provinces[provinceId] || 12;
            input.dataset.provinceId = provinceId;
            input.style.width = "50px";
            input.style.marginRight = "6px";

            label.appendChild(input);
            label.appendChild(document.createTextNode(provinceId));
            provinceContainer.appendChild(label);
        });

        arrow.addEventListener("click", () => {
            const isOpen = provinceContainer.style.display === "block";
            provinceContainer.style.display = isOpen ? "none" : "block";
            arrow.textContent = isOpen ? "▶" : "▼";
        });

        regionContainer.appendChild(header);
        regionContainer.appendChild(provinceContainer);
        provinceTooltipList.appendChild(regionContainer);
    });

    tooltipModal.style.display = "block";
});

cancelTooltipBtn.addEventListener("click", () => {
    tooltipModal.style.display = "none";
});

saveTooltipBtn.addEventListener("click", () => {
    provinceTooltipList.querySelectorAll("input").forEach(input => {
        const val = parseInt(input.value);
        const provinceId = input.dataset.provinceId;
        if (val !== tooltipSettings.generalSize) {
            tooltipSettings.provinces[provinceId] = val;
        } else {
            delete tooltipSettings.provinces[provinceId];
        }
    });

    localStorage.setItem("tooltipSettings", JSON.stringify(tooltipSettings));
    tooltipModal.style.display = "none";
});
