import { els } from './ui.js';
import { MEM_LOCATIONS, MEM_CENTERS, MEM_FARES, MEM_DISTANCES, MEM_RECORDS, updateLocationData, saveData } from './data.js';

function getRegionName(name) {
    const regions = ["인천", "용인", "안성", "이천", "안산", "시흥", "천안", "남양주", "고양"];
    for (const r of regions) { if (name.includes(r)) return r; }
    return "기타";
}

export function renderLocationButtons() {
    const container = document.getElementById('location-btn-container');
    if (!container) return;
    container.innerHTML = "";

    // 빈도 계산
    const freq = {};
    MEM_RECORDS.forEach(r => {
        if (r.from) freq[r.from] = (freq[r.from] || 0) + 1;
        if (r.to) freq[r.to] = (freq[r.to] || 0) + 1;
    });

    const sorted = [...MEM_CENTERS].sort((a, b) => (freq[b] || 0) - (freq[a] || 0));

    const groups = { "자주 방문 (TOP 5)": sorted.slice(0, 5) };
    sorted.slice(5).forEach(c => {
        const r = getRegionName(c);
        if (!groups[r]) groups[r] = [];
        groups[r].push(c);
    });

    Object.keys(groups).forEach(region => {
        if (groups[region].length === 0) return;
        const sec = document.createElement('div');
        sec.className = 'region-section';
        sec.innerHTML = `<div class="region-title">${region}</div>`;
        const grid = document.createElement('div');
        grid.className = 'location-btn-grid';

        groups[region].forEach(c => {
            const btn = document.createElement('button');
            btn.type = 'button'; btn.className = 'loc-quick-btn';
            const info = MEM_LOCATIONS[c] || {};
            let hint = info.memo?.includes("(상") ? "🆙" : info.memo?.includes("(하") ? "⬇️" : "";
            btn.innerHTML = `${c}<small>${hint}</small>`;
            
            btn.onclick = () => {
                if (document.activeElement === els.toCenterInput || (els.fromCenterInput.value && document.activeElement !== els.fromCenterInput)) {
                    els.toCenterInput.value = c;
                } else {
                    els.fromCenterInput.value = c;
                }
                handleTransportInput();
            };
            grid.appendChild(btn);
        });
        sec.appendChild(grid);
        container.appendChild(sec);
    });
}

export function handleTransportInput() {
    const f = els.fromCenterInput.value.trim();
    const t = els.toCenterInput.value.trim();
    if (f && t) {
        const key = `${f}-${t}`;
        if (MEM_FARES[key]) els.incomeInput.value = (MEM_FARES[key] / 10000).toFixed(2);
        if (MEM_DISTANCES[key]) els.manualDistanceInput.value = MEM_DISTANCES[key];
    }
    const fL = MEM_LOCATIONS[f] || {}, tL = MEM_LOCATIONS[t] || {};
    els.addressDisplay.innerHTML = (fL.address ? `[상] ${fL.address}<br>` : '') + (tL.address ? `[하] ${tL.address}` : '');
}

export function populateCenterDatalist() {
    els.centerDatalist.innerHTML = MEM_CENTERS.map(c => `<option value="${c}"></option>`).join('');
    renderLocationButtons();
}

export function displayCenterList() {
    const cont = document.getElementById('center-list-container');
    cont.innerHTML = MEM_CENTERS.map(c => `
        <div class="center-item" style="display:flex; justify-content:space-between; padding:5px; border-bottom:1px solid #eee;">
            <span>${c}</span>
            <button onclick="window.deleteCenter('${c}')" style="background:red; color:white; padding:2px 5px; font-size:0.8em;">삭제</button>
        </div>
    `).join('');
}