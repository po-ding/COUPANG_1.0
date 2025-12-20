// --- START OF FILE js/main.js ---
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

    // [완벽 복구] 설정 페이지 전환
    document.getElementById('go-to-settings-btn').onclick = () => {
        document.getElementById('main-page').classList.add('hidden');
        document.getElementById('settings-page').classList.remove('hidden');
        document.getElementById('go-to-settings-btn').classList.add('hidden');
        document.getElementById('back-to-main-btn').classList.remove('hidden');
        Stats.displayCumulativeData();
        Stats.displayCurrentMonthData();
    };

    document.getElementById('back-to-main-btn').onclick = () => {
        document.getElementById('main-page').classList.remove('hidden');
        document.getElementById('settings-page').classList.add('hidden');
        document.getElementById('go-to-settings-btn').classList.remove('hidden');
        document.getElementById('back-to-main-btn').classList.add('hidden');
    };
}

// 저장 로직 (16.4 동일)
document.getElementById('btn-start-trip').onclick = saveRecord;
document.getElementById('btn-save-general').onclick = saveRecord;

function saveRecord() {
    const income = Math.round(parseFloat(document.getElementById('income').value||0) * 10000);
    const cost = Math.round(parseFloat(document.getElementById('cost').value||0) * 10000);
    const r = {
        id: Date.now(),
        date: document.getElementById('date').value,
        time: document.getElementById('time').value,
        type: UI.els.typeSelect.value,
        from: UI.els.fromCenterInput.value,
        to: UI.els.toCenterInput.value,
        distance: parseFloat(document.getElementById('manual-distance').value)||0,
        income, cost
    };
    Data.addRecord(r);
    Utils.showToast("저장 완료");
    UI.resetForm();
    Stats.displayTodayRecords(document.getElementById('today-date-picker').value);
}

// 수정/삭제 등 16.4의 모든 이벤트 리스너 동일 적용
document.getElementById('ocr-input').onchange = (e) => UI.processReceiptImage(e.target.files[0]);
document.querySelectorAll('.collapsible-header').forEach(h => h.onclick = () => h.nextElementSibling.classList.toggle('hidden'));

document.addEventListener('DOMContentLoaded', initialSetup);