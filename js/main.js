import * as Utils from './utils.js';
import * as Data from './data.js';
import * as UI from './ui.js';
import * as Stats from './stats.js';

// 전역 윈도우 객체에 할당 (HTML 문자열 onclick에서 호출하기 위해)
window.viewDateDetails = function(date) { 
    document.getElementById('today-date-picker').value = date; 
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove("active")); 
    document.querySelector('.tab-btn[data-view="today"]').classList.add("active"); 
    document.querySelectorAll('.view-content').forEach(c => c.classList.remove('active')); 
    document.getElementById("today-view").classList.add("active"); 
    Stats.displayTodayRecords(date); 
};

window.toggleAllSummaryValues = function(gridElement) { 
    const items = gridElement.querySelectorAll('.summary-item'); 
    const isShowing = gridElement.classList.toggle('active'); 
    items.forEach(item => { 
        const valueEl = item.querySelector('.summary-value'); 
        if(isShowing) { item.classList.add('active'); valueEl.classList.remove('hidden'); } 
        else { item.classList.remove('active'); valueEl.classList.add('hidden'); } 
    }); 
};

function initialSetup() {
    Data.loadAllData();
    UI.populateCenterDatalist();
    
    // 연도/월 선택기 옵션 생성
    const y = new Date().getFullYear();
    const yrs = []; for(let i=0; i<5; i++) yrs.push(`<option value="${y-i}">${y-i}년</option>`);
    [document.getElementById('daily-year-select'), document.getElementById('weekly-year-select'), document.getElementById('monthly-year-select'), document.getElementById('print-year-select')].forEach(el => el.innerHTML = yrs.join(''));
    
    const ms = []; for(let i=1; i<=12; i++) ms.push(`<option value="${i.toString().padStart(2,'0')}">${i}월</option>`);
    [document.getElementById('daily-month-select'), document.getElementById('weekly-month-select'), document.getElementById('print-month-select')].forEach(el => { 
        el.innerHTML = ms.join(''); 
        el.value = (new Date().getMonth()+1).toString().padStart(2,'0'); 
    });

    document.getElementById('mileage-correction').value = localStorage.getItem('mileage_correction') || 0;
    document.getElementById('subsidy-limit').value = localStorage.getItem('fuel_subsidy_limit') || 0;
    
    // [중요] '오늘 기록' 조회용 날짜 초기값 세팅 (04시 기준 반영)
    const todayStr = Utils.getTodayString();
    const nowTime = Utils.getCurrentTimeString();
    // 04시 기준 오늘 날짜 계산 (utils의 getStatisticalDate 활용)
    const statToday = Utils.getStatisticalDate(todayStr, nowTime);
    
    document.getElementById('today-date-picker').value = statToday;

    UI.resetForm();
    updateAllDisplays();
}

function updateAllDisplays() {
    // 현재 date picker에 설정된 날짜 기준으로 조회
    const targetDate = document.getElementById('today-date-picker').value || Utils.getTodayString();
    Stats.displayTodayRecords(targetDate);
    Stats.displayDailyRecords();
    Stats.displayWeeklyRecords();
    Stats.displayMonthlyRecords();
}

// ============================================
// 날짜 이동 헬퍼 함수 (안전한 계산)
// ============================================
function moveDate(offset) {
    const picker = document.getElementById('today-date-picker');
    if (!picker.value) picker.value = Utils.getTodayString();

    // 문자열을 직접 분해하여 Date 객체 생성 (timezone 문제 방지)
    const [y, m, d] = picker.value.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d); // 월은 0부터 시작

    // 날짜 더하기/빼기
    dateObj.setDate(dateObj.getDate() + offset);

    // 다시 YYYY-MM-DD 형식으로 변환
    const newY = dateObj.getFullYear();
    const newM = String(dateObj.getMonth() + 1).padStart(2, '0');
    const newD = String(dateObj.getDate()).padStart(2, '0');
    const newDateStr = `${newY}-${newM}-${newD}`;

    // 값 적용 및 조회
    picker.value = newDateStr;
    Stats.displayTodayRecords(newDateStr);
}

// 이벤트 리스너 연결
UI.els.btnWaiting.addEventListener('click', () => {
    const formData = UI.getFormDataWithoutTime();
    Data.addRecord({ id: Date.now(), date: Utils.getTodayString(), time: Utils.getCurrentTimeString(), ...formData, type: '대기' });
    Utils.showToast('저장되었습니다.');
    UI.resetForm();
    updateAllDisplays();
});

UI.els.btnStartTrip.addEventListener('click', () => {
    const formData = UI.getFormDataWithoutTime();
    Data.addRecord({ id: Date.now(), date: Utils.getTodayString(), time: Utils.getCurrentTimeString(), ...formData });
    Utils.showToast('저장되었습니다.');
    UI.resetForm();
    updateAllDisplays();
});

