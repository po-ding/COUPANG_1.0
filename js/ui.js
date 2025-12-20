import { getTodayString, getCurrentTimeString } from './utils.js';
import { MEM_LOCATIONS, MEM_RECORDS, MEM_EXPENSE_ITEMS } from './data.js';
import { populateCenterDatalist, handleTransportInput } from './location.js';

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
    expenseItemInput: document.getElementById('expense-item'),
    costInput: document.getElementById('cost'),
    incomeInput: document.getElementById('income'),
    tripActions: document.getElementById('trip-actions'),
    generalActions: document.getElementById('general-actions'),
    editActions: document.getElementById('edit-actions'),
    btnStartTrip: document.getElementById('btn-start-trip'),
    btnSaveGeneral: document.getElementById('btn-save-general'),
    editModeIndicator: document.getElementById('edit-mode-indicator'),
    editIdInput: document.getElementById('edit-id'),
};

export function toggleUI() {
    const type = els.typeSelect.value;
    const isEdit = !els.editModeIndicator.classList.contains('hidden');
    [els.transportDetails, els.fuelDetails, els.supplyDetails, els.expenseDetails, els.costInfoFieldset, els.tripActions, els.generalActions, els.editActions].forEach(el => el.classList.add('hidden'));

    if (type === '화물운송') {
        els.transportDetails.classList.remove('hidden');
        els.costInfoFieldset.classList.remove('hidden');
        els.incomeWrapper.classList.remove('hidden');
        if (!isEdit) els.tripActions.classList.remove('hidden');
    } else if (['수입', '지출', '주유소', '소모품'].includes(type)) {
        els.costInfoFieldset.classList.remove('hidden');
        if (type === '수입') { els.expenseDetails.classList.remove('hidden'); els.incomeWrapper.classList.remove('hidden'); }
        else { els.costWrapper.classList.remove('hidden'); if(type==='주유소') els.fuelDetails.classList.remove('hidden'); }
        if (!isEdit) els.generalActions.classList.remove('hidden');
    }
    if (isEdit) els.editActions.classList.remove('hidden');
}

export function resetForm() {
    els.recordForm.reset();
    els.dateInput.value = getTodayString();
    els.timeInput.value = getCurrentTimeString();
    els.editModeIndicator.classList.add('hidden');
    els.editIdInput.value = '';
    toggleUI();
    populateCenterDatalist();
}