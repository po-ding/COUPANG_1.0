// --- js/ui.js ---
import { getTodayString, getCurrentTimeString } from './utils.js';
import { MEM_LOCATIONS, MEM_CENTERS, updateLocationData, saveData, MEM_RECORDS, MEM_EXPENSE_ITEMS } from './data.js';

// 모든 요소를 가져오되, 없는 요소는 null이 됩니다.
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
    centerManagementBody: document.getElementById('center-management-body'),
    centerListContainer: document.getElementById('center-list-container'),
};

export function toggleUI() {
    if (!els.typeSelect) return; // 요소가 없으면(설정 페이지면) 중단
    
    const type = els.typeSelect.value;
    const isEditMode = els.editModeIndicator && !els.editModeIndicator.classList.contains('hidden');

    const sections = [els.transportDetails, els.fuelDetails, els.supplyDetails, els.expenseDetails, els.costInfoFieldset, els.tripActions, els.generalActions, els.editActions];
    sections.forEach(el => el?.classList.add('hidden'));
    
    if (type === '화물운송' || type === '대기') {
        els.transportDetails?.classList.remove('hidden');
        els.costInfoFieldset?.classList.remove('hidden');
        els.costWrapper?.classList.add('hidden');
        els.incomeWrapper?.classList.remove('hidden');
        if (!isEditMode) els.tripActions?.classList.remove('hidden');
    } else if (type === '수입') {
        els.expenseDetails?.classList.remove('hidden'); 
        const legend = document.getElementById('expense-legend');
        if(legend) legend.textContent = "수입 내역";
        els.costInfoFieldset?.classList.remove('hidden');
        els.incomeWrapper?.classList.remove('hidden');
        els.costWrapper?.classList.add('hidden');
        if (!isEditMode) els.generalActions?.classList.remove('hidden');
    } else {
        els.costInfoFieldset?.classList.remove('hidden');
        els.incomeWrapper?.classList.add('hidden');
        els.costWrapper?.classList.remove('hidden');
        
        if (type === '주유소') {
            els.fuelDetails?.classList.remove('hidden');
        } else if (type === '소모품') {
            els.supplyDetails?.classList.remove('hidden');
        } else if (type === '지출') {
            els.expenseDetails?.classList.remove('hidden');
            const legend = document.getElementById('expense-legend');
            if(legend) legend.textContent = "지출 내역";
        }
        if (!isEditMode) els.generalActions?.classList.remove('hidden');
    }

    if (isEditMode) {
        els.editActions?.classList.remove('hidden');
        if (['주유소', '소모품', '지출', '수입'].includes(type)) {
            els.btnEditEndTrip?.classList.add('hidden');
        } else {
            els.btnEditEndTrip?.classList.remove('hidden');
        }
    }
}

export function updateAddressDisplay() {
    if (!els.addressDisplay || !els.fromCenterInput) return;
    const fromLoc = MEM_LOCATIONS[els.fromCenterInput.value] || {};
    const toLoc = MEM_LOCATIONS[els.toCenterInput.value] || {};
    let html = '';
    if (fromLoc.address) html += `<div class="address-clickable" data-address="${fromLoc.address}">[상] ${fromLoc.address}</div>`;
    if (fromLoc.memo) html += `<div class="memo-display">[상] ${fromLoc.memo}</div>`;
    if (toLoc.address) html += `<div class="address-clickable" data-address="${toLoc.address}">[하] ${toLoc.address}</div>`;
    if (toLoc.memo) html += `<div class="memo-display">[하] ${toLoc.memo}</div>`;
    els.addressDisplay.innerHTML = html;
}

export function populateCenterDatalist() {
    if (els.centerDatalist) {
        els.centerDatalist.innerHTML = MEM_CENTERS.map(c => `<option value="${c}"></option>`).join('');
    }
}

export function populateExpenseDatalist() {
    if (els.expenseDatalist) {
        els.expenseDatalist.innerHTML = MEM_EXPENSE_ITEMS.map(item => `<option value="${item}"></option>`).join('');
    }
}

export function resetForm() {
    if (!els.recordForm) return;
    els.recordForm.reset();
    if(els.editIdInput) els.editIdInput.value = '';
    els.editModeIndicator?.classList.add('hidden');
    if(els.dateInput) els.dateInput.value = getTodayString();
    if(els.timeInput) els.timeInput.value = getCurrentTimeString();
    if(els.dateInput) els.dateInput.disabled = false;
    if(els.timeInput) els.timeInput.disabled = false;
    if(els.addressDisplay) els.addressDisplay.innerHTML = '';
    toggleUI();
}

// ... displayCenterList 등 나머지 함수들도 if (els.centerListContainer) 처럼 래핑하여 유지