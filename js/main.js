import * as Utils from './utils.js';
import * as Data from './data.js';
import * as UI from './ui.js';
import * as Stats from './stats.js';

// 전역 윈도우 객체에 할당 (HTML onclick에서 호출)
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

// 초기화 함수
function initialSetup() {
    Data.loadAllData();
    UI.populateCenterDatalist();
    
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
    
    // 초기 화면 날짜 설정 (04시 기준 오늘)
    const todayStr = Utils.getTodayString();
    const nowTime = Utils.getCurrentTimeString();
    const statToday = Utils.getStatisticalDate(todayStr, nowTime);
    
    document.getElementById('today-date-picker').value = statToday;

    UI.resetForm();
    updateAllDisplays();
}

// 전체 화면 갱신 헬퍼
function updateAllDisplays() {
    // 현재 선택된 날짜 기준으로 조회
    const picker = document.getElementById('today-date-picker');
    const targetDate = picker.value || Utils.getStatisticalDate(Utils.getTodayString(), Utils.getCurrentTimeString());
    
    Stats.displayTodayRecords(targetDate);
    Stats.displayDailyRecords();
    Stats.displayWeeklyRecords();
    Stats.displayMonthlyRecords();
}

// 날짜 이동 헬퍼
function moveDate(offset) {
    const picker = document.getElementById('today-date-picker');
    if (!picker.value) picker.value = Utils.getTodayString();

    const parts = picker.value.split('-').map(Number);
    const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
    dateObj.setDate(dateObj.getDate() + offset);

    const newY = dateObj.getFullYear();
    const newM = String(dateObj.getMonth() + 1).padStart(2, '0');
    const newD = String(dateObj.getDate()).padStart(2, '0');
    const newDateStr = `${newY}-${newM}-${newD}`;

    picker.value = newDateStr;
    Stats.displayTodayRecords(newDateStr);
}

// ============================================
// 이벤트 리스너 연결
// ============================================

// 1. 운행 대기
UI.els.btnWaiting.addEventListener('click', () => {
    const formData = UI.getFormDataWithoutTime();
    Data.addRecord({ id: Date.now(), date: Utils.getTodayString(), time: Utils.getCurrentTimeString(), ...formData, type: '대기' });
    Utils.showToast('저장되었습니다.');
    UI.resetForm();
    
    // 대기 기록은 현재 날짜에 저장되므로 화면도 현재로 이동
    const nowStatDate = Utils.getStatisticalDate(Utils.getTodayString(), Utils.getCurrentTimeString());
    document.getElementById('today-date-picker').value = nowStatDate;
    updateAllDisplays();
});

// 2. 운행 시작
UI.els.btnStartTrip.addEventListener('click', () => {
    const formData = UI.getFormDataWithoutTime();
    Data.addRecord({ id: Date.now(), date: Utils.getTodayString(), time: Utils.getCurrentTimeString(), ...formData });
    Utils.showToast('저장되었습니다.');
    UI.resetForm();
    
    const nowStatDate = Utils.getStatisticalDate(Utils.getTodayString(), Utils.getCurrentTimeString());
    document.getElementById('today-date-picker').value = nowStatDate;
    updateAllDisplays();
});

// 3. 운행 종료 (메인 화면)
UI.els.btnEndTrip.addEventListener('click', () => {
    Data.addRecord({ id: Date.now(), date: Utils.getTodayString(), time: Utils.getCurrentTimeString(), type: '운행종료', distance: 0, cost: 0, income: 0 });
    Utils.showToast('운행 종료되었습니다.');
    UI.resetForm();
    
    const nowStatDate = Utils.getStatisticalDate(Utils.getTodayString(), Utils.getCurrentTimeString());
    document.getElementById('today-date-picker').value = nowStatDate;
    updateAllDisplays();
});

// 4. 일반 저장 (과거 기록 입력 등)
UI.els.btnSaveGeneral.addEventListener('click', () => {
    const formData = UI.getFormDataWithoutTime();
    // 사용자가 입력한 날짜/시간 그대로 저장
    Data.addRecord({ id: Date.now(), date: UI.els.dateInput.value, time: UI.els.timeInput.value, ...formData });
    Utils.showToast('저장되었습니다.');
    
    // 저장한 날짜의 통계 화면으로 이동
    const statDate = Utils.getStatisticalDate(UI.els.dateInput.value, UI.els.timeInput.value);
    document.getElementById('today-date-picker').value = statDate;
    
    UI.resetForm();
    updateAllDisplays();
});

// 5. 수정 완료
UI.els.btnUpdateRecord.addEventListener('click', () => {
    const id = parseInt(UI.els.editIdInput.value);
    const index = Data.MEM_RECORDS.findIndex(r => r.id === id);
    if (index > -1) {
        const original = Data.MEM_RECORDS[index];
        const formData = UI.getFormDataWithoutTime();
        
        // 화물운송일 경우 자동완성 데이터 업데이트
        if (formData.type === '화물운송' && formData.from && formData.to) {
            const key = `${formData.from}-${formData.to}`;
            if(formData.distance > 0) Data.MEM_DISTANCES[key] = formData.distance;
            if(formData.income > 0) Data.MEM_FARES[key] = formData.income;
        }
        
        // 날짜와 시간은 원본 유지 (내용만 수정)
        Data.MEM_RECORDS[index] = { ...original, ...formData, date: original.date, time: original.time };
        Data.saveData();
        Utils.showToast('수정 완료.');
        
        // 수정된 기록이 있는 날짜 화면 유지
        const statDate = Utils.getStatisticalDate(original.date, original.time);
        document.getElementById('today-date-picker').value = statDate;
        
        UI.resetForm();
        updateAllDisplays();
    }
});

