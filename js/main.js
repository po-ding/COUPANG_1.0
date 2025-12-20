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

    // 설정 페이지 전환 이벤트 고정
    const btnGoSettings = document.getElementById('go-to-settings-btn');
    const btnBackMain = document.getElementById('back-to-main-btn');
    const mainPage = document.getElementById('main-page');
    const settingsPage = document.getElementById('settings-page');

    btnGoSettings.addEventListener('click', () => {
        mainPage.classList.add('hidden');
        settingsPage.classList.remove('hidden');
        btnGoSettings.classList.add('hidden');
        btnBackMain.classList.remove('hidden');
        Stats.displayCurrentMonthData();
    });

    btnBackMain.addEventListener('click', () => {
        mainPage.classList.remove('hidden');
        settingsPage.classList.add('hidden');
        btnGoSettings.classList.remove('hidden');
        btnBackMain.classList.add('hidden');
        Stats.displayTodayRecords(document.getElementById('today-date-picker').value);
    });

    // 아코디언 메뉴
    document.querySelectorAll('.collapsible-header').forEach(h => {
        h.onclick = () => h.nextElementSibling.classList.toggle('hidden');
    });
}

// 기록 저장 로직
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
    Utils.showToast("저장 완료!");
    UI.resetForm();
    Stats.displayTodayRecords(document.getElementById('today-date-picker').value);
};

// 수정 및 삭제 로직
document.getElementById('btn-update-record').onclick = () => {
    const id = parseInt(document.getElementById('edit-id').value);
    const idx = Data.MEM_RECORDS.findIndex(x => x.id === id);
    if (idx > -1) {
        Data.MEM_RECORDS[idx] = {
            ...Data.MEM_RECORDS[idx],
            type: UI.els.typeSelect.value,
            from: UI.els.fromInput.value,
            to: UI.els.toInput.value,
            distance: parseFloat(document.getElementById('manual-distance').value) || 0,
            income: Math.round(parseFloat(document.getElementById('income').value || 0) * 10000),
            cost: Math.round(parseFloat(document.getElementById('cost').value || 0) * 10000)
        };
        Data.saveData();
        Utils.showToast("수정 완료");
        UI.resetForm();
        Stats.displayTodayRecords(document.getElementById('today-date-picker').value);
    }
};

document.getElementById('btn-cancel-edit').onclick = () => UI.resetForm();

// 날짜 이동
document.getElementById('prev-day-btn').onclick = () => {
    const p = document.getElementById('today-date-picker');
    const d = new Date(p.value); d.setDate(d.getDate() - 1);
    p.value = d.toISOString().split('T')[0];
    Stats.displayTodayRecords(p.value);
};

document.getElementById('next-day-btn').onclick = () => {
    const p = document.getElementById('today-date-picker');
    const d = new Date(p.value); d.setDate(d.getDate() + 1);
    p.value = d.toISOString().split('T')[0];
    Stats.displayTodayRecords(p.value);
};

// 백업 및 복원
document.getElementById('export-json-btn').onclick = () => {
    const data = JSON.stringify({records: Data.MEM_RECORDS, locations: Data.MEM_LOCATIONS});
    const blob = new Blob([data], {type: 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `backup_${Utils.getTodayString()}.json`;
    a.click();
};

document.getElementById('import-json-btn').onclick = () => document.getElementById('import-file-input').click();
document.getElementById('import-file-input').onchange = (e) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
        const d = JSON.parse(evt.target.result);
        if(d.records) localStorage.setItem('records', JSON.stringify(d.records));
        if(d.locations) localStorage.setItem('saved_locations', JSON.stringify(d.locations));
        location.reload();
    };
    reader.readAsText(e.target.files[0]);
};

document.addEventListener('DOMContentLoaded', initialSetup);