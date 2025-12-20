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

    // 설정 페이지 전환 이벤트 (이게 없어서 안 눌렸던 것)
    document.getElementById('go-to-settings-btn').onclick = () => {
        document.getElementById('main-page').classList.add('hidden');
        document.getElementById('settings-page').classList.remove('hidden');
        document.getElementById('go-to-settings-btn').classList.add('hidden');
        document.getElementById('back-to-main-btn').classList.remove('hidden');
    };

    document.getElementById('back-to-main-btn').onclick = () => {
        document.getElementById('main-page').classList.remove('hidden');
        document.getElementById('settings-page').classList.add('hidden');
        document.getElementById('go-to-settings-btn').classList.remove('hidden');
        document.getElementById('back-to-main-btn').classList.add('hidden');
        Stats.displayTodayRecords(document.getElementById('today-date-picker').value);
    };
}

// 저장 버튼 이벤트
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
    Utils.showToast("저장되었습니다.");
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

// 아코디언
document.querySelectorAll('.collapsible-header').forEach(h => {
    h.onclick = () => h.nextElementSibling.classList.toggle('hidden');
});

document.addEventListener('DOMContentLoaded', initialSetup);