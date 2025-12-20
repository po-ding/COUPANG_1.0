import { getTodayString, getCurrentTimeString } from './utils.js';
import { MEM_CENTERS, MEM_LOCATIONS, REGION_GROUPS, saveData } from './data.js';

export const els = {
    recordForm: document.getElementById('record-form'),
    typeSelect: document.getElementById('type'),
    fromCenter: document.getElementById('from-center'),
    toCenter: document.getElementById('to-center'),
    centerDatalist: document.getElementById('center-list'),
    incomeInput: document.getElementById('income'),
    costInput: document.getElementById('cost'),
    distInput: document.getElementById('manual-distance'),
    editId: document.getElementById('edit-id'),
    addressDisplay: document.getElementById('address-display')
};

export function toggleUI() {
    const type = els.typeSelect.value;
    document.getElementById('transport-details').classList.toggle('hidden', type !== '화물운송');
    document.getElementById('fuel-details').classList.toggle('hidden', type !== '주유소');
    document.getElementById('expense-details').classList.toggle('hidden', !['지출','수입'].includes(type));
    document.getElementById('cost-wrapper').classList.toggle('hidden', type === '수입' || type === '화물운송');
    document.getElementById('income-wrapper').classList.toggle('hidden', type !== '수입' && type !== '화물운송');
}

export function populateCenterDatalist(list = null) {
    const target = list || MEM_CENTERS;
    els.centerDatalist.innerHTML = target.map(c => `<option value="${c}"></option>`).join('');
}

export function setupRegionButtons() {
    document.querySelectorAll('.region-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const isFrom = e.target.dataset.target === 'from';
            const input = isFrom ? els.fromCenter : els.toCenter;
            const region = e.target.dataset.region;
            const centers = REGION_GROUPS[region];
            
            populateCenterDatalist(centers);
            input.focus();
            
            e.target.parentElement.querySelectorAll('.region-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
        });
    });
}

export function resetForm() {
    els.recordForm.reset();
    document.getElementById('date').value = getTodayString();
    document.getElementById('time').value = getCurrentTimeString();
    els.editId.value = '';
    toggleUI();
}