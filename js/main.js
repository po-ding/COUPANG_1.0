import * as Utils from './utils.js';
import * as Data from './data.js';
import * as UI from './ui.js';
import * as Stats from './stats.js';

function initialSetup() {
    Data.loadAllData();
    UI.populateCenterDatalist();
    UI.populateExpenseDatalist();
    UI.renderQuickButtons(); // 퀵 버튼 생성

    // 오늘 날짜 및 조회용 날짜 초기화 (04시 기준)
    const todayStr = Utils.getTodayString();
    const nowTime = Utils.getCurrentTimeString();
    const statToday = Utils.getStatisticalDate(todayStr, nowTime);
    document.getElementById('today-date-picker').value = statToday;

    setupSelectBoxes();
    UI.resetForm();
    updateAllDisplays();
    setupEventListeners();
}

function setupSelectBoxes() {
    const y = new Date().getFullYear();
    const ms = Array.from({length:12}, (_,i) => (i+1).toString().padStart(2,'0'));
    const yrHtml = Array.from({length:5}, (_,i) => `<option value="${y-i}">${y-i}년</option>`).join('');
    const msHtml = ms.map(v => `<option value="${v}">${parseInt(v)}월</option>`).join('');

    ['daily','weekly','monthly','print'].forEach(p => {
        const yEl = document.getElementById(`${p}-year-select`);
        const mEl = document.getElementById(`${p}-month-select`);
        if(yEl) yEl.innerHTML = yrHtml;
        if(mEl) {
            mEl.innerHTML = msHtml;
            mEl.value = (new Date().getMonth()+1).toString().padStart(2,'0');
        }
    });
}

function updateAllDisplays() {
    const targetDate = document.getElementById('today-date-picker').value;
    Stats.displayTodayRecords(targetDate);
    Stats.displayDailyRecords();
    Stats.displayWeeklyRecords();
    Stats.displayMonthlyRecords();
}

function setupEventListeners() {
    // 운행 시작/종료/취소
    UI.els.btnStartTrip.onclick = () => {
        const data = UI.getFormDataWithoutTime();
        Data.addRecord({ id: Date.now(), date: Utils.getTodayString(), time: Utils.getCurrentTimeString(), ...data });
        Utils.showToast('운행 시작됨');
        UI.resetForm();
        updateAllDisplays();
    };

    UI.els.btnEndTrip.onclick = () => {
        Data.addRecord({ id: Date.now(), date: Utils.getTodayString(), time: Utils.getCurrentTimeString(), type: '운행종료', distance: 0, cost: 0, income: 0 });
        Utils.showToast('운행 종료');
        UI.resetForm();
        updateAllDisplays();
    };

    // 상하차지 입력 시 주소 및 거리 자동입력
    UI.els.fromCenterInput.oninput = UI.els.toCenterInput.oninput = () => {
        const f = UI.els.fromCenterInput.value.trim();
        const t = UI.els.toCenterInput.value.trim();
        if(f && t) {
            const key = `${f}-${t}`;
            if(Data.MEM_FARES[key]) UI.els.incomeInput.value = (Data.MEM_FARES[key]/10000).toFixed(2);
            if(Data.MEM_DISTANCES[key]) UI.els.manualDistanceInput.value = Data.MEM_DISTANCES[key];
        }
        UI.updateAddressDisplay();
    };

    // 기타 탭 전환 및 버튼 이벤트
    document.getElementById('refresh-btn').onclick = () => location.reload();
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.view-content').forEach(v => v.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`${btn.dataset.view}-view`).classList.add('active');
            updateAllDisplays();
        };
    });

    // 설정 페이지 전환
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

document.addEventListener("DOMContentLoaded", initialSetup);