UI.els.btnEndTrip.addEventListener('click', () => {
    Data.addRecord({ id: Date.now(), date: Utils.getTodayString(), time: Utils.getCurrentTimeString(), type: '운행종료', distance: 0, cost: 0, income: 0 });
    Utils.showToast('저장되었습니다.');
    UI.resetForm();
    updateAllDisplays();
});

UI.els.btnSaveGeneral.addEventListener('click', () => {
    const formData = UI.getFormDataWithoutTime();
    Data.addRecord({ id: Date.now(), date: UI.els.dateInput.value, time: UI.els.timeInput.value, ...formData });
    Utils.showToast('저장되었습니다.');
    UI.resetForm();
    updateAllDisplays();
});

UI.els.btnUpdateRecord.addEventListener('click', () => {
    const id = parseInt(UI.els.editIdInput.value);
    const index = Data.MEM_RECORDS.findIndex(r => r.id === id);
    if (index > -1) {
        const original = Data.MEM_RECORDS[index];
        const formData = UI.getFormDataWithoutTime();
        if (formData.type === '화물운송' && formData.from && formData.to) {
            const key = `${formData.from}-${formData.to}`;
            if(formData.distance > 0) Data.MEM_DISTANCES[key] = formData.distance;
            if(formData.income > 0) Data.MEM_FARES[key] = formData.income;
        }
        Data.MEM_RECORDS[index] = { ...original, ...formData, date: original.date, time: original.time };
        Data.saveData();
        Utils.showToast('수정 완료.');
        UI.resetForm();
        updateAllDisplays();
    }
});

UI.els.btnEditEndTrip.addEventListener('click', () => {
    const id = parseInt(UI.els.editIdInput.value);
    const index = Data.MEM_RECORDS.findIndex(r => r.id === id);
    const nowTime = Utils.getCurrentTimeString();
    const nowDate = Utils.getTodayString();

    if (index > -1 && Data.MEM_RECORDS[index].type === '운행종료') {
        Data.MEM_RECORDS[index].date = nowDate;
        Data.MEM_RECORDS[index].time = nowTime;
        Utils.showToast('종료 시간이 현재로 업데이트됨.');
    } else {
        Data.MEM_RECORDS.push({ id: Date.now(), date: nowDate, time: nowTime, type: '운행종료', distance: 0, cost: 0, income: 0 });
        Utils.showToast('운행 종료됨.');
    }
    Data.saveData();
    UI.resetForm();
    updateAllDisplays();
});

UI.els.btnDeleteRecord.addEventListener('click', () => {
    if(confirm('삭제하시겠습니까?')) {
        Data.removeRecord(parseInt(UI.els.editIdInput.value));
        UI.resetForm();
        updateAllDisplays();
    }
});

UI.els.btnCancelEdit.addEventListener('click', UI.resetForm);

// UI 상호작용
[UI.els.fromCenterInput, UI.els.toCenterInput].forEach(input => {
    input.addEventListener('input', () => {
        const from = UI.els.fromCenterInput.value.trim();
        const to = UI.els.toCenterInput.value.trim();
        if((UI.els.typeSelect.value === '화물운송' || UI.els.typeSelect.value === '대기') && from && to) {
            const key = `${from}-${to}`;
            if(Data.MEM_FARES[key]) UI.els.incomeInput.value = (Data.MEM_FARES[key]/10000).toFixed(2);
            if(Data.MEM_DISTANCES[key]) UI.els.manualDistanceInput.value = Data.MEM_DISTANCES[key];
            if(Data.MEM_COSTS[key]) UI.els.costInput.value = (Data.MEM_COSTS[key]/10000).toFixed(2);
        }
        UI.updateAddressDisplay();
        if(input.value.trim()) {
            const loc = Data.MEM_LOCATIONS[input.value.trim()];
            if(loc && loc.address) navigator.clipboard.writeText(loc.address).catch(()=>{});
        }
    });
});

UI.els.addressDisplay.addEventListener('click', (e) => {
    e.preventDefault(); e.stopPropagation();
    if(e.target.classList.contains('address-clickable')) {
        Utils.copyTextToClipboard(e.target.dataset.address, '주소 복사됨');
    }
});

