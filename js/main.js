import * as Utils from './utils.js';
import * as Data from './data.js';
import * as UI from './ui.js';
import * as Stats from './stats.js';

function initialSetup() {
    Data.loadAllData();
    UI.renderQuickButtons();
    
    // 초기 날짜 (04시 기준)
    const statToday = Utils.getStatisticalDate(Utils.getTodayString(), Utils.getCurrentTimeString());
    document.getElementById('today-date-picker').value = statToday;

    setupUIEvents();
    UI.resetForm();
    updateDisplays();
}

function updateDisplays() {
    const date = document.getElementById('today-date-picker').value;
    Stats.displayTodayRecords(date);
    Stats.displayDailyRecords();
    Stats.displayWeeklyRecords();
}

function setupUIEvents() {
    // 1. 설정 페이지 전환
    UI.els.btnGoToSettings.onclick = () => {
        UI.els.mainPage.classList.add('hidden');
        UI.els.settingsPage.classList.remove('hidden');
        UI.els.btnGoToSettings.classList.add('hidden');
        UI.els.btnBackToMain.classList.remove('hidden');
        Stats.displayCurrentMonthData();
    };

    UI.els.btnBackToMain.onclick = () => {
        UI.els.mainPage.classList.remove('hidden');
        UI.els.settingsPage.classList.add('hidden');
        UI.els.btnGoToSettings.classList.remove('hidden');
        UI.els.btnBackToMain.classList.add('hidden');
        updateDisplays();
    };

    // 2. 입력 동작 버튼
    UI.els.btnStartTrip.onclick = () => {
        const data = UI.getFormData();
        Data.addRecord({ id: Date.now(), date: Utils.getTodayString(), time: Utils.getCurrentTimeString(), ...data });
        Utils.showToast('운행 시작 기록됨');
        UI.resetForm();
        updateDisplays();
    };

    UI.els.btnEndTrip.onclick = () => {
        Data.addRecord({ id: Date.now(), date: Utils.getTodayString(), time: Utils.getCurrentTimeString(), type: '운행종료', distance: 0, cost: 0, income: 0 });
        Utils.showToast('운행 종료');
        UI.resetForm();
        updateDisplays();
    };

    UI.els.btnSaveGeneral.onclick = () => {
        const data = UI.getFormData();
        Data.addRecord({ id: Date.now(), date: UI.els.dateInput.value, time: UI.els.timeInput.value, ...data });
        Utils.showToast('저장 완료');
        UI.resetForm();
        updateDisplays();
    };

    // 3. 기록 조회 탭 전환
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.view-content').forEach(v => v.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`${btn.dataset.view}-view`).classList.add('active');
            updateDisplays();
        };
    });

    // 4. 아코디언 메뉴 제어
    document.querySelectorAll('.collapsible-header').forEach(header => {
        header.onclick = () => {
            header.classList.toggle('active');
            header.nextElementSibling.classList.toggle('hidden');
        };
    });

    // 5. 상하차지 입력 시 주소표시 트리거
    UI.els.fromCenterInput.oninput = UI.els.toCenterInput.oninput = () => {
        const f = UI.els.fromCenterInput.value.trim();
        const t = UI.els.toCenterInput.value.trim();
        // 백업 데이터에서 운임/거리 자동 로드 로직 (필요시 추가)
        UI.updateAddressDisplay(); 
    };

    document.getElementById('refresh-btn').onclick = () => location.reload();
}

document.addEventListener("DOMContentLoaded", initialSetup);