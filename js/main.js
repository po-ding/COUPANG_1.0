import * as Utils from './utils.js';
import * as Data from './data.js';
import * as UI from './ui.js';
import * as Stats from './stats.js';

// 전역 윈도우 객체 (원본 유지)
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
    UI.populateExpenseDatalist();
    UI.renderQuickShortcuts(); // [추가]

    // 날짜 선택기 초기화 (원본 유지)
    const y = new Date().getFullYear();
    const yrs = []; for(let i=0; i<5; i++) yrs.push(`<option value="${y-i}">${y-i}년</option>`);
    [document.getElementById('daily-year-select'), document.getElementById('weekly-year-select'), document.getElementById('monthly-year-select'), document.getElementById('print-year-select')].forEach(el => el.innerHTML = yrs.join(''));
    const ms = []; for(let i=1; i<=12; i++) ms.push(`<option value="${i.toString().padStart(2,'0')}">${i}월</option>`);
    [document.getElementById('daily-month-select'), document.getElementById('weekly-month-select'), document.getElementById('print-month-select')].forEach(el => { 
        el.innerHTML = ms.join(''); el.value = (new Date().getMonth()+1).toString().padStart(2,'0'); 
    });

    document.getElementById('mileage-correction').value = localStorage.getItem('mileage_correction') || 0;
    document.getElementById('subsidy-limit').value = localStorage.getItem('fuel_subsidy_limit') || 0;
    document.getElementById('today-date-picker').value = Utils.getStatisticalDate(Utils.getTodayString(), Utils.getCurrentTimeString());

    UI.resetForm();
    updateAllDisplays();

    // OCR 이벤트 (원본 유지)
    const ocrInput = document.getElementById('ocr-input');
    if (ocrInput) ocrInput.addEventListener('change', (e) => { if (e.target.files.length > 0) UI.processReceiptImage(e.target.files[0]); });

    // [이벤트 리스너 모음 - 원본 기능들]
    UI.els.btnTripCancel.onclick = () => { Data.addRecord({ id: Date.now(), date: Utils.getTodayString(), time: Utils.getCurrentTimeString(), ...UI.getFormDataWithoutTime(), type: '운행취소' }); UI.resetForm(); updateAllDisplays(); };
    UI.els.btnStartTrip.onclick = () => { Data.addRecord({ id: Date.now(), date: Utils.getTodayString(), time: Utils.getCurrentTimeString(), ...UI.getFormDataWithoutTime() }); UI.resetForm(); updateAllDisplays(); };
    UI.els.btnEndTrip.onclick = () => { Data.addRecord({ id: Date.now(), date: Utils.getTodayString(), time: Utils.getCurrentTimeString(), type: '운행종료' }); UI.resetForm(); updateAllDisplays(); };
    UI.els.btnSaveGeneral.onclick = () => { Data.addRecord({ id: Date.now(), date: UI.els.dateInput.value, time: UI.els.timeInput.value, ...UI.getFormDataWithoutTime() }); UI.resetForm(); updateAllDisplays(); };
    UI.els.btnUpdateRecord.onclick = () => { const id = parseInt(UI.els.editIdInput.value); const idx = Data.MEM_RECORDS.findIndex(r => r.id === id); if (idx > -1) { Data.MEM_RECORDS[idx] = { ...Data.MEM_RECORDS[idx], ...UI.getFormDataWithoutTime() }; Data.saveData(); UI.resetForm(); updateAllDisplays(); } };
    UI.els.btnDeleteRecord.onclick = () => { if(confirm('삭제?')) { Data.removeRecord(parseInt(UI.els.editIdInput.value)); UI.resetForm(); updateAllDisplays(); } };
    UI.els.btnCancelEdit.onclick = UI.resetForm;

    // 설정 페이지 전환 (가장 중요한 부분 - 원본 복구)
    const mainPage = document.getElementById('main-page');
    const settingsPage = document.getElementById('settings-page');
    const goToSettingsBtn = document.getElementById('go-to-settings-btn');
    const backToMainBtn = document.getElementById('back-to-main-btn');

    goToSettingsBtn.onclick = () => { mainPage.classList.add("hidden"); settingsPage.classList.remove("hidden"); goToSettingsBtn.classList.add("hidden"); backToMainBtn.classList.remove("hidden"); Stats.displayCumulativeData(); Stats.displayCurrentMonthData(); };
    backToMainBtn.onclick = () => { mainPage.classList.remove("hidden"); settingsPage.classList.add("hidden"); goToSettingsBtn.classList.remove("hidden"); backToMainBtn.classList.add("hidden"); updateAllDisplays(); };

    // 아코디언 메뉴 (원본 복구)
    [document.getElementById('toggle-center-management'), document.getElementById('toggle-batch-apply'), document.getElementById('toggle-subsidy-management'), document.getElementById('toggle-mileage-management'), document.getElementById('toggle-data-management'), document.getElementById('toggle-print-management')]
    .forEach(header => { if(header) header.onclick = () => { header.classList.toggle("active"); header.nextElementSibling.classList.toggle("hidden"); if (header.id === 'toggle-center-management' && !header.nextElementSibling.classList.contains('hidden')) UI.displayCenterList(); }; });

    // 데이터 관리 (원본 복구)
    document.getElementById('export-json-btn').onclick = () => { const data = { records: Data.MEM_RECORDS, centers: Data.MEM_CENTERS, locations: Data.MEM_LOCATIONS }; const b = new Blob([JSON.stringify(data,null,2)],{type:"application/json"}); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download=`backup.json`; a.click(); };
    document.getElementById('import-json-btn').onclick = () => document.getElementById('import-file-input').click();
    document.getElementById('import-file-input').onchange = (e) => { const r = new FileReader(); r.onload = (evt) => { const d = JSON.parse(evt.target.result); if(d.records) localStorage.setItem('records', JSON.stringify(d.records)); if(d.centers) localStorage.setItem('logistics_centers', JSON.stringify(d.centers)); location.reload(); }; r.readAsText(e.target.files[0]); };

    document.getElementById('refresh-btn').onclick = () => location.reload();
    UI.els.typeSelect.onchange = UI.toggleUI;
}

function updateAllDisplays() {
    const date = document.getElementById('today-date-picker').value || Utils.getTodayString();
    Stats.displayTodayRecords(date); Stats.displayDailyRecords(); Stats.displayWeeklyRecords(); Stats.displayMonthlyRecords();
    UI.renderQuickShortcuts(); // [추가]
}

document.addEventListener("DOMContentLoaded", initialSetup);