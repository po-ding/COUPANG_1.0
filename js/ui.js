// --- START OF FILE js/ui.js ---

import { getTodayString, getCurrentTimeString } from './utils.js';
import { MEM_LOCATIONS, MEM_CENTERS, updateLocationData, saveData, MEM_RECORDS, MEM_EXPENSE_ITEMS, REGION_GROUPS } from './data.js';

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
};

export function toggleUI() {
    const type = els.typeSelect.value;
    const isEditMode = !els.editModeIndicator.classList.contains('hidden');
    [els.transportDetails, els.fuelDetails, els.supplyDetails, els.expenseDetails, els.costInfoFieldset, els.tripActions, els.generalActions, els.editActions].forEach(el => el.classList.add('hidden'));
    if (type === '화물운송' || type === '대기') {
        els.transportDetails.classList.remove('hidden');
        els.costInfoFieldset.classList.remove('hidden');
        els.costWrapper.classList.add('hidden');
        els.incomeWrapper.classList.remove('hidden');
        if (!isEditMode) { els.tripActions.classList.remove('hidden'); if(type === '화물운송') els.btnTripCancel.classList.remove('hidden'); }
    } else if (type === '수입') {
        els.expenseDetails.classList.remove('hidden'); 
        document.getElementById('expense-legend').textContent = "수입 내역";
        els.costInfoFieldset.classList.remove('hidden');
        els.incomeWrapper.classList.remove('hidden');
        els.costWrapper.classList.add('hidden');
        if (!isEditMode) els.generalActions.classList.remove('hidden');
    } else {
        els.costInfoFieldset.classList.remove('hidden');
        els.incomeWrapper.classList.add('hidden');
        els.costWrapper.classList.remove('hidden');
        if (type === '주유소') { els.fuelDetails.classList.remove('hidden'); if (!isEditMode) els.generalActions.classList.remove('hidden'); }
        else if (type === '소모품') { els.supplyDetails.classList.remove('hidden'); if (!isEditMode) els.generalActions.classList.remove('hidden'); }
        else if (type === '지출') { els.expenseDetails.classList.remove('hidden'); document.getElementById('expense-legend').textContent = "지출 내역"; if (!isEditMode) els.generalActions.classList.remove('hidden'); }
    }
    if (isEditMode) {
        els.editActions.classList.remove('hidden');
        if (['주유소', '소모품', '지출', '수입'].includes(type)) els.btnEditEndTrip.classList.add('hidden');
        else els.btnEditEndTrip.classList.remove('hidden');
    }
}

export function updateAddressDisplay() {
    const fromLoc = MEM_LOCATIONS[els.fromCenterInput.value] || {};
    const toLoc = MEM_LOCATIONS[els.toCenterInput.value] || {};
    let html = '';
    if (fromLoc.address) html += `<div class="address-clickable" data-address="${fromLoc.address}">[상] ${fromLoc.address}</div>`;
    if (fromLoc.memo) html += `<div class="memo-display">[상] ${fromLoc.memo}</div>`;
    if (toLoc.address) html += `<div class="address-clickable" data-address="${toLoc.address}">[하] ${toLoc.address}</div>`;
    if (toLoc.memo) html += `<div class="memo-display">[하] ${toLoc.memo}</div>`;
    els.addressDisplay.innerHTML = html;
}

export function populateCenterDatalist(list = null) {
    const target = list || MEM_CENTERS;
    els.centerDatalist.innerHTML = target.map(c => `<option value="${c}"></option>`).join('');
}

