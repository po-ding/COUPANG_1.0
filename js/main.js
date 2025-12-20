import * as Utils from './utils.js';
import * as Data from './data.js';
import * as UI from './ui.js';
import * as Stats from './stats.js';
import * as Location from './location.js';

window.viewDateDetails = (date) => { 
    document.getElementById('today-date-picker').value = date; 
    document.querySelector('.tab-btn[data-view="today"]').click();
    Stats.displayTodayRecords(date); 
};

window.toggleAllSummaryValues = (el) => { 
    const isShow = el.classList.toggle('active'); 
    el.querySelectorAll('.summary-item').forEach(item => {
        item.classList.toggle('active', isShow);
        item.querySelector('.summary-value').classList.toggle('hidden', !isShow);
    });
};

function init() {
    Data.loadAllData();
    Location.populateCenterDatalist();
    UI.populateExpenseDatalist();
    
    // 기본 날짜 설정 및 초기 렌더링
    const targetDate = Utils.getStatisticalDate(Utils.getTodayString(), Utils.getCurrentTimeString());
    document.getElementById('today-date-picker').value = targetDate;
    UI.resetForm();
    updateAll();

    // 상하차지 입력 리스너
    [UI.els.fromCenterInput, UI.els.toCenterInput].forEach(el => {
        el.addEventListener('input', Location.handleTransportInput);
    });

    // 버튼 이벤트들 (기존 main.js와 동일하게 Location/Data/Stats 호출)
    UI.els.btnStartTrip.onclick = () => {
        const data = UI.getFormDataWithoutTime();
        Data.addRecord({ id: Date.now(), date: Utils.getTodayString(), time: Utils.getCurrentTimeString(), ...data });
        Utils.showToast('저장되었습니다.'); UI.resetForm(); updateAll();
    };
    
    UI.els.btnSaveGeneral.onclick = () => {
        const data = UI.getFormDataWithoutTime();
        if (data.expenseItem) Data.updateExpenseItemData(data.expenseItem);
        Data.addRecord({ id: Date.now(), date: UI.els.dateInput.value, time: UI.els.timeInput.value, ...data });
        Utils.showToast('저장되었습니다.'); UI.populateExpenseDatalist(); UI.resetForm(); updateAll();
    };

    // 설정 페이지 아코디언 및 지역 관리 로드
    document.getElementById('toggle-center-management').onclick = function() {
        this.classList.toggle('active');
        const body = this.nextElementSibling;
        body.classList.toggle('hidden');
        if(!body.classList.contains('hidden')) Location.displayCenterList();
    };
}

function updateAll() {
    const date = document.getElementById('today-date-picker').value;
    Stats.displayTodayRecords(date);
    // ... 나머지 통계 업데이트 호출 ...
}

document.addEventListener("DOMContentLoaded", init);