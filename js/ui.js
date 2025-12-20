import { getTodayString, getCurrentTimeString } from './utils.js';
import { MEM_LOCATIONS, MEM_CENTERS, updateLocationData, saveData, MEM_RECORDS, MEM_EXPENSE_ITEMS } from './data.js';

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
    quickLocButtons: document.getElementById('quick-location-buttons'), 
};

// 권역별/빈도수 퀵 버튼 정의
const QUICK_LOC_GROUPS = [
    { 
        label: "⭐ 자주 가는 곳", 
        isFrequent: true,
        items: ["남양주4", "MNYJ2", "고양1.CFC", "인천31.32.41.42", "안산1(SH)", "시흥2"] 
    },
    { 
        label: "인천 / 김포 / 부천", 
        items: ["인천16", "인천26,28", "인천45", "MGMP", "부천2", "인천13", "인천4"] 
    },
    { 
        label: "남양주 / 구리 / 광주", 
        items: ["남양주3", "구리3", "남양주(이패A,B)", "곤지암1", "곤지암2", "경광주4"] 
    },
    { 
        label: "안성 / 천안 / 세종 (충청)", 
        items: ["안성5", "안성4", "목천1", "XRC12.성환", "XRC06.성거", "XHM5.천안", "XRC11.세종"] 
    },
    { 
        label: "용인 / 군포 / 안양 / 이천", 
        items: ["용인5", "안양1(SH)", "군포1", "시흥1", "이천2", "여주1"] 
    },
    { 
        label: "공단 (XRC / 시흥 / 안산)", 
        items: ["시흥3", "XRC13", "XRC10", "안산2", "안산3"] 
    }
];

export function renderQuickButtons() {
    if (!els.quickLocButtons) return;

    els.quickLocButtons.innerHTML = QUICK_LOC_GROUPS.map(group => `
        <div class="quick-row">
            <div class="quick-label">${group.label}</div>
            ${group.items.map(loc => `
                <button type="button" class="btn-loc ${group.isFrequent ? 'frequent' : ''}" data-loc="${loc}">
                    ${loc}
                </button>
            `).join('')}
        </div>
    `).join('');

    els.quickLocButtons.querySelectorAll('.btn-loc').forEach(btn => {
        btn.onclick = () => {
            const loc = btn.dataset.loc;
            if (!els.fromCenterInput.value) {
                els.fromCenterInput.value = loc;
            } else if (!els.toCenterInput.value) {
                els.toCenterInput.value = loc;
            } else {
                els.fromCenterInput.value = loc;
                els.toCenterInput.value = '';
            }
            els.fromCenterInput.dispatchEvent(new Event('input'));
            els.toCenterInput.dispatchEvent(new Event('input'));
        };
    });
}

export function toggleUI() {
    const type = els.typeSelect.value;
    const isEditMode = !els.editModeIndicator.classList.contains('hidden');

    [els.transportDetails, els.fuelDetails, els.supplyDetails, els.expenseDetails, els.costInfoFieldset, els.tripActions, els.generalActions, els.editActions].forEach(el => el.classList.add('hidden'));
    
    if (type === '화물운송' || type === '대기') {
        els.transportDetails.classList.remove('hidden');
        els.costInfoFieldset.classList.remove('hidden');
        els.costWrapper.classList.add('hidden');
        els.incomeWrapper.classList.remove('hidden');
        if (!isEditMode) els.tripActions.classList.remove('hidden');
    } else if (type === '수입') {
        els.expenseDetails.classList.remove('hidden'); 
        els.costInfoFieldset.classList.remove('hidden');
        els.incomeWrapper.classList.remove('hidden');
        els.costWrapper.classList.add('hidden');
        if (!isEditMode) els.generalActions.classList.remove('hidden');
    } else {
        els.costInfoFieldset.classList.remove('hidden');
        els.incomeWrapper.classList.add('hidden');
        els.costWrapper.classList.remove('hidden');
        if (type === '주유소') els.fuelDetails.classList.remove('hidden');
        else if (type === '소모품') els.supplyDetails.classList.remove('hidden');
        else if (type === '지출') els.expenseDetails.classList.remove('hidden');
        if (!isEditMode) els.generalActions.classList.remove('hidden');
    }

    if (isEditMode) els.editActions.classList.remove('hidden');
}

export function updateAddressDisplay() {
    const fromValue = els.fromCenterInput.value;
    const toValue = els.toCenterInput.value;
    const fromLoc = MEM_LOCATIONS[fromValue] || {};
    const toLoc = MEM_LOCATIONS[toValue] || {};
    
    let html = '';
    if (fromLoc.address) html += `<div class="address-clickable" data-address="${fromLoc.address}">[상] ${fromLoc.address}</div>`;
    if (fromLoc.memo) html += `<div class="memo-display">[상] ${fromLoc.memo}</div>`;
    if (toLoc.address) html += `<div class="address-clickable" data-address="${toLoc.address}">[하] ${toLoc.address}</div>`;
    if (toLoc.memo) html += `<div class="memo-display">[하] ${toLoc.memo}</div>`;
    els.addressDisplay.innerHTML = html;
}

export function populateCenterDatalist() {
    els.centerDatalist.innerHTML = MEM_CENTERS.map(c => `<option value="${c}"></option>`).join('');
}

export function populateExpenseDatalist() {
    els.expenseDatalist.innerHTML = MEM_EXPENSE_ITEMS.map(item => `<option value="${item}"></option>`).join('');
}

export function resetForm() {
    els.recordForm.reset();
    els.editIdInput.value = '';
    els.editModeIndicator.classList.add('hidden');
    els.dateInput.value = getTodayString();
    els.timeInput.value = getCurrentTimeString();
    els.dateInput.disabled = false;
    els.timeInput.disabled = false;
    els.addressDisplay.innerHTML = '';
    toggleUI();
}

export function getFormDataWithoutTime() {
    return {
        type: els.typeSelect.value,
        from: els.fromCenterInput.value.trim(),
        to: els.toCenterInput.value.trim(),
        distance: parseFloat(els.manualDistanceInput.value) || 0,
        cost: Math.round((parseFloat(els.costInput.value) || 0) * 10000),
        income: Math.round((parseFloat(els.incomeInput.value) || 0) * 10000),
        liters: parseFloat(els.fuelLitersInput.value) || 0,
        unitPrice: parseInt(els.fuelUnitPriceInput.value) || 0,
        brand: els.fuelBrandSelect.value || '',
        supplyItem: els.supplyItemInput.value || '',
        mileage: parseInt(els.supplyMileageInput.value) || 0,
        expenseItem: els.expenseItemInput.value || ''
    };
}