// 6. [중요] 현재 시간으로 운행 종료 (수정 모드에서)
UI.els.btnEditEndTrip.addEventListener('click', () => {
    const nowTime = Utils.getCurrentTimeString();
    const nowDate = Utils.getTodayString();
    
    // 수정 중이던 기록의 ID 확인
    const id = parseInt(UI.els.editIdInput.value);
    const index = Data.MEM_RECORDS.findIndex(r => r.id === id);

    if (index > -1 && Data.MEM_RECORDS[index].type === '운행종료') {
        // 이미 '운행종료' 기록을 클릭해서 들어온 경우 -> 시간만 업데이트
        Data.MEM_RECORDS[index].date = nowDate;
        Data.MEM_RECORDS[index].time = nowTime;
        Utils.showToast('종료 시간이 현재로 업데이트됨.');
    } else {
        // '대기'나 다른 기록을 보다가 종료를 누른 경우 -> 새로운 종료 기록 추가
        Data.addRecord({ 
            id: Date.now(), 
            date: nowDate, 
            time: nowTime, 
            type: '운행종료', 
            distance: 0, 
            cost: 0, 
            income: 0 
        });
        Utils.showToast('운행 종료되었습니다.');
    }
    
    // 데이터 저장
    Data.saveData();
    // 폼 초기화 (수정모드 해제)
    UI.resetForm();

    // [핵심] 종료 기록이 생성된 "현재 시점"의 통계 날짜로 화면 이동
    const statDate = Utils.getStatisticalDate(nowDate, nowTime);
    document.getElementById('today-date-picker').value = statDate;
    
    // 화면 갱신
    updateAllDisplays();
});

// 7. 삭제
UI.els.btnDeleteRecord.addEventListener('click', () => {
    if(confirm('삭제하시겠습니까?')) {
        const id = parseInt(UI.els.editIdInput.value);
        // 삭제 후에도 현재 보고 있던 날짜 유지하기 위해 날짜 계산
        const target = Data.MEM_RECORDS.find(r => r.id === id);
        let stayDate = document.getElementById('today-date-picker').value;
        if(target) {
            stayDate = Utils.getStatisticalDate(target.date, target.time);
        }

        Data.removeRecord(id);
        UI.resetForm();
        
        document.getElementById('today-date-picker').value = stayDate;
        updateAllDisplays();
    }
});

UI.els.btnCancelEdit.addEventListener('click', UI.resetForm);

// ============================================
// 기타 UI 이벤트
// ============================================

// 상하차지 입력 시 자동완성 및 주소표시
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
    });
});

// 주소 복사
UI.els.addressDisplay.addEventListener('click', (e) => {
    e.preventDefault(); e.stopPropagation();
    if(e.target.classList.contains('address-clickable')) {
        Utils.copyTextToClipboard(e.target.dataset.address, '주소 복사됨');
    }
});

// 주유비 계산
UI.els.fuelUnitPriceInput.addEventListener('input', () => { const p=parseFloat(UI.els.fuelUnitPriceInput.value)||0, l=parseFloat(UI.els.fuelLitersInput.value)||0; if(p&&l) UI.els.costInput.value=(p*l/10000).toFixed(2); });
UI.els.fuelLitersInput.addEventListener('input', () => { const p=parseFloat(UI.els.fuelUnitPriceInput.value)||0, l=parseFloat(UI.els.fuelLitersInput.value)||0; if(p&&l) UI.els.costInput.value=(p*l/10000).toFixed(2); });

// 기록 종류 변경 시 UI 토글
UI.els.typeSelect.addEventListener('change', UI.toggleUI);

// 새로고침 버튼
document.getElementById('refresh-btn').addEventListener('click', () => { UI.resetForm(); location.reload(); });

// 날짜 선택 및 이동
document.getElementById('today-date-picker').addEventListener('change', () => Stats.displayTodayRecords(document.getElementById('today-date-picker').value));
document.getElementById('prev-day-btn').addEventListener('click', () => moveDate(-1));
document.getElementById('next-day-btn').addEventListener('click', () => moveDate(1));

// 리스트 클릭 위임 (주소 복사 등)
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

// 탭 버튼 처리
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

// 설정 페이지 전환
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

// 아코디언 메뉴 토글
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

// 관리 기능 연결
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

document.getElementById('subsidy-save-btn').addEventListener('click', () => { localStorage.setItem('fuel_subsidy_limit', document.getElementById('subsidy-limit').value); Utils.showToast('저장됨'); });
document.getElementById('mileage-correction-save-btn').addEventListener('click', () => { localStorage.setItem('mileage_correction', document.getElementById('mileage-correction').value); Utils.showToast('저장됨'); Stats.displayCumulativeData(); });

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