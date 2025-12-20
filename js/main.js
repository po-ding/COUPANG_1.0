import * as Utils from './utils.js';
import * as Data from './data.js';
import * as UI from './ui.js';
import * as Stats from './stats.js';

function initialSetup() {
    Data.loadAllData();
    UI.resetForm();
    UI.renderQuickShortcuts();

    // [중요] 설정 페이지 이동 이벤트
    const settingsBtn = document.getElementById('go-to-settings-btn');
    const backBtn = document.getElementById('back-to-main-btn');
    const mainPage = document.getElementById('main-page');
    const settingsPage = document.getElementById('settings-page');

    if(settingsBtn) {
        settingsBtn.onclick = () => {
            mainPage.classList.add('hidden');
            settingsPage.classList.remove('hidden');
            settingsBtn.classList.add('hidden');
            backBtn.classList.remove('hidden');
            Stats.displayCumulativeData();
            Stats.displayCurrentMonthData();
        };
    }

    if(backBtn) {
        backBtn.onclick = () => {
            mainPage.classList.remove('hidden');
            settingsPage.classList.add('hidden');
            settingsBtn.classList.remove('hidden');
            backBtn.classList.add('hidden');
            updateAllDisplays();
        };
    }

    // 아코디언 메뉴 이벤트
    const accordionHeader = document.getElementById('toggle-center-management');
    if(accordionHeader) {
        accordionHeader.onclick = () => {
            const body = document.getElementById('center-management-body');
            body.classList.toggle('hidden');
            if(!body.classList.contains('hidden')) UI.displayCenterList();
        };
    }
    
    // 타 아코디언들
    ['toggle-batch-apply', 'toggle-subsidy-management', 'toggle-data-management'].forEach(id => {
        const h = document.getElementById(id);
        if(h) h.onclick = () => h.nextElementSibling.classList.toggle('hidden');
    });

    // 기록 저장 이벤트
    if(UI.els.btnStartTrip) {
        UI.els.btnStartTrip.onclick = () => {
            const fd = UI.getFormDataWithoutTime ? UI.getFormDataWithoutTime() : { 
                type: UI.els.typeSelect.value, 
                from: UI.els.fromCenterInput.value, 
                to: UI.els.toCenterInput.value 
            };
            Data.addRecord({ id: Date.now(), date: Utils.getTodayString(), time: Utils.getCurrentTimeString(), ...fd });
            Utils.showToast('저장됨');
            UI.resetForm();
            updateAllDisplays();
        };
    }

    // 기타 설정
    document.getElementById('refresh-btn').onclick = () => location.reload();
    UI.els.typeSelect.onchange = UI.toggleUI;
    
    document.getElementById('today-date-picker').value = Utils.getStatisticalDate(Utils.getTodayString(), Utils.getCurrentTimeString());
    document.getElementById('today-date-picker').onchange = () => updateAllDisplays();

    updateAllDisplays();
}

function updateAllDisplays() {
    const date = document.getElementById('today-date-picker').value;
    Stats.displayTodayRecords(date);
    UI.renderQuickShortcuts();
}

document.addEventListener("DOMContentLoaded", initialSetup);