import { getTodayString, getCurrentTimeString } from './utils.js';
import { MEM_LOCATIONS, MEM_CENTERS, updateLocationData, saveData, MEM_RECORDS } from './data.js';

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
    const type = els.typeSelect.value;
    const isEditMode = !els.editModeIndicator.classList.contains('hidden');

    [els.transportDetails, els.fuelDetails, els.supplyDetails, els.expenseDetails, els.costInfoFieldset, els.tripActions, els.generalActions, els.editActions].forEach(el => el.classList.add('hidden'));
    
    if (type === '화물운송' || type === '대기') {
        els.transportDetails.classList.remove('hidden');
        els.costInfoFieldset.classList.remove('hidden');
        els.costWrapper.classList.add('hidden');
        els.incomeWrapper.classList.remove('hidden');
        if (!isEditMode) {
            els.tripActions.classList.remove('hidden');
            if(type === '화물운송') els.btnTripCancel.classList.remove('hidden');
        }
    } else {
        els.costInfoFieldset.classList.remove('hidden');
        els.incomeWrapper.classList.add('hidden');
        els.costWrapper.classList.remove('hidden');
        if (type === '주유소') {
            els.fuelDetails.classList.remove('hidden');
            if (!isEditMode) els.generalActions.classList.remove('hidden');
        } else if (type === '소모품') {
            els.supplyDetails.classList.remove('hidden');
            if (!isEditMode) els.generalActions.classList.remove('hidden');
        } else if (type === '지출') {
            els.expenseDetails.classList.remove('hidden');
            if (!isEditMode) els.generalActions.classList.remove('hidden');
        }
    }

    if (isEditMode) {
        els.editActions.classList.remove('hidden');
        if (type === '주유소' || type === '소모품' || type === '지출') {
            els.btnEditEndTrip.classList.add('hidden');
        } else {
            els.btnEditEndTrip.classList.remove('hidden');
        }
    }
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

export function addCenter(newCenter, address = '', memo = '') {
    const trimmed = newCenter?.trim();
    if (!trimmed) return;
    updateLocationData(trimmed, address, memo);
    populateCenterDatalist();
}

