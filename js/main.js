import * as Data from './data.js';
import * as UI from './ui.js';
import * as Utils from './utils.js';
import * as Stats from './stats.js';

function initialSetup() {
    Data.loadAllData();
    UI.populateCenterDatalist();
    UI.setupRegionButtons();
    UI.resetForm();
    
    const today = Utils.getStatisticalDate(Utils.getTodayString(), Utils.getCurrentTimeString());
    document.getElementById('today-date-picker').value = today;
    updateDisplays();
}

function updateDisplays() {
    const date = document.getElementById('today-date-picker').value;
    Stats.displayTodayRecords(date);
    Stats.displayCurrentMonthData();
}

// 이벤트 연결
document.getElementById('btn-start-trip').addEventListener('click', () => {
    const r = {
        id: Date.now(),
        date: document.getElementById('date').value,
        time: document.getElementById('time').value,
        type: UI.els.typeSelect.value,
        from: UI.els.fromCenter.value,
        to: UI.els.toCenter.value,
        distance: parseFloat(UI.els.distInput.value) || 0,
        income: Math.round(parseFloat(UI.els.incomeInput.value || 0) * 10000),
        cost: Math.round(parseFloat(UI.els.costInput.value || 0) * 10000)
    };
    Data.addRecord(r);
    Utils.showToast("저장 완료");
    UI.resetForm();
    updateDisplays();
});

UI.els.fromCenter.addEventListener('focus', () => UI.populateCenterDatalist());
UI.els.toCenter.addEventListener('focus', () => UI.populateCenterDatalist());
UI.els.typeSelect.addEventListener('change', UI.toggleUI);

document.getElementById('go-to-settings-btn').addEventListener('click', () => {
    document.getElementById('main-page').classList.add('hidden');
    document.getElementById('settings-page').classList.remove('hidden');
    document.getElementById('back-to-main-btn').classList.remove('hidden');
});

document.getElementById('back-to-main-btn').addEventListener('click', () => {
    document.getElementById('main-page').classList.remove('hidden');
    document.getElementById('settings-page').classList.add('hidden');
    document.getElementById('back-to-main-btn').classList.add('hidden');
});

document.addEventListener('DOMContentLoaded', initialSetup);