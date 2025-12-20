import { REGION_GROUPS, MEM_CENTERS, MEM_RECORDS } from './data.js';
import { getTodayString, getCurrentTimeString } from './utils.js';

export const els = {
    recordForm: document.getElementById('record-form'),
    typeSelect: document.getElementById('type'),
    fromInput: document.getElementById('from-center'),
    toInput: document.getElementById('to-center'),
    centerDatalist: document.getElementById('center-list'),
    editId: document.getElementById('edit-id'),
    addressDisplay: document.getElementById('address-display'),
    editModeIndicator: document.getElementById('edit-mode-indicator')
};

export function populateCenterDatalist(list = null) {
    const items = list || MEM_CENTERS;
    els.centerDatalist.innerHTML = items.map(c => `<option value="${c}"></option>`).join('');
}

// 권역 필터 버튼 설정
export function setupRegionButtons() {
    document.querySelectorAll('.region-btn').forEach(btn => {
        btn.onclick = (e) => {
            const isFrom = e.target.dataset.target === 'from';
            const input = isFrom ? els.fromInput : els.toInput;
            const region = e.target.dataset.region;
            const centerList = REGION_GROUPS[region] || [];
            
            populateCenterDatalist(centerList);
            input.focus();
            
            e.target.parentElement.querySelectorAll('.region-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
        };
    });
}

export function toggleUI() {
    const type = els.typeSelect.value;
    document.getElementById('transport-details').classList.toggle('hidden', type !== '화물운송');
    document.getElementById('fuel-details').classList.toggle('hidden', type !== '주유소');
    document.getElementById('cost-wrapper').classList.toggle('hidden', type === '화물운송');
    document.getElementById('income-wrapper').classList.toggle('hidden', type !== '화물운송');
}

export function editRecord(id) {
    const r = MEM_RECORDS.find(x => x.id === id);
    if(!r) return;
    document.getElementById('date').value = r.date;
    document.getElementById('time').value = r.time;
    els.typeSelect.value = r.type;
    els.fromInput.value = r.from || '';
    els.toInput.value = r.to || '';
    document.getElementById('income').value = r.income / 10000 || '';
    document.getElementById('manual-distance').value = r.distance || '';
    els.editId.value = id;
    
    document.getElementById('edit-actions').classList.remove('hidden');
    document.getElementById('trip-actions').classList.add('hidden');
    els.editModeIndicator.classList.remove('hidden');
    toggleUI();
    window.scrollTo(0,0);
}

export function resetForm() {
    els.recordForm.reset();
    document.getElementById('date').value = getTodayString();
    document.getElementById('time').value = getCurrentTimeString();
    els.editId.value = '';
    document.getElementById('edit-actions').classList.add('hidden');
    document.getElementById('trip-actions').classList.remove('hidden');
    els.editModeIndicator.classList.add('hidden');
    toggleUI();
}