export function getFormDataWithoutTime() {
    const fromValue = els.fromCenterInput.value.trim();
    const toValue = els.toCenterInput.value.trim();
    if(fromValue) addCenter(fromValue);
    if(toValue) addCenter(toValue);

    return {
        type: els.typeSelect.value,
        from: fromValue,
        to: toValue,
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
    els.dateInput.value = r.date; 
    els.timeInput.value = r.time; 
    els.typeSelect.value = r.type;
    els.fromCenterInput.value = r.from || ''; 
    els.toCenterInput.value = r.to || '';
    els.manualDistanceInput.value = r.distance || ''; 
    els.incomeInput.value = r.income ? (r.income/10000) : ''; 
    els.costInput.value = r.cost ? (r.cost/10000) : '';
    els.fuelBrandSelect.value = r.brand || ''; 
    els.fuelLitersInput.value = r.liters || ''; 
    els.fuelUnitPriceInput.value = r.unitPrice || '';
    els.expenseItemInput.value = r.expenseItem || ''; 
    els.supplyItemInput.value = r.supplyItem || ''; 
    els.supplyMileageInput.value = r.mileage || '';
    els.editIdInput.value = id; 
    els.editModeIndicator.classList.remove('hidden');
    els.dateInput.disabled = true; 
    els.timeInput.disabled = true;
    toggleUI(); 
    window.scrollTo(0,0);
}

export function displayCenterList(filter='') {
    els.centerListContainer.innerHTML = "";
    const list = MEM_CENTERS.filter(c => c.includes(filter));
    if(list.length===0) { 
        els.centerListContainer.innerHTML='<p class="note">결과 없음</p>'; 
        return; 
    } 
    list.forEach(c => {
        const l = MEM_LOCATIONS[c]||{};
        const div = document.createElement('div');
        div.className='center-item';
        div.innerHTML=`<div class="info"><span class="center-name">${c}</span><div class="action-buttons"><button class="edit-btn">수정</button><button class="delete-btn">삭제</button></div></div>${l.address?`<span class="note">주소: ${l.address}</span>`:''}`;
        
        div.querySelector('.edit-btn').onclick = () => handleCenterEdit(div,c);
        div.querySelector('.delete-btn').onclick = () => {
            if(!confirm('삭제?')) return;
            const idx = MEM_CENTERS.indexOf(c);
            if(idx>-1) MEM_CENTERS.splice(idx,1);
            delete MEM_LOCATIONS[c];
            saveData();
            displayCenterList(document.getElementById('center-search-input').value);
        };
        els.centerListContainer.appendChild(div);
    });
}

function handleCenterEdit(div, c) {
    const l = MEM_LOCATIONS[c]||{};
    div.innerHTML = `<div class="edit-form"><input class="edit-input" value="${c}"><input class="edit-address-input" value="${l.address||''}"><input class="edit-memo-input" value="${l.memo||''}"><div class="action-buttons"><button class="setting-save-btn">저장</button><button class="cancel-edit-btn">취소</button></div></div>`;
    
    div.querySelector('.setting-save-btn').onclick = () => {
        const nn = div.querySelector('.edit-input').value.trim();
        const na = div.querySelector('.edit-address-input').value.trim();
        const nm = div.querySelector('.edit-memo-input').value.trim();
        if(!nn) return;
        if(nn!==c) {
            const idx = MEM_CENTERS.indexOf(c);
            if(idx>-1) MEM_CENTERS.splice(idx,1);
            if(!MEM_CENTERS.includes(nn)) MEM_CENTERS.push(nn);
            delete MEM_LOCATIONS[c];
            MEM_RECORDS.forEach(r => { if(r.from===c) r.from=nn; if(r.to===c) r.to=nn; });
            
            MEM_CENTERS.sort();
            saveData();
        }
        updateLocationData(nn, na, nm);
        displayCenterList(document.getElementById('center-search-input').value);
    };
    div.querySelector('.cancel-edit-btn').onclick = () => displayCenterList(document.getElementById('center-search-input').value);
}

// [추가] OCR 이미지 처리 로직
export async function processReceiptImage(file) {
    const statusDiv = document.getElementById('ocr-status');
    const resultContainer = document.getElementById('ocr-result-container');
    
    if (!file) return;

    // 초기화: 이전 값 제거
    document.getElementById('ocr-date').value = '';
    document.getElementById('ocr-time').value = '';
    document.getElementById('ocr-cost').value = '';
    document.getElementById('ocr-liters').value = '';
    document.getElementById('ocr-price').value = '';
    document.getElementById('ocr-brand').value = '';

    resultContainer.classList.add('hidden');
    statusDiv.innerHTML = "⏳ 이미지 분석 중입니다... (약 3~5초 소요)";
    statusDiv.style.color = "#007bff";

    try {
        const { data: { text } } = await Tesseract.recognize(
            file,
            'kor+eng', 
            { 
                logger: m => {
                    if(m.status === 'recognizing text') {
                        statusDiv.textContent = `⏳ 분석 중... ${(m.progress * 100).toFixed(0)}%`;
                    }
                } 
            }
        );

        statusDiv.innerHTML = "✅ 분석 완료! 내용을 확인해주세요.";
        statusDiv.style.color = "green";
        resultContainer.classList.remove('hidden');

        parseReceiptText(text);

    } catch (error) {
        console.error(error);
        statusDiv.innerHTML = "❌ 분석 실패. 이미지가 너무 흐릿하거나 형식이 맞지 않습니다.";
        statusDiv.style.color = "red";
    }
}

function parseReceiptText(text) {
    const cleanText = text.replace(/\s+/g, ' ');

    const dateMatch = text.match(/(\d{4})[-./년]\s*(\d{2})[-./월]\s*(\d{2})/);
    if (dateMatch) {
        document.getElementById('ocr-date').value = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;
    } else {
        document.getElementById('ocr-date').value = getTodayString();
    }

    const timeMatch = text.match(/(\d{2}):(\d{2})/);
    if (timeMatch) {
        document.getElementById('ocr-time').value = `${timeMatch[1]}:${timeMatch[2]}`;
    } else {
        document.getElementById('ocr-time').value = "12:00";
    }

    const costMatch = cleanText.match(/(금액|합계|청구).*?([\d,]+)(원|W|w)?/);
    if (costMatch) {
        const cost = parseInt(costMatch[2].replace(/,/g, ''));
        document.getElementById('ocr-cost').value = cost;
    }

    const literMatch = cleanText.match(/([\d.]+)L|([\d.]+)\s*(리터|ℓ)/i);
    if (literMatch) {
        const lit = parseFloat(literMatch[1] || literMatch[2]);
        document.getElementById('ocr-liters').value = lit;
    }

    const priceMatch = cleanText.match(/단가.*?([\d,]+)/);
    if (priceMatch) {
        const price = parseInt(priceMatch[1].replace(/,/g, ''));
        document.getElementById('ocr-price').value = price;
    }

    let brand = "기타";
    if (cleanText.includes("S-OIL") || cleanText.includes("에쓰오일")) brand = "S-OIL";
    else if (cleanText.includes("SK") || cleanText.includes("에너지")) brand = "SK에너지";
    else if (cleanText.includes("GS") || cleanText.includes("칼텍스")) brand = "GS칼텍스";
    else if (cleanText.includes("현대") || cleanText.includes("오일뱅크")) brand = "현대오일뱅크";
    
    document.getElementById('ocr-brand').value = brand;
}