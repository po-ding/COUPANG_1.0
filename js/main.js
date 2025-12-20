import * as Utils from './utils.js';
import * as Data from './data.js';
import * as UI from './ui.js';
import * as Stats from './stats.js';

function initialSetup() {
    Data.loadAllData();
    UI.populateCenterDatalist();
    UI.populateExpenseDatalist();
    UI.renderQuickShortcuts(); // 퀵 버튼 실행

    const y = new Date().getFullYear();
    const yrs = []; for(let i=0; i<5; i++) yrs.push(`<option value="${y-i}">${y-i}년</option>`);
    [document.getElementById('daily-year-select'), document.getElementById('weekly-year-select'), document.getElementById('monthly-year-select'), document.getElementById('print-year-select')].forEach(el => el.innerHTML = yrs.join(''));
    const ms = []; for(let i=1; i<=12; i++) ms.push(`<option value="${i.toString().padStart(2,'0')}">${i}월</option>`);
    [document.getElementById('daily-month-select'), document.getElementById('weekly-month-select'), document.getElementById('print-month-select')].forEach(el => { el.innerHTML = ms.join(''); el.value = (new Date().getMonth()+1).toString().padStart(2,'0'); });

    document.getElementById('today-date-picker').value = Utils.getStatisticalDate(Utils.getTodayString(), Utils.getCurrentTimeString());
    UI.resetForm();
    updateAllDisplays();

    // 원본 이벤트 리스너 복구
    document.getElementById('go-to-settings-btn').onclick = () => {
        document.getElementById('main-page').classList.add('hidden');
        document.getElementById('settings-page').classList.remove('hidden');
        document.getElementById('go-to-settings-btn').classList.add('hidden');
        document.getElementById('back-to-main-btn').classList.remove('hidden');
        Stats.displayCumulativeData(); Stats.displayCurrentMonthData();
    };
    document.getElementById('back-to-main-btn').onclick = () => {
        document.getElementById('main-page').classList.remove('hidden');
        document.getElementById('settings-page').classList.add('hidden');
        document.getElementById('go-to-settings-btn').classList.remove('hidden');
        document.getElementById('back-to-main-btn').classList.add('hidden');
        updateAllDisplays();
    };
    // 설정창 아코디언 메뉴
    [document.getElementById('toggle-center-management'), document.getElementById('toggle-batch-apply'), document.getElementById('toggle-subsidy-management'), document.getElementById('toggle-mileage-management'), document.getElementById('toggle-data-management'), document.getElementById('toggle-print-management')]
    .forEach(header => { header.onclick = () => { header.classList.toggle("active"); header.nextElementSibling.classList.toggle("hidden"); if(header.id === 'toggle-center-management' && !header.nextElementSibling.classList.contains('hidden')) UI.displayCenterList(); }; });

    // 데이터 복원
    document.getElementById('import-json-btn').onclick = () => document.getElementById('import-file-input').click();
    document.getElementById('import-file-input').onchange = (e) => {
        if(!confirm('복원?')) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            const d = JSON.parse(evt.target.result);
            if(d.records) localStorage.setItem('records', JSON.stringify(d.records));
            if(d.centers) localStorage.setItem('logistics_centers', JSON.stringify(d.centers));
            if(d.locations) localStorage.setItem('saved_locations', JSON.stringify(d.locations));
            alert('복원완료'); location.reload();
        };
        reader.readAsText(e.target.files[0]);
    };
    
    // 일반 기록 저장
    UI.els.btnSaveGeneral.onclick = () => {
        const fd = UI.getFormDataWithoutTime();
        Data.addRecord({ id: Date.now(), date: UI.els.dateInput.value, time: UI.els.timeInput.value, ...fd });
        Utils.showToast('저장됨'); UI.resetForm(); updateAllDisplays();
    };
    
    // 주유 영수증 OCR (원본 유지)
    document.getElementById('ocr-input')?.addEventListener('change', (e) => { if(e.target.files[0]) UI.processReceiptImage(e.target.files[0]); });
}

function updateAllDisplays() {
    const date = document.getElementById('today-date-picker').value || Utils.getTodayString();
    Stats.displayTodayRecords(date); Stats.displayDailyRecords(); Stats.displayWeeklyRecords(); Stats.displayMonthlyRecords();
    UI.renderQuickShortcuts();
}

document.getElementById('refresh-btn').onclick = () => location.reload();
document.getElementById('type').onchange = UI.toggleUI;
document.addEventListener("DOMContentLoaded", initialSetup);