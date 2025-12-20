import { REGION_GROUPS, MEM_CENTERS, MEM_RECORDS } from './data.js';
import { getTodayString, getCurrentTimeString } from './utils.js';

export const els = {
    fromInput: document.getElementById('from-center'),
    toInput: document.getElementById('to-center'),
    centerDatalist: document.getElementById('center-list'),
    typeSelect: document.getElementById('type'),
    editId: document.getElementById('edit-id')
};

export function populateCenterDatalist(list = null) {
    const items = list || MEM_CENTERS;
    els.centerDatalist.innerHTML = items.map(c => `<option value="${c}"></option>`).join('');
}

export function setupRegionButtons() {
    document.querySelectorAll('.region-btn').forEach(btn => {
        btn.onclick = (e) => {
            const region = e.target.dataset.region;
            const target = e.target.dataset.target === 'from' ? els.fromInput : els.toInput;
            populateCenterDatalist(REGION_GROUPS[region]);
            target.focus();
            
            e.target.parentElement.querySelectorAll('.region-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
        };
    });
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
    document.getElementById('edit-mode-indicator').classList.remove('hidden');
    window.scrollTo(0,0);
}

export function resetForm() {
    document.getElementById('record-form').reset();
    document.getElementById('date').value = getTodayString();
    document.getElementById('time').value = getCurrentTimeString();
    els.editId.value = '';
    document.getElementById('edit-actions').classList.add('hidden');
    document.getElementById('trip-actions').classList.remove('hidden');
    document.getElementById('edit-mode-indicator').classList.add('hidden');
}