UI.els.fuelUnitPriceInput.addEventListener('input', () => { const p=parseFloat(UI.els.fuelUnitPriceInput.value)||0, l=parseFloat(UI.els.fuelLitersInput.value)||0; if(p&&l) UI.els.costInput.value=(p*l/10000).toFixed(2); });
UI.els.fuelLitersInput.addEventListener('input', () => { const p=parseFloat(UI.els.fuelUnitPriceInput.value)||0, l=parseFloat(UI.els.fuelLitersInput.value)||0; if(p&&l) UI.els.costInput.value=(p*l/10000).toFixed(2); });
UI.els.typeSelect.addEventListener('change', UI.toggleUI);
document.getElementById('refresh-btn').addEventListener('click', () => { UI.resetForm(); location.reload(); });

// [수정됨] 날짜 변경 이벤트 (직접 선택 시)
document.getElementById('today-date-picker').addEventListener('change', () => Stats.displayTodayRecords(document.getElementById('today-date-picker').value));

// [수정됨] 화살표 버튼 이벤트 (안전한 moveDate 함수 사용)
document.getElementById('prev-day-btn').addEventListener('click', () => moveDate(-1));
document.getElementById('next-day-btn').addEventListener('click', () => moveDate(1));


// 주소 복사 이벤트 위임
document.querySelector('#today-records-table tbody').addEventListener('click', (e) => {
    const target = e.target.closest('.location-clickable');
    if(target) {
        e.stopPropagation();
        const center = target.getAttribute('data-center');
        if(center) {
            const loc = Data.MEM_LOCATIONS[center];
            if(loc && loc.address) Utils.copyTextToClipboard(loc.address, '주소 복사됨');
            else Utils.copyTextToClipboard(center, '이름 복사됨');
        }
    }
});

// 탭 전환 및 설정 페이지
document.querySelectorAll('.tab-btn').forEach(btn => { 
    btn.addEventListener("click", event => { 
        if(btn.parentElement.classList.contains('view-tabs')) { 
            event.preventDefault(); 
            document.querySelectorAll('.tab-btn').forEach(b => { if(b.parentElement.classList.contains('view-tabs')) b.classList.remove("active"); }); 
            btn.classList.add("active"); 
            document.querySelectorAll('.view-content').forEach(c => c.classList.remove('active')); 
            document.getElementById(btn.dataset.view + "-view").classList.add("active"); 
            updateAllDisplays(); 
        } 
    }) 
});

const mainPage = document.getElementById('main-page');
const settingsPage = document.getElementById('settings-page');
const goToSettingsBtn = document.getElementById('go-to-settings-btn');
const backToMainBtn = document.getElementById('back-to-main-btn');

goToSettingsBtn.addEventListener("click", () => { 
    mainPage.classList.add("hidden"); 
    settingsPage.classList.remove("hidden"); 
    goToSettingsBtn.classList.add("hidden"); 
    backToMainBtn.classList.remove("hidden"); 
    Stats.displayCumulativeData(); 
    Stats.displayCurrentMonthData(); 
});
backToMainBtn.addEventListener("click", () => { 
    mainPage.classList.remove("hidden"); 
    settingsPage.classList.add("hidden"); 
    goToSettingsBtn.classList.remove("hidden"); 
    backToMainBtn.classList.add("hidden"); 
    updateAllDisplays(); 
});

// 관리 메뉴 토글
[document.getElementById('toggle-center-management'), document.getElementById('toggle-batch-apply'), 
 document.getElementById('toggle-subsidy-management'), document.getElementById('toggle-mileage-management'), 
 document.getElementById('toggle-data-management'), document.getElementById('toggle-print-management')]
.forEach(header => { 
    header.addEventListener("click", () => { 
        const body = header.nextElementSibling; 
        header.classList.toggle("active"); 
        body.classList.toggle("hidden"); 
        if (header.id === 'toggle-subsidy-management' && !body.classList.contains('hidden')) { 
            Stats.displaySubsidyRecords(false); 
        } 
        if (header.id === 'toggle-center-management' && !body.classList.contains('hidden')) {
             UI.displayCenterList();
        }
    }); 
});

// 센터 관리
document.getElementById('center-search-input').addEventListener('input', () => UI.displayCenterList(document.getElementById('center-search-input').value));
document.getElementById('add-center-btn').addEventListener('click', () => { 
    const n = document.getElementById('new-center-name').value.trim(); 
    if(n) { 
        UI.addCenter(n, document.getElementById('new-center-address').value.trim(), document.getElementById('new-center-memo').value.trim()); 
        document.getElementById('new-center-name').value=''; 
        document.getElementById('new-center-address').value=''; 
        document.getElementById('new-center-memo').value=''; 
        UI.displayCenterList(document.getElementById('center-search-input').value); 
    } 
});

