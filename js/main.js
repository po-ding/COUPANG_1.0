import * as Utils from './utils.js';
import * as Data from './data.js';
import * as UI from './ui.js';
import * as Stats from './stats.js';

window.viewDateDetails = function(date) { 
    document.getElementById('today-date-picker').value = date; 
    document.querySelectorAll('.view-tabs .tab-btn').forEach(b => b.classList.toggle("active", b.dataset.view === "today")); 
    document.querySelectorAll('.view-content').forEach(c => c.classList.toggle('active', c.id === "today-view")); 
    Stats.displayTodayRecords(date); 
};

function initialSetup() {
    Data.loadAllData();
    UI.populateCenterDatalist();
    UI.populateExpenseDatalist();
    UI.resetForm();
    UI.renderQuickShortcuts();

    const y = new Date().getFullYear();
    const yrs = []; for(let i=0; i<5; i++) yrs.push(`<option value="${y-i}">${y-i}년</option>`);
    [document.getElementById('daily-year-select'), document.getElementById('weekly-year-select'), document.getElementById('monthly-year-select'), document.getElementById('print-year-select')].forEach(el => { if(el) el.innerHTML = yrs.join(''); });
    
    document.getElementById('today-date-picker').value = Utils.getTodayString();

    // 설정 버튼 및 페이지 전환
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

    // [중요] 탭 전환 이벤트 리스너 (기록 조회 부분)
    document.querySelectorAll('.view-tabs .tab-btn').forEach(btn => {
        btn.onclick = (e) => {
            const targetView = e.target.dataset.view;
            document.querySelectorAll('.view-tabs .tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.view-content').forEach(c => c.classList.remove('active'));
            e.target.classList.add('active');
            document.getElementById(targetView + '-view').classList.add('active');
            updateAllDisplays();
        };
    });

    // 설정창 아코디언 및 기타 리스너
    const accordions = ['toggle-center-management', 'toggle-batch-apply', 'toggle-subsidy-management', 'toggle-data-management', 'toggle-print-management', 'toggle-mileage-management'];
    accordions.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.onclick = () => { el.classList.toggle("active"); el.nextElementSibling.classList.toggle("hidden"); if(id === 'toggle-center-management') UI.displayCenterList(); };
    });

    UI.els.btnStartTrip.onclick = () => { Data.addRecord({ id: Date.now(), date: Utils.getTodayString(), time: Utils.getCurrentTimeString(), ...UI.getFormDataWithoutTime() }); Utils.showToast('시작됨'); UI.resetForm(); updateAllDisplays(); };
    UI.els.btnSaveGeneral.onclick = () => { Data.addRecord({ id: Date.now(), date: UI.els.dateInput.value, time: UI.els.timeInput.value, ...UI.getFormDataWithoutTime() }); Utils.showToast('저장됨'); UI.resetForm(); updateAllDisplays(); };
    
    document.getElementById('refresh-btn').onclick = () => location.reload();
    UI.els.typeSelect.onchange = UI.toggleUI;
    document.getElementById('today-date-picker').onchange = () => updateAllDisplays();

    // 데이터 관리 (JSON 백업/복원)
    document.getElementById('export-json-btn').onclick = () => { const data = { records: Data.MEM_RECORDS, centers: Data.MEM_CENTERS, locations: Data.MEM_LOCATIONS }; const b = new Blob([JSON.stringify(data,null,2)],{type:"application/json"}); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download=`backup.json`; a.click(); };
    document.getElementById('import-json-btn').onclick = () => document.getElementById('import-file-input').click();
    document.getElementById('import-file-input').onchange = (e) => { const r = new FileReader(); r.onload = (evt) => { const d = JSON.parse(evt.target.result); if(d.records) localStorage.setItem('records', JSON.stringify(d.records)); location.reload(); }; r.readAsText(e.target.files[0]); };

    updateAllDisplays();
}

function updateAllDisplays() {
    const date = document.getElementById('today-date-picker').value || Utils.getTodayString();
    Stats.displayTodayRecords(date); Stats.displayDailyRecords(); Stats.displayWeeklyRecords(); Stats.displayMonthlyRecords();
    UI.renderQuickShortcuts();
}

document.addEventListener("DOMContentLoaded", initialSetup);