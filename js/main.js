import * as Utils from './utils.js';
import * as Data from './data.js';
import * as UI from './ui.js';
import * as Stats from './stats.js';

function initialSetup() {
    Data.loadAllData();
    UI.populateCenterDatalist();
    UI.populateExpenseDatalist();
    UI.resetForm();
    UI.renderQuickShortcuts(); // 퀵 버튼 실행

    // 날짜 선택기 초기화
    const y = new Date().getFullYear();
    const yrs = []; for(let i=0; i<5; i++) yrs.push(`<option value="${y-i}">${y-i}년</option>`);
    [document.getElementById('daily-year-select'), document.getElementById('weekly-year-select'), document.getElementById('monthly-year-select'), document.getElementById('print-year-select')].forEach(el => el.innerHTML = yrs.join(''));
    
    document.getElementById('today-date-picker').value = Utils.getStatisticalDate(Utils.getTodayString(), Utils.getCurrentTimeString());

    // [이벤트 리스너 모음] - 절대 수정 금지
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

    // 설정창 아코디언
    [document.getElementById('toggle-center-management'), document.getElementById('toggle-batch-apply'), document.getElementById('toggle-subsidy-management'), document.getElementById('toggle-mileage-management'), document.getElementById('toggle-data-management'), document.getElementById('toggle-print-management')]
    .forEach(header => { 
        header.onclick = () => { 
            header.classList.toggle("active"); 
            header.nextElementSibling.classList.toggle("hidden"); 
            if(header.id === 'toggle-center-management' && !header.nextElementSibling.classList.contains('hidden')) UI.displayCenterList(); 
        }; 
    });

    // 버튼 동작들
    UI.els.btnStartTrip.onclick = () => {
        const fd = UI.getFormDataWithoutTime();
        Data.addRecord({ id: Date.now(), date: Utils.getTodayString(), time: Utils.getCurrentTimeString(), ...fd });
        Utils.showToast('저장되었습니다.'); UI.resetForm(); updateAllDisplays();
    };

    UI.els.btnSaveGeneral.onclick = () => {
        const fd = UI.getFormDataWithoutTime();
        Data.addRecord({ id: Date.now(), date: UI.els.dateInput.value, time: UI.els.timeInput.value, ...fd });
        Utils.showToast('저장되었습니다.'); UI.resetForm(); updateAllDisplays();
    };

    document.getElementById('refresh-btn').onclick = () => location.reload();
    document.getElementById('type').onchange = UI.toggleUI;
    document.getElementById('today-date-picker').onchange = () => updateAllDisplays();

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

    updateAllDisplays();
}

function updateAllDisplays() {
    const date = document.getElementById('today-date-picker').value || Utils.getTodayString();
    Stats.displayTodayRecords(date); Stats.displayDailyRecords(); Stats.displayWeeklyRecords(); Stats.displayMonthlyRecords();
    UI.renderQuickShortcuts();
}

document.addEventListener("DOMContentLoaded", initialSetup);