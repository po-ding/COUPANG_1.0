import * as Utils from './utils.js';
import * as Data from './data.js';
import * as UI from './ui.js';
import * as Stats from './stats.js';

function initialSetup() {
    Data.loadAllData();
    UI.populateCenterDatalist();
    UI.populateExpenseDatalist();
    UI.resetForm();
    UI.renderQuickShortcuts();

    // 설정 페이지 이동 (핵심 기능)
    document.getElementById('go-to-settings-btn').onclick = () => {
        document.getElementById('main-page').classList.add('hidden');
        document.getElementById('settings-page').classList.remove('hidden');
        document.getElementById('go-to-settings-btn').classList.add('hidden');
        document.getElementById('back-to-main-btn').classList.remove('hidden');
        Stats.displayCurrentMonthData();
    };

    document.getElementById('back-to-main-btn').onclick = () => {
        document.getElementById('main-page').classList.remove('hidden');
        document.getElementById('settings-page').classList.add('hidden');
        document.getElementById('go-to-settings-btn').classList.remove('hidden');
        document.getElementById('back-to-main-btn').classList.add('hidden');
        updateAllDisplays();
    };

    // 기록 조회 탭 전환 기능 (핵심 기능)
    document.querySelectorAll('.view-tabs .tab-btn').forEach(btn => {
        btn.onclick = (e) => {
            const target = e.target.dataset.view;
            document.querySelectorAll('.view-tabs .tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.view-content').forEach(c => c.classList.remove('active'));
            e.target.classList.add('active');
            document.getElementById(target + '-view').classList.add('active');
            updateAllDisplays();
        };
    });

    // 시작/종료/저장 버튼들
    UI.els.btnStartTrip.onclick = () => { Data.addRecord({ id: Date.now(), date: Utils.getTodayString(), time: Utils.getCurrentTimeString(), ...UI.getFormDataWithoutTime() }); Utils.showToast('시작됨'); UI.resetForm(); updateAllDisplays(); };
    UI.els.btnSaveGeneral.onclick = () => { Data.addRecord({ id: Date.now(), date: UI.els.dateInput.value, time: UI.els.timeInput.value, ...UI.getFormDataWithoutTime() }); Utils.showToast('저장됨'); UI.resetForm(); updateAllDisplays(); };
    UI.els.btnEndTrip.onclick = () => { Data.addRecord({ id: Date.now(), date: Utils.getTodayString(), time: Utils.getCurrentTimeString(), type: '운행종료' }); Utils.showToast('종료됨'); UI.resetForm(); updateAllDisplays(); };

    // 아코디언 메뉴들
    const accordions = ['toggle-center-management', 'toggle-subsidy-management', 'toggle-data-management'];
    accordions.forEach(id => {
        const h = document.getElementById(id);
        if(h) h.onclick = () => { h.classList.toggle("active"); h.nextElementSibling.classList.toggle("hidden"); if(id === 'toggle-center-management') UI.displayCenterList(); };
    });

    // 데이터 관리
    document.getElementById('export-json-btn').onclick = () => { const data = { records: Data.MEM_RECORDS, centers: Data.MEM_CENTERS, locations: Data.MEM_LOCATIONS }; const b = new Blob([JSON.stringify(data,null,2)],{type:"application/json"}); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download=`backup.json`; a.click(); };
    document.getElementById('import-json-btn').onclick = () => document.getElementById('import-file-input').click();
    document.getElementById('import-file-input').onchange = (e) => { const r = new FileReader(); r.onload = (evt) => { const d = JSON.parse(evt.target.result); if(d.records) localStorage.setItem('records', JSON.stringify(d.records)); location.reload(); }; r.readAsText(e.target.files[0]); };

    document.getElementById('refresh-btn').onclick = () => location.reload();
    UI.els.typeSelect.onchange = UI.toggleUI;
    document.getElementById('today-date-picker').onchange = () => updateAllDisplays();
    document.getElementById('today-date-picker').value = Utils.getTodayString();

    updateAllDisplays();
}

function updateAllDisplays() {
    const date = document.getElementById('today-date-picker').value;
    Stats.displayTodayRecords(date);
    Stats.displayDailyRecords();
    UI.renderQuickShortcuts();
}

document.addEventListener("DOMContentLoaded", initialSetup);