import { getTodayString, getCurrentTimeString } from './utils.js';
import { MEM_LOCATIONS, MEM_RECORDS, MEM_EXPENSE_ITEMS } from './data.js';
import { addCenter, updateAddressDisplay, populateCenterDatalist } from './location.js';

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

export function toggleUI() {
    const type = els.typeSelect.value;
    const isEdit = !els.editModeIndicator.classList.contains('hidden');
    [els.transportDetails, els.fuelDetails, els.supplyDetails, els.expenseDetails, els.costInfoFieldset, els.tripActions, els.generalActions, els.editActions].forEach(el => el.classList.add('hidden'));
    
    if (type === '화물운송' || type === '대기') {
        els.transportDetails.classList.remove('hidden');
        els.costInfoFieldset.classList.remove('hidden');
        els.costWrapper.classList.add('hidden');
        els.incomeWrapper.classList.remove('hidden');
        if (!isEdit) { els.tripActions.classList.remove('hidden'); els.btnTripCancel.classList.toggle('hidden', type !== '화물운송'); }
    } else if (type === '수입' || type === '지출') {
        els.expenseDetails.classList.remove('hidden');
        document.getElementById('expense-legend').textContent = type === '수입' ? "수입 내역" : "지출 내역";
        els.costInfoFieldset.classList.remove('hidden');
        els.incomeWrapper.classList.toggle('hidden', type === '지출');
        els.costWrapper.classList.toggle('hidden', type === '수입');
        if (!isEdit) els.generalActions.classList.remove('hidden');
    } else {
        els.costInfoFieldset.classList.remove('hidden');
        els.incomeWrapper.classList.add('hidden');
        els.costWrapper.classList.remove('hidden');
        if (type === '주유소') els.fuelDetails.classList.remove('hidden');
        if (type === '소모품') els.supplyDetails.classList.remove('hidden');
        if (!isEdit) els.generalActions.classList.remove('hidden');
    }
    if (isEdit) {
        els.editActions.classList.remove('hidden');
        els.btnEditEndTrip.classList.toggle('hidden', ['주유소','소모품','지출','수입'].includes(type));
    }
}

export function populateExpenseDatalist() {
    els.expenseDatalist.innerHTML = MEM_EXPENSE_ITEMS.map(item => `<option value="${item}"></option>`).join('');
}

export function getFormDataWithoutTime() {
    const from = els.fromCenterInput.value.trim();
    const to = els.toCenterInput.value.trim();
    if(from) addCenter(from);
    if(to) addCenter(to);
    return {
        type: els.typeSelect.value, from, to,
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

export function resetForm() {
    els.recordForm.reset();
    els.editIdInput.value = '';
    els.editModeIndicator.classList.add('hidden');
    els.dateInput.value = getTodayString();
    els.timeInput.value = getCurrentTimeString();
    els.dateInput.disabled = els.timeInput.disabled = false;
    els.addressDisplay.innerHTML = '';
    toggleUI();
}

export function editRecord(id) {
    const r = MEM_RECORDS.find(x => x.id === id);
    if(!r) return;
    els.dateInput.value = r.date; els.timeInput.value = r.time; els.typeSelect.value = r.type;
    els.fromCenterInput.value = r.from || ''; els.toCenterInput.value = r.to || '';
    els.manualDistanceInput.value = r.distance || ''; 
    els.incomeInput.value = r.income ? (r.income/10000) : ''; els.costInput.value = r.cost ? (r.cost/10000) : '';
    els.fuelBrandSelect.value = r.brand || ''; els.fuelLitersInput.value = r.liters || ''; els.fuelUnitPriceInput.value = r.unitPrice || '';
    els.expenseItemInput.value = r.expenseItem || ''; els.supplyItemInput.value = r.supplyItem || ''; els.supplyMileageInput.value = r.mileage || '';
    els.editIdInput.value = id; els.editModeIndicator.classList.remove('hidden');
    els.dateInput.disabled = els.timeInput.disabled = true;
    toggleUI(); updateAddressDisplay(); window.scrollTo(0,0);
}