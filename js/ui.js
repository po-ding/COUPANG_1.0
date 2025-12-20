import { getTodayString, getCurrentTimeString } from './utils.js';
import { MEM_LOCATIONS, MEM_CENTERS, updateLocationData, saveData, MEM_RECORDS, MEM_EXPENSE_ITEMS } from './data.js';

// [추가] 권역 정의
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
    btnTripCancel: document.getElementById('btn-trip-cancel'),
    btnStartTrip: document.getElementById('btn-start-trip'),
    btnEndTrip: document.getElementById('btn-end-trip'),
    btnSaveGeneral: document.getElementById('btn-save-general'),
    btnEditEndTrip: document.getElementById('btn-edit-end-trip'),
    btnUpdateRecord: document.getElementById('btn-update-record'),
    btnDeleteRecord: document.getElementById('btn-delete-record'),
    btnCancelEdit: document.getElementById('btn-cancel-edit'),
    editModeIndicator: document.getElementById('edit-mode-indicator'),
    editIdInput: document.getElementById('edit-id'),
    centerListContainer: document.getElementById('center-list-container'),
};

// [추가] 성격 및 권역 분류 함수
function getRegionOfCenter(name) {
    for (const [r, keywords] of Object.entries(REGIONS)) {
        if (keywords.some(k => name.includes(k))) return r;
    }
    return "기타";
}

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
        if (load > unload * 2 && load > 1) result[c] = 'role-load';
        else if (unload > load * 2 && unload > 1) result[c] = 'role-unload';
        else result[c] = 'role-both';
    });
    return result;
}

// [추가] 렌더링 로직
export function renderQuickShortcuts() {
    const tabContainer = document.getElementById('quick-region-tabs');
    const chipContainer = document.getElementById('quick-center-chips');
    if(!tabContainer || !chipContainer) return;
    const roles = getCenterRoles();
    const groups = {};
    Object.keys(REGIONS).forEach(r => groups[r] = []);
    groups["기타"] = [];
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
                    if (!els.fromCenterInput.value) { els.fromCenterInput.value = c; }
                    else { els.toCenterInput.value = c; }
                    els.fromCenterInput.dispatchEvent(new Event('input'));
                };
                chipContainer.appendChild(chip);
            });
        };
        tabContainer.appendChild(btn);
    });
}

// [수정] 설정 내 지역 관리 (아코디언 방식)
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

    Object.keys(groups).sort().forEach(region => {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'settings-region-group';
        const header = document.createElement('div');
        header.className = 'settings-region-header';
        header.innerHTML = `<span>${region} (${groups[region].length})</span>`;
        const content = document.createElement('div');
        content.className = 'settings-region-content';
        header.onclick = () => { header.classList.toggle('active'); content.classList.toggle('active'); };
        groups[region].forEach(c => {
            const l = MEM_LOCATIONS[c] || {};
            const item = document.createElement('div');
            item.className = 'center-item';
            item.innerHTML = `
                <div class="info"><span class="center-name">${c}</span>
                <div class="action-buttons"><button class="edit-btn">수정</button><button class="delete-btn">삭제</button></div></div>
                ${l.address ? `<span class="note">📍 ${l.address}</span>` : ''}`;
            item.querySelector('.edit-btn').onclick = () => handleCenterEdit(item, c);
            item.querySelector('.delete-btn').onclick = () => { if(confirm('삭제?')) { MEM_CENTERS.splice(MEM_CENTERS.indexOf(c), 1); delete MEM_LOCATIONS[c]; saveData(); displayCenterList(filter); } };
            content.appendChild(item);
        });
        groupDiv.appendChild(header); groupDiv.appendChild(content); container.appendChild(groupDiv);
    });
}

