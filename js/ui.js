import { getTodayString, getCurrentTimeString } from './utils.js';
import { MEM_LOCATIONS, MEM_CENTERS, updateLocationData, saveData, MEM_RECORDS, MEM_EXPENSE_ITEMS } from './data.js';

// 권역 매핑 정의
const REGIONS = {
    "인천": ["인천"],
    "남양주/구리": ["남양주", "구리", "MNYJ"],
    "시흥/안산/부천": ["시흥", "안산", "부천", "군포", "안양"],
    "용인/이천/광주": ["용인", "이천", "경광주", "곤지암", "마장"],
    "안성/여주": ["안성", "여주", "M안성"],
    "천안/아산/세종": ["천안", "아산", "세종", "성환", "성거", "XRC", "XHM"],
    "고양/김포": ["고양", "MGMP"]
};

export const els = {
    recordForm: document.getElementById('record-form'),
    dateInput: document.getElementById('date'),
    timeInput: document.getElementById('time'),
    typeSelect: document.getElementById('type'),
    fromCenterInput: document.getElementById('from-center'),
    toCenterInput: document.getElementById('to-center'),
    centerDatalist: document.getElementById('center-list'),
    manualDistanceInput: document.getElementById('manual-distance'),
    addressDisplay: document.getElementById('address-display'),
    transportDetails: document.getElementById('transport-details'),
    fuelDetails: document.getElementById('fuel-details'),
    expenseDetails: document.getElementById('expense-details'),
    supplyDetails: document.getElementById('supply-details'),
    costInfoFieldset: document.getElementById('cost-info-fieldset'),
    costWrapper: document.getElementById('cost-wrapper'),
    incomeWrapper: document.getElementById('income-wrapper'),
    fuelUnitPriceInput: document.getElementById('fuel-unit-price'),
    fuelLitersInput: document.getElementById('fuel-liters'),
    fuelBrandSelect: document.getElementById('fuel-brand'),
    expenseItemInput: document.getElementById('expense-item'),
    expenseDatalist: document.getElementById('expense-list'),
    supplyItemInput: document.getElementById('supply-item'),
    supplyMileageInput: document.getElementById('supply-mileage'),
    costInput: document.getElementById('cost'),
    incomeInput: document.getElementById('income'),
    tripActions: document.getElementById('trip-actions'),
    generalActions: document.getElementById('general-actions'),
    editActions: document.getElementById('edit-actions'),
    editModeIndicator: document.getElementById('edit-mode-indicator'),
    editIdInput: document.getElementById('edit-id'),
    centerListContainer: document.getElementById('center-list-container'),
    btnTripCancel: document.getElementById('btn-trip-cancel'),
    btnStartTrip: document.getElementById('btn-start-trip'),
    btnEndTrip: document.getElementById('btn-end-trip'),
    btnSaveGeneral: document.getElementById('btn-save-general'),
    btnEditEndTrip: document.getElementById('btn-edit-end-trip'),
    btnUpdateRecord: document.getElementById('btn-update-record'),
    btnDeleteRecord: document.getElementById('btn-delete-record'),
    btnCancelEdit: document.getElementById('btn-cancel-edit'),
};

/** 성격 분석 (상차/하차/공용) */
function getCenterRoles() {
    const roles = {};
    MEM_CENTERS.forEach(c => roles[c] = { load: 0, unload: 0 });
    MEM_RECORDS.forEach(r => {
        if (r.from && roles[r.from]) roles[r.from].load++;
        if (r.to && roles[r.to]) roles[r.to].unload++;
    });
    const result = {};
    Object.keys(roles).forEach(c => {
        const { load, unload } = roles[c];
        if (load > unload * 2 && load > 2) result[c] = 'role-load';
        else if (unload > load * 2 && unload > 2) result[c] = 'role-unload';
        else result[c] = 'role-both';
    });
    return result;
}

/** 권역 판별 */
function getRegionOfCenter(name) {
    for (const [r, keywords] of Object.entries(REGIONS)) {
        if (keywords.some(k => name.includes(k))) return r;
    }
    return "기타";
}