// 일괄 적용
document.getElementById('batch-apply-btn').addEventListener("click", () => { 
    const from = document.getElementById('batch-from-center').value.trim(); 
    const to = document.getElementById('batch-to-center').value.trim(); 
    const income = parseFloat(document.getElementById('batch-income').value) || 0; 
    if (!from || !to || income <= 0) { alert("값을 확인해주세요."); return; } 
    if (confirm(`${from}->${to} 구간 미정산 기록을 ${income}만원으로 일괄 적용할까요?`)) { 
        let count = 0; 
        const newRecords = Data.MEM_RECORDS.map(r => { 
            if (r.type === '화물운송' && r.from === from && r.to === to && r.income === 0) { count++; return { ...r, income: income * 10000 }; } 
            return r; 
        }); 
        Data.setRecords(newRecords);
        Data.saveData(); 
        document.getElementById('batch-status').textContent = `${count}건 적용됨`; 
        setTimeout(() => document.getElementById('batch-status').textContent = "", 3000); 
    } 
});

// 기타 설정 저장
document.getElementById('subsidy-save-btn').addEventListener('click', () => { localStorage.setItem('fuel_subsidy_limit', document.getElementById('subsidy-limit').value); Utils.showToast('저장됨'); });
document.getElementById('mileage-correction-save-btn').addEventListener('click', () => { localStorage.setItem('mileage_correction', document.getElementById('mileage-correction').value); Utils.showToast('저장됨'); Stats.displayCumulativeData(); });

// 데이터 관리
document.getElementById('export-json-btn').addEventListener('click', () => { 
    const data = { records: Data.MEM_RECORDS, centers: Data.MEM_CENTERS, locations: Data.MEM_LOCATIONS, fares: Data.MEM_FARES, distances: Data.MEM_DISTANCES, costs: Data.MEM_COSTS, subsidy: localStorage.getItem('fuel_subsidy_limit'), correction: localStorage.getItem('mileage_correction') }; 
    const b = new Blob([JSON.stringify(data,null,2)],{type:"application/json"}); 
    const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download=`backup_${Utils.getTodayString()}.json`; 
    document.body.appendChild(a); a.click(); document.body.removeChild(a); 
});
document.getElementById('import-json-btn').addEventListener('click', () => document.getElementById('import-file-input').click());
document.getElementById('import-file-input').addEventListener('change', (e) => { 
    if(!confirm('덮어쓰시겠습니까?')) return; 
    const r = new FileReader(); 
    r.onload = (evt) => { 
        const d = JSON.parse(evt.target.result); 
        if(d.records) localStorage.setItem('records', JSON.stringify(d.records)); 
        if(d.centers) localStorage.setItem('logistics_centers', JSON.stringify(d.centers)); 
        if(d.locations) localStorage.setItem('saved_locations', JSON.stringify(d.locations)); 
        if(d.fares) localStorage.setItem('saved_fares', JSON.stringify(d.fares)); 
        if(d.distances) localStorage.setItem('saved_distances', JSON.stringify(d.distances)); 
        if(d.costs) localStorage.setItem('saved_costs', JSON.stringify(d.costs)); 
        if(d.subsidy) localStorage.setItem('fuel_subsidy_limit', d.subsidy); 
        if(d.correction) localStorage.setItem('mileage_correction', d.correction); 
        alert('복원완료'); location.reload(); 
    }; 
    r.readAsText(e.target.files[0]); 
});
document.getElementById('clear-btn').addEventListener('click', () => { if(confirm('전체삭제?')) { localStorage.clear(); location.reload(); }});

// 프린트 버튼들
const getPrintEls = () => ({ y: document.getElementById('print-year-select').value, m: document.getElementById('print-month-select').value });
document.getElementById('print-first-half-btn').addEventListener('click', () => { const p = getPrintEls(); Stats.generatePrintView(p.y, p.m, 'first', false) });
document.getElementById('print-second-half-btn').addEventListener('click', () => { const p = getPrintEls(); Stats.generatePrintView(p.y, p.m, 'second', false) });
document.getElementById('print-full-month-btn').addEventListener('click', () => { const p = getPrintEls(); Stats.generatePrintView(p.y, p.m, 'full', false) });
document.getElementById('print-first-half-detail-btn').addEventListener('click', () => { const p = getPrintEls(); Stats.generatePrintView(p.y, p.m, 'first', true) });
document.getElementById('print-second-half-detail-btn').addEventListener('click', () => { const p = getPrintEls(); Stats.generatePrintView(p.y, p.m, 'second', true) });
document.getElementById('print-full-month-detail-btn').addEventListener('click', () => { const p = getPrintEls(); Stats.generatePrintView(p.y, p.m, 'full', true) });

document.getElementById('mileage-summary-controls').querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.target.parentElement.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        Stats.renderMileageSummary(e.target.dataset.period);
    });
});

document.addEventListener("DOMContentLoaded", initialSetup);