// 원본의 방대한 로직들 (절대 생략 안 함)
export function toggleUI() {
    const type = els.typeSelect.value;
    const isEditMode = !els.editModeIndicator.classList.contains('hidden');
    [els.transportDetails, els.fuelDetails, els.supplyDetails, els.expenseDetails, els.costInfoFieldset, els.tripActions, els.generalActions, els.editActions].forEach(el => el.classList.add('hidden'));
    if (type === '화물운송' || type === '대기') {
        els.transportDetails.classList.remove('hidden'); els.costInfoFieldset.classList.remove('hidden'); els.costWrapper.classList.add('hidden'); els.incomeWrapper.classList.remove('hidden');
        if (!isEditMode) { els.tripActions.classList.remove('hidden'); if(type === '화물운송') els.btnTripCancel.classList.remove('hidden'); }
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
    const fromVal = els.fromCenterInput.value; const toVal = els.toCenterInput.value;
    const fromLoc = MEM_LOCATIONS[fromVal] || {}; const toLoc = MEM_LOCATIONS[toVal] || {};
    let html = '';
    if (fromLoc.address) html += `<div class="address-clickable" data-address="${fromLoc.address}">[상] ${fromLoc.address}</div>`;
    if (toLoc.address) html += `<div class="address-clickable" data-address="${toLoc.address}">[하] ${toLoc.address}</div>`;
    els.addressDisplay.innerHTML = html;
}

export function resetForm() {
    els.recordForm.reset(); els.editIdInput.value = ''; els.editModeIndicator.classList.add('hidden');
    els.dateInput.value = getTodayString(); els.timeInput.value = getCurrentTimeString();
    els.dateInput.disabled = false; els.timeInput.disabled = false; els.addressDisplay.innerHTML = '';
    toggleUI();
}

export function editRecord(id) {
    const r = MEM_RECORDS.find(x => x.id === id); if(!r) return;
    els.dateInput.value = r.date; els.timeInput.value = r.time; els.typeSelect.value = r.type;
    els.fromCenterInput.value = r.from || ''; els.toCenterInput.value = r.to || '';
    els.manualDistanceInput.value = r.distance || ''; 
    els.incomeInput.value = r.income ? (r.income/10000) : ''; els.costInput.value = r.cost ? (r.cost/10000) : '';
    els.fuelBrandSelect.value = r.brand || ''; els.fuelLitersInput.value = r.liters || ''; 
    els.fuelUnitPriceInput.value = r.unitPrice || ''; els.expenseItemInput.value = r.expenseItem || ''; 
    els.supplyItemInput.value = r.supplyItem || ''; els.supplyMileageInput.value = r.mileage || '';
    els.editIdInput.value = id; els.editModeIndicator.classList.remove('hidden');
    els.dateInput.disabled = true; els.timeInput.disabled = true; toggleUI(); window.scrollTo(0,0);
}

function handleCenterEdit(div, c) {
    const l = MEM_LOCATIONS[c]||{};
    div.innerHTML = `<div class="edit-form"><input class="edit-input" value="${c}"><input class="edit-address-input" value="${l.address||''}" placeholder="주소"><div class="action-buttons"><button class="setting-save-btn">저장</button><button class="cancel-edit-btn">취소</button></div></div>`;
    div.querySelector('.setting-save-btn').onclick = () => {
        const nn = div.querySelector('.edit-input').value.trim(); const na = div.querySelector('.edit-address-input').value.trim();
        if(!nn) return;
        if(nn!==c) { 
            const idx = MEM_CENTERS.indexOf(c); if(idx>-1) MEM_CENTERS.splice(idx,1);
            if(!MEM_CENTERS.includes(nn)) MEM_CENTERS.push(nn); delete MEM_LOCATIONS[c];
            MEM_RECORDS.forEach(r => { if(r.from===c) r.from=nn; if(r.to===c) r.to=nn; }); saveData();
        }
        updateLocationData(nn, na); displayCenterList();
    };
    div.querySelector('.cancel-edit-btn').onclick = () => displayCenterList();
}

export function populateCenterDatalist() { els.centerDatalist.innerHTML = MEM_CENTERS.map(c => `<option value="${c}"></option>`).join(''); }
export function populateExpenseDatalist() { els.expenseDatalist.innerHTML = MEM_EXPENSE_ITEMS.map(item => `<option value="${item}"></option>`).join(''); }

export function getFormDataWithoutTime() {
    const f = els.fromCenterInput.value.trim(); const t = els.toCenterInput.value.trim();
    if(f) updateLocationData(f); if(t) updateLocationData(t);
    return { type: els.typeSelect.value, from: f, to: t, distance: parseFloat(els.manualDistanceInput.value) || 0, cost: Math.round((parseFloat(els.costInput.value) || 0) * 10000), income: Math.round((parseFloat(els.incomeInput.value) || 0) * 10000), liters: parseFloat(els.fuelLitersInput.value) || 0, unitPrice: parseInt(els.fuelUnitPriceInput.value) || 0, brand: els.fuelBrandSelect.value || '', supplyItem: els.supplyItemInput.value || '', mileage: parseInt(els.supplyMileageInput.value) || 0, expenseItem: els.expenseItemInput.value || '' };
}

// [OCR 영수증 처리 원본 로직]
export async function processReceiptImage(file) {
    const statusDiv = document.getElementById('ocr-status');
    const resultContainer = document.getElementById('ocr-result-container');
    if (!file) return;
    statusDiv.innerHTML = "⏳ 분석 중...";
    try {
        const { data: { text } } = await Tesseract.recognize(file, 'kor+eng');
        statusDiv.innerHTML = "✅ 완료";
        resultContainer.classList.remove('hidden');
        parseReceiptText(text);
    } catch (e) { statusDiv.innerHTML = "❌ 실패"; }
}

function parseReceiptText(text) {
    const costMatch = text.match(/(주유금액|승인금액)\s*[:]\s*([\d,]+)/);
    if(costMatch) document.getElementById('ocr-cost').value = costMatch[2].replace(/,/g, '');
    const dateMatch = text.match(/(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
    if(dateMatch) document.getElementById('ocr-date').value = `${dateMatch[1]}-${dateMatch[2].padStart(2,'0')}-${dateMatch[3].padStart(2,'0')}`;
}