export function setupRegionButtons() {
    document.querySelectorAll('.region-btn').forEach(btn => {
        btn.onclick = (e) => {
            const isFrom = e.target.dataset.target === 'from';
            const input = isFrom ? els.fromCenterInput : els.toCenterInput;
            const region = e.target.dataset.region;
            const centerList = REGION_GROUPS[region] || [];
            populateCenterDatalist(centerList);
            input.focus();
            e.target.parentElement.querySelectorAll('.region-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
        };
    });
}

export function populateExpenseDatalist() {
    els.expenseDatalist.innerHTML = MEM_EXPENSE_ITEMS.map(item => `<option value="${item}"></option>`).join('');
}

export function addCenter(newCenter, address = '', memo = '') {
    const trimmed = newCenter?.trim();
    if (!trimmed) return;
    updateLocationData(trimmed, address, memo);
    populateCenterDatalist();
}

export function getFormDataWithoutTime() {
    const fromValue = els.fromCenterInput.value.trim();
    const toValue = els.toCenterInput.value.trim();
    if(fromValue) addCenter(fromValue); if(toValue) addCenter(toValue);
    return {
        type: els.typeSelect.value, from: fromValue, to: toValue,
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
    els.dateInput.disabled = false;
    els.timeInput.disabled = false;
    els.addressDisplay.innerHTML = '';
    toggleUI();
}

export function editRecord(id) {
    const r = MEM_RECORDS.find(x => x.id === id);
    if(!r) return;
    els.dateInput.value = r.date; els.timeInput.value = r.time; els.typeSelect.value = r.type;
    els.fromCenterInput.value = r.from || ''; els.toCenterInput.value = r.to || '';
    els.manualDistanceInput.value = r.distance || ''; els.incomeInput.value = r.income ? (r.income/10000) : ''; 
    els.costInput.value = r.cost ? (r.cost/10000) : ''; els.fuelBrandSelect.value = r.brand || ''; 
    els.fuelLitersInput.value = r.liters || ''; els.fuelUnitPriceInput.value = r.unitPrice || '';
    els.expenseItemInput.value = r.expenseItem || ''; els.supplyItemInput.value = r.supplyItem || ''; 
    els.supplyMileageInput.value = r.mileage || ''; els.editIdInput.value = id; 
    els.editModeIndicator.classList.remove('hidden');
    els.dateInput.disabled = true; els.timeInput.disabled = true;
    toggleUI(); window.scrollTo(0,0);
}

export function displayCenterList(filter='') {
    const container = document.getElementById('center-list-container');
    container.innerHTML = "";
    const list = MEM_CENTERS.filter(c => c.includes(filter));
    if(list.length===0) { container.innerHTML='<p class="note">결과 없음</p>'; return; } 
    list.forEach(c => {
        const l = MEM_LOCATIONS[c]||{};
        const div = document.createElement('div');
        div.className='center-item';
        div.innerHTML=`<div class="info"><span class="center-name">${c}</span><div class="action-buttons"><button class="edit-btn">수정</button><button class="delete-btn">삭제</button></div></div>${l.address?`<span class="note">주소: ${l.address}</span>`:''}`;
        div.querySelector('.edit-btn').onclick = () => {
            div.innerHTML = `<div class="edit-form"><input class="edit-input" value="${c}"><input class="edit-address-input" value="${l.address||''}"><input class="edit-memo-input" value="${l.memo||''}"><div class="action-buttons"><button class="setting-save-btn">저장</button><button class="cancel-edit-btn">취소</button></div></div>`;
            div.querySelector('.setting-save-btn').onclick = () => {
                const nn = div.querySelector('.edit-input').value.trim();
                const na = div.querySelector('.edit-address-input').value.trim();
                const nm = div.querySelector('.edit-memo-input').value.trim();
                if(!nn) return;
                if(nn!==c) {
                    const idx = MEM_CENTERS.indexOf(c); if(idx>-1) MEM_CENTERS.splice(idx,1);
                    if(!MEM_CENTERS.includes(nn)) MEM_CENTERS.push(nn);
                    delete MEM_LOCATIONS[c];
                    MEM_RECORDS.forEach(r => { if(r.from===c) r.from=nn; if(r.to===c) r.to=nn; });
                    MEM_CENTERS.sort(); saveData();
                }
                updateLocationData(nn, na, nm); displayCenterList(document.getElementById('center-search-input').value);
            };
            div.querySelector('.cancel-edit-btn').onclick = () => displayCenterList(document.getElementById('center-search-input').value);
        };
        div.querySelector('.delete-btn').onclick = () => {
            if(!confirm('삭제?')) return;
            const idx = MEM_CENTERS.indexOf(c); if(idx>-1) MEM_CENTERS.splice(idx,1);
            delete MEM_LOCATIONS[c]; saveData(); displayCenterList(document.getElementById('center-search-input').value);
        };
        container.appendChild(div);
    });
}

// [OCR] 로직
export async function processReceiptImage(file) {
    const statusDiv = document.getElementById('ocr-status');
    const resultContainer = document.getElementById('ocr-result-container');
    if (!file) return;
    ['ocr-date', 'ocr-time', 'ocr-cost', 'ocr-liters', 'ocr-price', 'ocr-subsidy', 'ocr-remaining', 'ocr-net-cost'].forEach(id => document.getElementById(id).value = '');
    resultContainer.classList.add('hidden');
    statusDiv.innerHTML = "⏳ 이미지 분석 중...";
    try {
        const processedImage = await preprocessImage(file);
        const { data: { text } } = await Tesseract.recognize(processedImage, 'kor+eng', { logger: m => { if(m.status === 'recognizing text') statusDiv.textContent = `⏳ 인식 중... ${(m.progress * 100).toFixed(0)}%`; } });
        statusDiv.innerHTML = "✅ 분석 완료!";
        resultContainer.classList.remove('hidden');
        parseReceiptText(text);
    } catch (error) { statusDiv.innerHTML = "❌ 분석 실패"; }
}

function preprocessImage(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d');
                const maxDim = 1500; let w = img.width, h = img.height;
                if (w > h && w > maxDim) { h *= maxDim / w; w = maxDim; } else if (h > w && h > maxDim) { w *= maxDim / h; h = maxDim; }
                canvas.width = w; canvas.height = h; ctx.drawImage(img, 0, 0, w, h);
                const data = ctx.getImageData(0, 0, w, h);
                for (let i = 0; i < data.data.length; i += 4) {
                    const gray = data.data[i]*0.299 + data.data[i+1]*0.587 + data.data[i+2]*0.114;
                    const val = gray < 210 ? 0 : 255; data.data[i] = data.data[i+1] = data.data[i+2] = val;
                }
                ctx.putImageData(data, 0, 0); canvas.toBlob(b => resolve(URL.createObjectURL(b)));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

function parseReceiptText(text) {
    const dateMatch = text.match(/(\d{4})[-.,/년\s]+(\d{1,2})[-.,/월\s]+(\d{1,2})/);
    if (dateMatch) document.getElementById('ocr-date').value = `${dateMatch[1]}-${dateMatch[2].padStart(2,'0')}-${dateMatch[3].padStart(2,'0')}`;
    else document.getElementById('ocr-date').value = getTodayString();
    const timeMatch = text.match(/(\d{1,2})\s*:\s*(\d{2})/);
    if (timeMatch) document.getElementById('ocr-time').value = `${timeMatch[1].padStart(2,'0')}:${timeMatch[2]}`;
    const extractNum = (s) => { const m = s.match(/[\d,.]+/g); return m ? parseFloat(m[m.length-1].replace(/,/g,'')) : null; };
    text.split('\n').forEach(line => {
        const l = line.replace(/\s/g,'');
        if (l.includes('주유금액') || l.includes('승인금액')) { const v = extractNum(line); if(v>1000) document.getElementById('ocr-cost').value = v; }
        if (l.includes('주유리터') || l.includes('주유량')) document.getElementById('ocr-liters').value = extractNum(line);
        if (l.includes('주유단가')) { const v = extractNum(line); if(v>500 && v<3000) document.getElementById('ocr-price').value = v; }
        if (l.includes('보조금액') || l.includes('보조금')) document.getElementById('ocr-subsidy').value = extractNum(line);
    });
    const lit = parseFloat(document.getElementById('ocr-liters').value)||0, pr = parseInt(document.getElementById('ocr-price').value)||0;
    let cost = parseInt(document.getElementById('ocr-cost').value)||0;
    if (cost===0 && lit>0 && pr>0) document.getElementById('ocr-cost').value = Math.round(lit*pr);
    const sub = parseInt(document.getElementById('ocr-subsidy').value)||0;
    if (cost>0) document.getElementById('ocr-net-cost').value = cost - sub;
}