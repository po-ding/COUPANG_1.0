import * as Utils from './utils.js';
import * as Data from './data.js';
import * as UI from './ui.js';
import * as Stats from './stats.js';

function initialSetup() {
    Data.loadAllData();
    UI.resetForm();
    UI.renderQuickShortcuts();

    // 설정 버튼 (무조건 작동하도록 직접 연결)
    document.getElementById('go-to-settings-btn').addEventListener('click', () => {
        document.getElementById('main-page').classList.add('hidden');
        document.getElementById('settings-page').classList.remove('hidden');
        document.getElementById('go-to-settings-btn').classList.add('hidden');
        document.getElementById('back-to-main-btn').classList.remove('hidden');
    });

    document.getElementById('back-to-main-btn').addEventListener('click', () => {
        document.getElementById('main-page').classList.remove('hidden');
        document.getElementById('settings-page').classList.add('hidden');
        document.getElementById('go-to-settings-btn').classList.remove('hidden');
        document.getElementById('back-to-main-btn').classList.add('hidden');
        updateAllDisplays();
    });

    // 설정창 아코디언
    document.getElementById('toggle-center-management').addEventListener('click', () => {
        const body = document.getElementById('center-management-body');
        body.classList.toggle('hidden');
        if(!body.classList.contains('hidden')) UI.displayCenterList();
    });

    // 시작 버튼
    document.getElementById('btn-start-trip').addEventListener('click', () => {
        const type = document.getElementById('type').value;
        const from = document.getElementById('from-center').value;
        const to = document.getElementById('to-center').value;
        Data.addRecord({ id: Date.now(), date: Utils.getTodayString(), time: Utils.getCurrentTimeString(), type, from, to });
        Utils.showToast('저장됨');
        UI.resetForm();
        updateAllDisplays();
    });

    document.getElementById('refresh-btn').addEventListener('click', () => location.reload());
    document.getElementById('type').addEventListener('change', UI.toggleUI);

    const todayDate = document.getElementById('today-date-picker');
    todayDate.value = Utils.getTodayString();
    todayDate.addEventListener('change', () => updateAllDisplays());

    updateAllDisplays();
}

function updateAllDisplays() {
    const date = document.getElementById('today-date-picker').value;
    Stats.displayTodayRecords(date);
    UI.renderQuickShortcuts();
}

document.addEventListener("DOMContentLoaded", initialSetup);