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

    // 설정 버튼 이벤트
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

    // 설정 아코디언 이벤트
    const accordions = [
        'toggle-center-management', 'toggle-batch-apply', 'toggle-subsidy-management', 
        'toggle-data-management'
    ];
    accordions.forEach(id => {
        const header = document.getElementById(id);
        if(header) {
            header.onclick = () => {
                header.classList.toggle("active");
                header.nextElementSibling.classList.toggle("hidden");
                if(id === 'toggle-center-management') UI.displayCenterList();
            };
        }
    });

    // 시작/저장 버튼 이벤트
    UI.els.btnStartTrip.onclick = () => {
        const fd = UI.getFormDataWithoutTime();
        Data.addRecord({ id: Date.now(), date: Utils.getTodayString(), time: Utils.getCurrentTimeString(), ...fd });
        Utils.showToast('시작됨'); UI.resetForm(); updateAllDisplays();
    };

    UI.els.btnSaveGeneral.onclick = () => {
        const fd = UI.getFormDataWithoutTime();
        Data.addRecord({ id: Date.now(), date: UI.els.dateInput.value, time: UI.els.timeInput.value, ...fd });
        Utils.showToast('저장됨'); UI.resetForm(); updateAllDisplays();
    };

    // 데이터 복원
    document.getElementById('import-json-btn').onclick = () => document.getElementById('import-file-input').click();
    document.getElementById('import-file-input').onchange = (e) => {
        const reader = new FileReader();
        reader.onload = (evt) => {
            const d = JSON.parse(evt.target.result);
            if(d.records) localStorage.setItem('records', JSON.stringify(d.records));
            if(d.centers) localStorage.setItem('logistics_centers', JSON.stringify(d.centers));
            alert('복원완료'); location.reload();
        };
        reader.readAsText(e.target.files[0]);
    };

    document.getElementById('refresh-btn').onclick = () => location.reload();
    document.getElementById('type').onchange = UI.toggleUI;
    document.getElementById('today-date-picker').onchange = () => updateAllDisplays();
    
    const today = Utils.getStatisticalDate(Utils.getTodayString(), Utils.getCurrentTimeString());
    document.getElementById('today-date-picker').value = today;

    updateAllDisplays();
}

function updateAllDisplays() {
    const date = document.getElementById('today-date-picker').value || Utils.getTodayString();
    Stats.displayTodayRecords(date); Stats.displayDailyRecords(); Stats.displayWeeklyRecords(); Stats.displayMonthlyRecords();
    UI.renderQuickShortcuts();
}

document.addEventListener("DOMContentLoaded", initialSetup);