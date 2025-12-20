import * as Utils from './utils.js';
import * as Data from './data.js';
import * as UI from './ui.js';
import * as Stats from './stats.js';

function initialSetup() {
    Data.loadAllData();
    UI.resetForm();
    UI.renderQuickShortcuts();
    
    const todayStr = Utils.getTodayString();
    document.getElementById('today-date-picker').value = todayStr;
    
    // 설정 페이지 이동 버튼
    document.getElementById('go-to-settings-btn').onclick = () => {
        document.getElementById('main-page').classList.add('hidden');
        document.getElementById('settings-page').classList.remove('hidden');
        document.getElementById('go-to-settings-btn').classList.add('hidden');
        document.getElementById('back-to-main-btn').classList.remove('hidden');
        Stats.displayCurrentMonthData();
    };

    // 메인 페이지 이동 버튼
    document.getElementById('back-to-main-btn').onclick = () => {
        document.getElementById('main-page').classList.remove('hidden');
        document.getElementById('settings-page').classList.add('hidden');
        document.getElementById('go-to-settings-btn').classList.remove('hidden');
        document.getElementById('back-to-main-btn').classList.add('hidden');
        updateAllDisplays();
    };

    // 운행 시작 버튼
    document.getElementById('btn-start-trip').onclick = () => {
        const fd = UI.getFormDataWithoutTime();
        Data.addRecord({ id: Date.now(), date: Utils.getTodayString(), time: Utils.getCurrentTimeString(), ...fd });
        Utils.showToast('저장됨');
        UI.resetForm();
        updateAllDisplays();
    };

    // 일반 저장 버튼
    document.getElementById('btn-save-general').onclick = () => {
        const fd = UI.getFormDataWithoutTime();
        Data.addRecord({ id: Date.now(), date: UI.els.dateInput.value, time: UI.els.timeInput.value, ...fd });
        Utils.showToast('저장됨');
        UI.resetForm();
        updateAllDisplays();
    };

    // 아코디언 메뉴
    document.getElementById('toggle-center-management').onclick = () => {
        const body = document.getElementById('center-management-body');
        body.classList.toggle('hidden');
        if(!body.classList.contains('hidden')) UI.displayCenterList();
    };

    // 데이터 복원
    document.getElementById('import-json-btn').onclick = () => document.getElementById('import-file-input').click();
    document.getElementById('import-file-input').onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (evt) => {
            const d = JSON.parse(evt.target.result);
            if(d.records) localStorage.setItem('records', JSON.stringify(d.records));
            if(d.centers) localStorage.setItem('logistics_centers', JSON.stringify(d.centers));
            alert('복원완료'); location.reload();
        };
        reader.readAsText(file);
    };

    updateAllDisplays();
}

function updateAllDisplays() {
    const date = document.getElementById('today-date-picker').value;
    Stats.displayTodayRecords(date);
    UI.renderQuickShortcuts();
}

document.getElementById('type').onchange = UI.toggleUI;
document.getElementById('refresh-btn').onclick = () => location.reload();
document.getElementById('today-date-picker').onchange = () => updateAllDisplays();

document.addEventListener("DOMContentLoaded", initialSetup);