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

// [OCR] 이미지 처리 (전처리 + 인식)
export async function processReceiptImage(file) {
    const statusDiv = document.getElementById('ocr-status');
    const resultContainer = document.getElementById('ocr-result-container');
    
    if (!file) return;

    // 입력 필드 초기화
    document.getElementById('ocr-date').value = '';
    document.getElementById('ocr-time').value = '';
    document.getElementById('ocr-cost').value = '';
    document.getElementById('ocr-liters').value = '';
    document.getElementById('ocr-price').value = '';
    document.getElementById('ocr-brand').value = '';

    resultContainer.classList.add('hidden');
    statusDiv.innerHTML = "⏳ 이미지 전처리 및 분석 중... (시간이 더 소요됩니다)";
    statusDiv.style.color = "#007bff";

    try {
        // 1. 이미지 전처리 (흑백 변환 + 선명화)
        const processedImage = await preprocessImage(file);

        // 2. Tesseract 실행
        const { data: { text } } = await Tesseract.recognize(
            processedImage,
            'kor+eng', 
            { 
                logger: m => {
                    if(m.status === 'recognizing text') {
                        statusDiv.textContent = `⏳ 글자 인식 중... ${(m.progress * 100).toFixed(0)}%`;
                    }
                } 
            }
        );

        statusDiv.innerHTML = "✅ 분석 완료! 내용을 수정/확인해주세요.";
        statusDiv.style.color = "green";
        resultContainer.classList.remove('hidden');

        console.log("Raw OCR Text:", text); // 디버깅용 로그
        parseReceiptText(text);

    } catch (error) {
        console.error(error);
        statusDiv.innerHTML = "❌ 분석 실패. 이미지가 너무 흐릿합니다.";
        statusDiv.style.color = "red";
    }
}

// [OCR] 이미지 전처리 함수 (Canvas 사용: 흑백변환, 대비증가)
function preprocessImage(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // 이미지 크기 조정 (너무 크면 느리고, 너무 작으면 인식 불가)
                const maxDim = 1500;
                let width = img.width;
                let height = img.height;
                
                if (width > height && width > maxDim) {
                    height *= maxDim / width;
                    width = maxDim;
                } else if (height > width && height > maxDim) {
                    width *= maxDim / height;
                    height = maxDim;
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                // 픽셀 데이터 조작 (이진화)
                const imageData = ctx.getImageData(0, 0, width, height);
                const data = imageData.data;
                
                // 임계값 (Threshold)
                const threshold = 128; 

                for (let i = 0; i < data.length; i += 4) {
                    // 그레이스케일 변환
                    const gray = data[i] * 0.299 + data[i+1] * 0.587 + data[i+2] * 0.114;
                    
                    // 이진화 (검은색 or 흰색)
                    const value = gray < threshold ? 0 : 255;
                    
                    data[i] = data[i+1] = data[i+2] = value;
                }
                
                ctx.putImageData(imageData, 0, 0);
                
                // 처리된 이미지를 Blob URL로 반환
                canvas.toBlob((blob) => {
                    resolve(URL.createObjectURL(blob));
                });
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });
}

// [OCR] 텍스트 파싱 로직 강화
function parseReceiptText(text) {
    // 공백 제거 및 특수문자 노이즈 정리
    const lines = text.split('\n');
    let cleanText = text.replace(/\s+/g, ' ');

    // 1. 날짜 추출 (오타 가능성 고려)
    const dateMatch = text.match(/(\d{2,4})[-.,/년\s]+(\d{1,2})[-.,/월\s]+(\d{1,2})/);
    if (dateMatch) {
        let y = dateMatch[1];
        const m = dateMatch[2].padStart(2, '0');
        const d = dateMatch[3].padStart(2, '0');
        if(y.length === 2) y = "20" + y; // 23년 -> 2023년
        document.getElementById('ocr-date').value = `${y}-${m}-${d}`;
    } else {
        // 날짜 못 찾으면 오늘 날짜
        const today = new Date();
        const y = today.getFullYear();
        const m = String(today.getMonth() + 1).padStart(2, '0');
        const d = String(today.getDate()).padStart(2, '0');
        document.getElementById('ocr-date').value = `${y}-${m}-${d}`;
    }

    // 2. 시간 추출
    const timeMatch = text.match(/(\d{1,2})\s*:\s*(\d{2})/);
    if (timeMatch) {
        const hh = timeMatch[1].padStart(2, '0');
        const mm = timeMatch[2];
        document.getElementById('ocr-time').value = `${hh}:${mm}`;
    } else {
        document.getElementById('ocr-time').value = "12:00";
    }

    // 3. 금액 추출 (가장 중요한 부분)
    // 숫자 패턴을 찾아서 5,000 ~ 1,000,000 사이의 가장 큰 값을 선택 (합계일 확률 높음)
    const moneyPattern = /([1-9][0-9\s,.]*)원?/g; 
    let maxMoney = 0;
    
    let match;
    while ((match = moneyPattern.exec(cleanText)) !== null) {
        const rawNum = match[1].replace(/[^\d]/g, '');
        const val = parseInt(rawNum);
        
        if (val > 5000 && val < 1000000) {
            if (val > maxMoney) maxMoney = val;
        }
    }
    if (maxMoney > 0) document.getElementById('ocr-cost').value = maxMoney;

    // 4. 리터(L) 추출
    const literMatch = text.match(/(\d{1,3}[,.\s]?\d{1,3})\s*(L|ℓ|리터)/i);
    if (literMatch) {
        const rawLit = literMatch[1].replace(/,/g, '.').replace(/\s/g, '');
        const lit = parseFloat(rawLit);
        if (!isNaN(lit)) document.getElementById('ocr-liters').value = lit;
    }

    // 5. 단가 추출 (1000~3000원 사이)
    const priceMatch = text.match(/(\d{1}[,.\s]?\d{3})\s*원/);
    if (priceMatch) {
        const rawPrice = priceMatch[1].replace(/[^\d]/g, '');
        const price = parseInt(rawPrice);
        if (price >= 1000 && price <= 3000) {
            document.getElementById('ocr-price').value = price;
        }
    }

    // 6. 브랜드 인식
    let brand = "기타";
    if (/S-?OIL|에쓰오일|에스오일/i.test(cleanText)) brand = "S-OIL";
    else if (/SK|에너지/i.test(cleanText)) brand = "SK에너지";
    else if (/GS|칼텍스/i.test(cleanText)) brand = "GS칼텍스";
    else if (/현대|오일뱅크/i.test(cleanText)) brand = "현대오일뱅크";
    
    document.getElementById('ocr-brand').value = brand;
}