/** [추가] 퀵 버튼 렌더링 */
export function renderQuickShortcuts() {
    const tabContainer = document.getElementById('quick-region-tabs');
    const chipContainer = document.getElementById('quick-center-chips');
    const roles = getCenterRoles();
    const groups = { "기타": [] };
    Object.keys(REGIONS).forEach(r => groups[r] = []);
    MEM_CENTERS.forEach(c => groups[getRegionOfCenter(c)].push(c));

    tabContainer.innerHTML = '';
    Object.keys(groups).forEach(region => {
        if (groups[region].length === 0) return;
        const btn = document.createElement('button');
        btn.type = 'button'; btn.className = 'region-btn'; btn.textContent = region;
        btn.onclick = () => {
            tabContainer.querySelectorAll('.region-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            chipContainer.innerHTML = '';
            groups[region].forEach(c => {
                const chip = document.createElement('div');
                chip.className = `chip ${roles[c] || 'role-both'}`;
                chip.textContent = c;
                chip.onclick = () => {
                    const from = els.fromCenterInput; const to = els.toCenterInput;
                    if (document.activeElement === from || !from.value) { from.value = c; from.dispatchEvent(new Event('input')); }
                    else { to.value = c; to.dispatchEvent(new Event('input')); }
                };
                chipContainer.appendChild(chip);
            });
        };
        tabContainer.appendChild(btn);
    });
}

/** [수정] 설정창 지역 관리 리스트 (권역별 그룹화) */
export function displayCenterList(filter='') {
    const container = els.centerListContainer;
    container.innerHTML = "";
    const filtered = MEM_CENTERS.filter(c => c.includes(filter));
    const groups = {};
    filtered.forEach(c => {
        const r = getRegionOfCenter(c);
        if(!groups[r]) groups[r] = [];
        groups[r].push(c);
    });
    if(filtered.length === 0) { container.innerHTML = '<p class="note">결과 없음</p>'; return; }

    Object.keys(groups).sort().forEach(region => {
        const title = document.createElement('div');
        title.className = 'settings-region-title';
        title.textContent = `${region} (${groups[region].length})`;
        container.appendChild(title);

        groups[region].forEach(c => {
            const l = MEM_LOCATIONS[c] || {};
            const div = document.createElement('div');
            div.className = 'center-item';
            div.innerHTML = `
                <div class="info"><span class="center-name">${c}</span>
                <div class="action-buttons"><button class="edit-btn">수정</button><button class="delete-btn">삭제</button></div></div>
                ${l.address ? `<span class="note" style="font-size:0.8em;">📍 ${l.address}</span>` : ''}`;
            div.querySelector('.edit-btn').onclick = () => handleCenterEdit(div, c);
            div.querySelector('.delete-btn').onclick = () => {
                if(!confirm(`${c} 삭제?`)) return;
                MEM_CENTERS.splice(MEM_CENTERS.indexOf(c), 1); delete MEM_LOCATIONS[c]; saveData();
                displayCenterList(document.getElementById('center-search-input').value);
            };
            container.appendChild(div);
        });
    });
}

// 기존 함수들 (toggleUI, resetForm 등) 동일하게 유지
export function toggleUI() {
    const type = els.typeSelect.value;
    const isEditMode = !els.editModeIndicator.classList.contains('hidden');
    [els.transportDetails, els.fuelDetails, els.supplyDetails, els.expenseDetails, els.costInfoFieldset, els.tripActions, els.generalActions, els.editActions].forEach(el => el.classList.add('hidden'));
    if (type === '화물운송' || type === '대기') {
        els.transportDetails.classList.remove('hidden'); els.costInfoFieldset.classList.remove('hidden'); els.costWrapper.classList.add('hidden'); els.incomeWrapper.classList.remove('hidden');
        if (!isEditMode) els.tripActions.classList.remove('hidden');
    } else if (type === '수입') {
        els.expenseDetails.classList.remove('hidden'); document.getElementById('expense-legend').textContent = "수입 내역"; els.costInfoFieldset.classList.remove('hidden'); els.incomeWrapper.classList.remove('hidden'); els.costWrapper.classList.add('hidden');
        if (!isEditMode) els.generalActions.classList.remove('hidden');
    } else {
        els.costInfoFieldset.classList.remove('hidden'); els.incomeWrapper.classList.add('hidden'); els.costWrapper.classList.remove('hidden');
        if (type === '주유소') { els.fuelDetails.classList.remove('hidden'); if (!isEditMode) els.generalActions.classList.remove('hidden'); }
        else if (type === '소모품') { els.supplyDetails.classList.remove('hidden'); if (!isEditMode) els.generalActions.classList.remove('hidden'); }
        else if (type === '지출') { els.expenseDetails.classList.remove('hidden'); document.getElementById('expense-legend').textContent = "지출 내역"; if (!isEditMode) els.generalActions.classList.remove('hidden'); }
    }
    if (isEditMode) { els.editActions.classList.remove('hidden'); els.btnEditEndTrip.classList.toggle('hidden', ['주유소','소모품','지출','수입'].includes(type)); }
}

export function updateAddressDisplay() {
    const fromLoc = MEM_LOCATIONS[els.fromCenterInput.value] || {}; const toLoc = MEM_LOCATIONS[els.toCenterInput.value] || {};
    let h = '';
    if (fromLoc.address) h += `<div class="address-clickable" data-address="${fromLoc.address}">[상] ${fromLoc.address}</div>`;
    if (toLoc.address) h += `<div class="address-clickable" data-address="${toLoc.address}">[하] ${toLoc.address}</div>`;
    els.addressDisplay.innerHTML = h;
}

export function populateCenterDatalist() { els.centerDatalist.innerHTML = MEM_CENTERS.map(c => `<option value="${c}"></option>`).join(''); }
export function populateExpenseDatalist() { els.expenseDatalist.innerHTML = MEM_EXPENSE_ITEMS.map(item => `<option value="${item}"></option>`).join(''); }

export function resetForm() {
    els.recordForm.reset(); els.editIdInput.value = ''; els.editModeIndicator.classList.add('hidden');
    els.dateInput.value = getTodayString(); els.timeInput.value = getCurrentTimeString();
    els.dateInput.disabled = false; els.timeInput.disabled = false; els.addressDisplay.innerHTML = '';
    toggleUI();
}

function handleCenterEdit(div, c) {
    const l = MEM_LOCATIONS[c]||{};
    div.innerHTML = `<div class="edit-form"><input class="edit-input" value="${c}"><input class="edit-address-input" value="${l.address||''}" placeholder="주소"><div class="action-buttons"><button class="setting-save-btn">저장</button><button class="cancel-edit-btn">취소</button></div></div>`;
    div.querySelector('.setting-save-btn').onclick = () => {
        const nn = div.querySelector('.edit-input').value.trim(); const na = div.querySelector('.edit-address-input').value.trim();
        if(!nn) return;
        if(nn!==c) { MEM_CENTERS.splice(MEM_CENTERS.indexOf(c),1); if(!MEM_CENTERS.includes(nn)) MEM_CENTERS.push(nn); delete MEM_LOCATIONS[c]; MEM_RECORDS.forEach(r => { if(r.from===c) r.from=nn; if(r.to===c) r.to=nn; }); saveData(); }
        updateLocationData(nn, na); displayCenterList(document.getElementById('center-search-input').value);
    };
    div.querySelector('.cancel-edit-btn').onclick = () => displayCenterList(document.getElementById('center-search-input').value);
}
// (기타 보조 함수들 생략 - 원본과 동일)
export function getFormDataWithoutTime() {
    const f = els.fromCenterInput.value.trim(); const t = els.toCenterInput.value.trim();
    if(f) updateLocationData(f); if(t) updateLocationData(t);
    return { type: els.typeSelect.value, from: f, to: t, distance: parseFloat(els.manualDistanceInput.value) || 0, cost: Math.round((parseFloat(els.costInput.value) || 0) * 10000), income: Math.round((parseFloat(els.incomeInput.value) || 0) * 10000), liters: parseFloat(els.fuelLitersInput.value) || 0, unitPrice: parseInt(els.fuelUnitPriceInput.value) || 0, brand: els.fuelBrandSelect.value || '', supplyItem: els.supplyItemInput.value || '', mileage: parseInt(els.supplyMileageInput.value) || 0, expenseItem: els.expenseItemInput.value || '' };
}