import { getTodayString, getCurrentTimeString } from './utils.js';
import { MEM_LOCATIONS, MEM_RECORDS } from './data.js';

export const els = {
    // 페이지 및 레이아웃
    mainPage: document.getElementById('main-page'),
    settingsPage: document.getElementById('settings-page'),
    btnGoToSettings: document.getElementById('go-to-settings-btn'),
    btnBackToMain: document.getElementById('back-to-main-btn'),
    
    // 폼 입력
    recordForm: document.getElementById('record-form'),
    dateInput: document.getElementById('date'),
    timeInput: document.getElementById('time'),
    typeSelect: document.getElementById('type'),
    fromCenterInput: document.getElementById('from-center'),
    toCenterInput: document.getElementById('to-center'),
    manualDistanceInput: document.getElementById('manual-distance'),
    incomeInput: document.getElementById('income'),
    costInput: document.getElementById('cost'),
    fuelLitersInput: document.getElementById('fuel-liters'),
    fuelUnitPriceInput: document.getElementById('fuel-unit-price'),
    fuelBrandSelect: document.getElementById('fuel-brand'),
    expenseItemInput: document.getElementById('expense-item'),
    
    // 버튼
    btnStartTrip: document.getElementById('btn-start-trip'),
    btnEndTrip: document.getElementById('btn-end-trip'),
    btnTripCancel: document.getElementById('btn-trip-cancel'),
    btnSaveGeneral: document.getElementById('btn-save-general'),
    
    // 기타 영역
    quickLocButtons: document.getElementById('quick-location-buttons'),
    addressDisplay: document.getElementById('address-display'),
    editModeIndicator: document.getElementById('edit-mode-indicator'),
    editIdInput: document.getElementById('edit-id'),
    
    // 입력 필드셋 가시성 조절용
    transportDetails: document.getElementById('transport-details'),
    fuelDetails: document.getElementById('fuel-details'),
    expenseDetails: document.getElementById('expense-details'),
    supplyDetails: document.getElementById('supply-details'),
    costInfoFieldset: document.getElementById('cost-info-fieldset'),
    costWrapper: document.getElementById('cost-wrapper'),
    incomeWrapper: document.getElementById('income-wrapper'),
    tripActions: document.getElementById('trip-actions'),
    generalActions: document.getElementById('general-actions'),
    editActions: document.getElementById('edit-actions')
};

// 퀵 버튼 데이터 (제공해주신 백업 기반)
const QUICK_LOC_GROUPS = [
    { label: "⭐ 자주 가는 곳", isFrequent: true, items: ["남양주4", "MNYJ2", "고양1.CFC", "인천31.32.41.42", "안산1(SH)", "시흥2"] },
    { label: "인천/김포/부천", items: ["인천16", "인천26,28", "인천45", "MGMP", "부천2", "인천13"] },
    { label: "남양주/구리/광주", items: ["남양주3", "구리3", "남양주(이패A,B)", "곤지암1", "곤지암2", "경광주4"] },
    { label: "안성/천안/세종 (충청)", items: ["안성5", "안성4", "목천1", "XRC12.성환", "XRC06.성거", "XHM5.천안", "XRC11.세종"] },
    { label: "용인/안양/군포/이천", items: ["용인5", "안양1(SH)", "군포1", "시흥1", "이천2", "여주1"] },
    { label: "시흥/안산 (공단)", items: ["시흥3", "XRC13", "XRC10", "안산2", "안산3"] }
];

export function renderQuickButtons() {
    if (!els.quickLocButtons) return;
    els.quickLocButtons.innerHTML = QUICK_LOC_GROUPS.map(group => `
        <div class="quick-row">
            <div class="quick-label">${group.label}</div>
            ${group.items.map(loc => `<button type="button" class="btn-loc ${group.isFrequent ? 'frequent' : ''}" data-loc="${loc}">${loc}</button>`).join('')}
        </div>
    `).join('');

    els.quickLocButtons.querySelectorAll('.btn-loc').forEach(btn => {
        btn.onclick = () => {
            const loc = btn.dataset.loc;
            if (!els.fromCenterInput.value) els.fromCenterInput.value = loc;
            else if (!els.toCenterInput.value) els.toCenterInput.value = loc;
            else { els.fromCenterInput.value = loc; els.toCenterInput.value = ''; }
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
    } else {
        els.costInfoFieldset.classList.remove('hidden');
        els.incomeWrapper.classList.add('hidden');
        els.costWrapper.classList.remove('hidden');
        if (type === '주유소') els.fuelDetails.classList.remove('hidden');
        else if (type === '지출') els.expenseDetails.classList.remove('hidden');
        if (!isEditMode) els.generalActions.classList.remove('hidden');
    }
    if (isEditMode) els.editActions.classList.remove('hidden');
}

export function resetForm() {
    els.recordForm.reset();
    els.dateInput.value = getTodayString();
    els.timeInput.value = getCurrentTimeString();
    els.editModeIndicator.classList.add('hidden');
    els.editIdInput.value = '';
    toggleUI();
}

export function getFormData() {
    return {
        type: els.typeSelect.value,
        from: els.fromCenterInput.value.trim(),
        to: els.toCenterInput.value.trim(),
        distance: parseFloat(els.manualDistanceInput.value) || 0,
        income: Math.round((parseFloat(els.incomeInput.value) || 0) * 10000),
        cost: Math.round((parseFloat(els.costInput.value) || 0) * 10000),
        liters: parseFloat(els.fuelLitersInput.value) || 0,
        unitPrice: parseInt(els.fuelUnitPriceInput.value) || 0,
        brand: els.fuelBrandSelect.value,
        expenseItem: els.expenseItemInput.value
    };
}