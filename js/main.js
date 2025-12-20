// --- js/main.js ---
import * as Utils from './utils.js';
import * as Data from './data.js';
import * as UI from './ui.js';
import * as Stats from './stats.js';

// 전역 함수 설정
window.viewDateDetails = function(date) { 
    const picker = document.getElementById('today-date-picker');
    if(!picker) {
        // 설정페이지에서 호출된 경우 기록 페이지로 이동하며 날짜 전달 (필요시 구현)
        location.href = `index.html?date=${date}`;
        return;
    }
    picker.value = date; 
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove("active")); 
    const todayTab = document.querySelector('.tab-btn[data-view="today"]');
    if(todayTab) todayTab.classList.add("active");
    document.querySelectorAll('.view-content').forEach(c => c.classList.remove('active')); 
    const todayView = document.getElementById("today-view");
    if(todayView) todayView.classList.add("active");
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
    UI.populateExpenseDatalist();
    
    // 1. 공통 초기화 (년/월 선택기)
    const initSelectors = (ids) => {
        const y = new Date().getFullYear();
        const yrs = Array.from({length:5}, (_,i)=> `<option value="${y-i}">${y-i}년</option>`).join('');
        const ms = Array.from({length:12}, (_,i)=> `<option value="${(i+1).toString().padStart(2,'0')}">${i+1}월</option>`).join('');
        
        ids.forEach(id => {
            const el = document.getElementById(id);
            if(el) {
                el.innerHTML = id.includes('year') ? yrs : ms;
                if(id.includes('month')) el.value = (new Date().getMonth()+1).toString().padStart(2,'0');
            }
        });
    };
    initSelectors(['daily-year-select', 'weekly-year-select', 'monthly-year-select', 'print-year-select', 'daily-month-select', 'weekly-month-select', 'print-month-select']);

    // 2. 설정값 로드 (설정 페이지 전용)
    const mc = document.getElementById('mileage-correction');
    if(mc) mc.value = localStorage.getItem('mileage_correction') || 0;
    const sl = document.getElementById('subsidy-limit');
    if(sl) sl.value = localStorage.getItem('fuel_subsidy_limit') || 0;
    
    // 3. 오늘 날짜 설정
    const picker = document.getElementById('today-date-picker');
    if(picker) {
        picker.value = Utils.getStatisticalDate(Utils.getTodayString(), Utils.getCurrentTimeString());
        updateAllDisplays();
    }

    // 4. 페이지별 특화 기능 실행
    if (document.getElementById('settings-page')) {
        Stats.displayCumulativeData();
        Stats.displayCurrentMonthData();
    }

    UI.resetForm();
    attachEventListeners();
}

function attachEventListeners() {
    // 옵셔널 체이닝(?.)을 사용하여 요소가 있을 때만 리스너 등록
    UI.els.btnTripCancel?.addEventListener('click', () => {
        const formData = UI.getFormDataWithoutTime();
        Data.addRecord({ id: Date.now(), date: Utils.getTodayString(), time: Utils.getCurrentTimeString(), ...formData, type: '운행취소' });
        Utils.showToast('저장되었습니다.');
        UI.resetForm();
        updateAllDisplays();
    });

    UI.els.btnStartTrip?.addEventListener('click', () => {
        const formData = UI.getFormDataWithoutTime();
        if (formData.type === '화물운송' && formData.distance <= 0) { alert('운행거리를 입력해주세요.'); return; }
        Data.addRecord({ id: Date.now(), date: Utils.getTodayString(), time: Utils.getCurrentTimeString(), ...formData });
        Utils.showToast('저장되었습니다.');
        UI.resetForm();
        updateAllDisplays();
    });

    UI.els.btnSaveGeneral?.addEventListener('click', () => {
        const formData = UI.getFormDataWithoutTime();
        Data.addRecord({ id: Date.now(), date: UI.els.dateInput.value, time: UI.els.timeInput.value, ...formData });
        Utils.showToast('저장되었습니다.');
        UI.resetForm();
        updateAllDisplays();
    });

    // 설정 페이지용 이벤트
    document.getElementById('export-json-btn')?.addEventListener('click', () => {
        const data = { records: Data.MEM_RECORDS, centers: Data.MEM_CENTERS, locations: Data.MEM_LOCATIONS };
        const b = new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
        const a = document.createElement('a'); 
        a.href = URL.createObjectURL(b); a.download=`backup.json`; a.click();
    });

    // OCR 관련 안전 장치
    const ocrInput = document.getElementById('ocr-input');
    ocrInput?.addEventListener('change', (e) => {
        if (e.target.files.length > 0) UI.processReceiptImage(e.target.files[0]);
    });
    
    // ... 나머지 모든 addEventListener 앞에 '?' 를 붙이거나 if문으로 감싸기
}

function updateAllDisplays() {
    const picker = document.getElementById('today-date-picker');
    if (!picker) return;
    const targetDate = picker.value;
    Stats.displayTodayRecords(targetDate);
    Stats.displayDailyRecords();
    Stats.displayWeeklyRecords();
    Stats.displayMonthlyRecords();
}

document.addEventListener("DOMContentLoaded", initialSetup);