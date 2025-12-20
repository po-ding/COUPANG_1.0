import { getTodayString, getCurrentTimeString } from './utils.js';
import { MEM_LOCATIONS, MEM_CENTERS, updateLocationData, saveData, MEM_RECORDS, MEM_EXPENSE_ITEMS } from './data.js';

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
    fromCenterInput: document.getElementById('from-center'),
    toCenterInput: document.getElementById('to-center'),
    typeSelect: document.getElementById('type'),
    dateInput: document.getElementById('date'),
    timeInput: document.getElementById('time'),
    incomeInput: document.getElementById('income'),
    costInput: document.getElementById('cost'),
    manualDistanceInput: document.getElementById('manual-distance'),
    editModeIndicator: document.getElementById('edit-mode-indicator'),
    centerListContainer: document.getElementById('center-list-container'),
    transportDetails: document.getElementById('transport-details'),
    fuelDetails: document.getElementById('fuel-details'),
    expenseDetails: document.getElementById('expense-details'),
    supplyDetails: document.getElementById('supply-details'),
    costInfoFieldset: document.getElementById('cost-info-fieldset'),
    tripActions: document.getElementById('trip-actions'),
    generalActions: document.getElementById('general-actions'),
    editActions: document.getElementById('edit-actions'),
};

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

export function renderQuickShortcuts() {
    const tabContainer = document.getElementById('quick-region-tabs');
    const chipContainer = document.getElementById('quick-center-chips');
    if(!tabContainer || !chipContainer) return;

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
                    if (!els.fromCenterInput.value) els.fromCenterInput.value = c;
                    else els.toCenterInput.value = c;
                    els.fromCenterInput.dispatchEvent(new Event('input'));
                };
                chipContainer.appendChild(chip);
            });
        };
        tabContainer.appendChild(btn);
    });
}

export function displayCenterList(filter='') {
    const container = els.centerListContainer;
    if(!container) return;
    container.innerHTML = "";
    const filtered = MEM_CENTERS.filter(c => c.includes(filter));
    const groups = {};
    filtered.forEach(c => {
        const r = getRegionOfCenter(c);
        if(!groups[r]) groups[r] = [];
        groups[r].push(c);
    });

    Object.keys(groups).sort().forEach(region => {
        const title = document.createElement('div');
        title.className = 'settings-region-title';
        title.textContent = region;
        container.appendChild(title);
        groups[region].forEach(c => {
            const div = document.createElement('div');
            div.className = 'center-item';
            div.innerHTML = `<span>${c}</span><button onclick="deleteCenter('${c}')">삭제</button>`;
            container.appendChild(div);
        });
    });
}
window.deleteCenter = (name) => {
    if(confirm('삭제하시겠습니까?')) {
        const idx = MEM_CENTERS.indexOf(name);
        if(idx > -1) MEM_CENTERS.splice(idx, 1);
        saveData();
        displayCenterList();
    }
};

export function toggleUI() {
    const type = els.typeSelect.value;
    const isEditMode = !els.editModeIndicator.classList.contains('hidden');
    
    [els.transportDetails, els.fuelDetails, els.expenseDetails, els.costInfoFieldset, els.tripActions, els.generalActions, els.editActions].forEach(el => el?.classList.add('hidden'));

    if (type === '화물운송') {
        els.transportDetails.classList.remove('hidden');
        els.costInfoFieldset.classList.remove('hidden');
        if (!isEditMode) els.tripActions.classList.remove('hidden');
    } else {
        els.costInfoFieldset.classList.remove('hidden');
        if (type === '주유소') els.fuelDetails.classList.remove('hidden');
        if (!isEditMode) els.generalActions.classList.remove('hidden');
    }
}

export function resetForm() {
    document.getElementById('record-form').reset();
    els.dateInput.value = getTodayString();
    els.timeInput.value = getCurrentTimeString();
    toggleUI();
}