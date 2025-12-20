import { els } from './ui.js';
import { 
    MEM_LOCATIONS, MEM_CENTERS, MEM_FARES, MEM_DISTANCES, MEM_COSTS, 
    saveData, updateLocationData, MEM_RECORDS 
} from './data.js';

/** 상하차지 자동완성 목록 갱신 */
export function populateCenterDatalist() {
    els.centerDatalist.innerHTML = MEM_CENTERS.map(c => `<option value="${c}"></option>`).join('');
}

/** 상하차지 입력에 따른 주소/메모 표시 */
export function updateAddressDisplay() {
    const fromLoc = MEM_LOCATIONS[els.fromCenterInput.value.trim()] || {};
    const toLoc = MEM_LOCATIONS[els.toCenterInput.value.trim()] || {};
    let html = '';
    if (fromLoc.address) html += `<div class="address-clickable" data-address="${fromLoc.address}">[상] ${fromLoc.address}</div>`;
    if (fromLoc.memo) html += `<div class="memo-display">[상] ${fromLoc.memo}</div>`;
    if (toLoc.address) html += `<div class="address-clickable" data-address="${toLoc.address}">[하] ${toLoc.address}</div>`;
    if (toLoc.memo) html += `<div class="memo-display">[하] ${toLoc.memo}</div>`;
    els.addressDisplay.innerHTML = html;
}

/** 상하차지 조합에 따른 거리/금액 자동 입력 */
export function handleTransportInput() {
    const from = els.fromCenterInput.value.trim();
    const to = els.toCenterInput.value.trim();
    if ((els.typeSelect.value === '화물운송' || els.typeSelect.value === '대기') && from && to) {
        const key = `${from}-${to}`;
        if (MEM_FARES[key]) els.incomeInput.value = (MEM_FARES[key] / 10000).toFixed(2);
        if (MEM_DISTANCES[key]) els.manualDistanceInput.value = MEM_DISTANCES[key];
        if (MEM_COSTS[key]) els.costInput.value = (MEM_COSTS[key] / 10000).toFixed(2);
    }
    updateAddressDisplay();
}

/** 신규 지역 추가 */
export function addCenter(newCenter, address = '', memo = '') {
    const trimmed = newCenter?.trim();
    if (!trimmed) return;
    updateLocationData(trimmed, address, memo);
    populateCenterDatalist();
}

/** 설정 페이지의 지역 관리 목록 렌더링 */
export function displayCenterList(filter = '') {
    els.centerListContainer.innerHTML = "";
    const list = MEM_CENTERS.filter(c => c.includes(filter));
    if (list.length === 0) { els.centerListContainer.innerHTML = '<p class="note">결과 없음</p>'; return; }

    list.forEach(c => {
        const l = MEM_LOCATIONS[c] || {};
        const div = document.createElement('div');
        div.className = 'center-item';
        div.innerHTML = `
            <div class="info"><span class="center-name">${c}</span>
            <div class="action-buttons"><button class="edit-btn">수정</button><button class="delete-btn">삭제</button></div></div>
            ${l.address ? `<span class="note">주소: ${l.address}</span>` : ''}`;
        
        div.querySelector('.edit-btn').onclick = () => handleCenterEdit(div, c);
        div.querySelector('.delete-btn').onclick = () => {
            if (!confirm('삭제하시겠습니까?')) return;
            const idx = MEM_CENTERS.indexOf(c);
            if (idx > -1) MEM_CENTERS.splice(idx, 1);
            delete MEM_LOCATIONS[c];
            saveData();
            displayCenterList(document.getElementById('center-search-input').value);
        };
        els.centerListContainer.appendChild(div);
    });
}

function handleCenterEdit(div, c) {
    const l = MEM_LOCATIONS[c] || {};
    div.innerHTML = `<div class="edit-form"><input class="edit-input" value="${c}"><input class="edit-address-input" value="${l.address || ''}"><input class="edit-memo-input" value="${l.memo || ''}"><div class="action-buttons"><button class="setting-save-btn">저장</button><button class="cancel-edit-btn">취소</button></div></div>`;
    div.querySelector('.setting-save-btn').onclick = () => {
        const nn = div.querySelector('.edit-input').value.trim();
        if (!nn) return;
        if (nn !== c) {
            const idx = MEM_CENTERS.indexOf(c);
            if (idx > -1) MEM_CENTERS.splice(idx, 1);
            if (!MEM_CENTERS.includes(nn)) MEM_CENTERS.push(nn);
            delete MEM_LOCATIONS[c];
            MEM_RECORDS.forEach(r => { if (r.from === c) r.from = nn; if (r.to === c) r.to = nn; });
            saveData();
        }
        updateLocationData(nn, div.querySelector('.edit-address-input').value.trim(), div.querySelector('.edit-memo-input').value.trim());
        displayCenterList(document.getElementById('center-search-input').value);
    };
    div.querySelector('.cancel-edit-btn').onclick = () => displayCenterList(document.getElementById('center-search-input').value);
}