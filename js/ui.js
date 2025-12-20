// --- START OF FILE js/ui.js ---
import { getTodayString, getCurrentTimeString } from './utils.js';
import { MEM_LOCATIONS, MEM_CENTERS, saveData, MEM_RECORDS, MEM_EXPENSE_ITEMS, REGION_GROUPS } from './data.js';

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
    editModeIndicator: document.getElementById('edit-mode-indicator'),
    editIdInput: document.getElementById('edit-id'),
    tripActions: document.getElementById('trip-actions'),
    editActions: document.getElementById('edit-actions')
};

export function populateCenterDatalist(list = null) {
    const target = list || MEM_CENTERS;
    els.centerDatalist.innerHTML = target.map(c => `<option value="${c}"></option>`).join('');
}

// [핵심 수정] 필터 버튼 클릭 시 datalist를 강제 고정
export function setupRegionButtons() {
    document.querySelectorAll('.region-btn').forEach(btn => {
        btn.onclick = (e) => {
            const isFrom = e.target.dataset.target === 'from';
            const input = isFrom ? els.fromCenterInput : els.toCenterInput;
            const region = e.target.dataset.region;
            const centerList = REGION_GROUPS[region] || [];
            
            // 1. datalist를 해당 권역으로만 교체
            populateCenterDatalist(centerList);
            
            // 2. 입력창 포커스 및 빈 값일 때 목록 강제 표시 유도
            input.focus();
            if(input.value) input.value = ''; // 필터 클릭 시 기존 값 지우기 (선택 편의)
            
            // 3. 시각적 활성화
            e.target.parentElement.querySelectorAll('.region-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
        };
    });
}

export function toggleUI() {
    const type = els.typeSelect.value;
    const isEdit = !els.editModeIndicator.classList.contains('hidden');
    
    document.getElementById('transport-details').classList.toggle('hidden', type !== '화물운송' && type !== '대기');
    document.getElementById('fuel-details').classList.toggle('hidden', type !== '주유소');
    document.getElementById('expense-details').classList.toggle('hidden', !['지출','수입'].includes(type));
    document.getElementById('cost-wrapper').classList.toggle('hidden', type === '화물운송' || type === '수입');
    document.getElementById('income-wrapper').classList.toggle('hidden', type !== '화물운송' && type !== '수입');
    
    if(isEdit) {
        els.tripActions.classList.add('hidden');
        els.editActions.classList.remove('hidden');
    } else {
        els.tripActions.classList.remove('hidden');
        els.editActions.classList.add('hidden');
    }
}

export function resetForm() {
    els.recordForm.reset();
    els.dateInput.value = getTodayString();
    els.timeInput.value = getCurrentTimeString();
    els.editIdInput.value = '';
    els.editModeIndicator.classList.add('hidden');
    populateCenterDatalist(); // 전체 리스트로 복구
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
    document.getElementById('income').value = r.income ? (r.income/10000) : '';
    document.getElementById('cost').value = r.cost ? (r.cost/10000) : '';
    els.editIdInput.value = id;
    els.editModeIndicator.classList.remove('hidden');
    toggleUI();
    window.scrollTo(0,0);
}

// [OCR] 전처리 및 분석
export async function processReceiptImage(file) {
    const statusDiv = document.getElementById('ocr-status');
    const resultContainer = document.getElementById('ocr-result-container');
    statusDiv.innerHTML = "⏳ 분석 중...";
    try {
        const { data: { text } } = await Tesseract.recognize(file, 'kor+eng');
        statusDiv.innerHTML = "✅ 완료";
        resultContainer.classList.remove('hidden');
        parseReceiptText(text);
    } catch (e) { statusDiv.innerHTML = "❌ 실패"; }
}

function parseReceiptText(text) {
    const extractNum = (s) => { const m = s.match(/[\d,.]+/g); return m ? parseFloat(m[m.length-1].replace(/,/g,'')) : 0; };
    const lines = text.split('\n');
    lines.forEach(l => {
        const clean = l.replace(/\s/g,'');
        if(clean.includes('주유금액')) document.getElementById('ocr-cost').value = extractNum(l);
        if(clean.includes('주유리터')) document.getElementById('ocr-liters').value = extractNum(l);
        if(clean.includes('주유단가')) document.getElementById('ocr-price').value = extractNum(l);
        if(clean.includes('보조금액')) document.getElementById('ocr-subsidy').value = extractNum(l);
    });
    document.getElementById('ocr-date').value = getTodayString();
    document.getElementById('ocr-time').value = getCurrentTimeString();
}