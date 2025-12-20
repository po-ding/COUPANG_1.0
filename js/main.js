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
    Stats.displayTodayRecords(today);

    // 설정 버튼 직접 연결 (querySelector 대신 getElementById로 확실하게)
    const btnGoSettings = document.getElementById('go-to-settings-btn');
    const btnBackMain = document.getElementById('back-to-main-btn');
    const pageMain = document.getElementById('main-page');
    const pageSettings = document.getElementById('settings-page');

    btnGoSettings.onclick = () => {
        pageMain.classList.add('hidden');
        pageSettings.classList.remove('hidden');
        btnGoSettings.classList.add('hidden');
        btnBackMain.classList.remove('hidden');
    };

    btnBackMain.onclick = () => {
        pageMain.classList.remove('hidden');
        pageSettings.classList.add('hidden');
        btnGoSettings.classList.remove('hidden');
        btnBackMain.classList.add('hidden');
        Stats.displayTodayRecords(document.getElementById('today-date-picker').value);
    };
}

// 저장 로직
document.getElementById('btn-save-record').onclick = () => {
    const r = {
        id: Date.now(),
        date: document.getElementById('date').value,
        time: document.getElementById('time').value,
        type: UI.els.typeSelect.value,
        from: UI.els.fromInput.value,
        to: UI.els.toInput.value,
        distance: parseFloat(document.getElementById('manual-distance').value) || 0,
        income: Math.round(parseFloat(document.getElementById('income').value || 0) * 10000),
        cost: Math.round(parseFloat(document.getElementById('cost').value || 0) * 10000)
    };
    Data.MEM_RECORDS.push(r);
    Data.saveData();
    Utils.showToast("저장 완료");
    UI.resetForm();
    Stats.displayTodayRecords(document.getElementById('today-date-picker').value);
};

// 날짜 이동
document.getElementById('prev-day-btn').onclick = () => {
    const picker = document.getElementById('today-date-picker');
    const d = new Date(picker.value);
    d.setDate(d.getDate() - 1);
    picker.value = d.toISOString().split('T')[0];
    Stats.displayTodayRecords(picker.value);
};

document.getElementById('next-day-btn').onclick = () => {
    const picker = document.getElementById('today-date-picker');
    const d = new Date(picker.value);
    d.setDate(d.getDate() + 1);
    picker.value = d.toISOString().split('T')[0];
    Stats.displayTodayRecords(picker.value);
};

// 아코디언 및 기타 초기화
document.addEventListener('DOMContentLoaded', initialSetup);