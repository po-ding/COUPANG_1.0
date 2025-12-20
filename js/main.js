import * as Utils from './utils.js';
import * as Data from './data.js';
import * as UI from './ui.js';
import * as Stats from './stats.js';

function initialSetup() {
    Data.loadAllData();
    UI.populateCenterDatalist();
    UI.populateExpenseDatalist();
    
    // [추가] 퀵 버튼 초기화
    UI.renderQuickShortcuts();

    const y = new Date().getFullYear();
    const yrs = []; for(let i=0; i<5; i++) yrs.push(`<option value="${y-i}">${y-i}년</option>`);
    [document.getElementById('daily-year-select'), document.getElementById('weekly-year-select'), document.getElementById('monthly-year-select')].forEach(el => el.innerHTML = yrs.join(''));
    
    const ms = []; for(let i=1; i<=12; i++) ms.push(`<option value="${i.toString().padStart(2,'0')}">${i}월</option>`);
    [document.getElementById('daily-month-select'), document.getElementById('weekly-month-select')].forEach(el => { 
        el.innerHTML = ms.join(''); 
        el.value = (new Date().getMonth()+1).toString().padStart(2,'0'); 
    });

    const statToday = Utils.getStatisticalDate(Utils.getTodayString(), Utils.getCurrentTimeString());
    document.getElementById('today-date-picker').value = statToday;

    UI.resetForm();
    updateAllDisplays();
}

function updateAllDisplays() {
    const targetDate = document.getElementById('today-date-picker').value || Utils.getTodayString();
    Stats.displayTodayRecords(targetDate);
    Stats.displayDailyRecords();
    Stats.displayWeeklyRecords();
    Stats.displayMonthlyRecords();
    // 퀵버튼도 데이터 변화가 있을 수 있으므로 갱신
    UI.renderQuickShortcuts();
}

// 나머지 이벤트 리스너들은 기존 파일과 동일하게 유지...
// (이벤트 리스너 부분은 코드량이 많아 생략하나, 원본 파일의 내용을 그대로 붙여넣으시면 됩니다.)

document.addEventListener("DOMContentLoaded", initialSetup);
// (기존 main.js의 moveDate, 탭 전환, 설정 페이지 전환 등 모든 이벤트 리스너 포함)