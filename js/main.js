import * as Utils from './utils.js';
import * as Data from './data.js';
import * as UI from './ui.js';
import * as Stats from './stats.js';

// 전역 함수 등록 (HTML에서 호출하는 경우 대비)
window.viewDateDetails = (date) => {
    document.getElementById('today-date-picker').value = date;
    const todayTab = document.querySelector('.tab-btn[data-view="today"]');
    if(todayTab) todayTab.click();
    Stats.displayTodayRecords(date);
};

function initialSetup() {
    Data.loadAllData();
    UI.renderQuickButtons();
    
    // 04시 기준 오늘 날짜 초기화
    const statToday = Utils.getStatisticalDate(Utils.getTodayString(), Utils.getCurrentTimeString());
    const picker = document.getElementById('today-date-picker');
    if(picker) picker.value = statToday;

    setupYearMonthSelectors();
    setupEventListeners();
    
    UI.resetForm();
    updateDisplays();
}

function updateDisplays() {
    const picker = document.getElementById('today-date-picker');
    if(!picker) return;
    Stats.displayTodayRecords(picker.value);
    Stats.displayDailyRecords();
    Stats.displayWeeklyRecords();
}

function setupYearMonthSelectors() {
    const y = new Date().getFullYear();
    const yrs = Array.from({length:5}, (_,i) => `<option value="${y-i}">${y-i}년</option>`).join('');
    ['daily','weekly','print'].forEach(p => {
        const el = document.getElementById(`${p}-year-select`);
        if(el) el.innerHTML = yrs;
    });
}

function setupEventListeners() {
    // 1. 설정/요약 페이지 전환
    document.getElementById('go-to-settings-btn').onclick = () => {
        document.getElementById('main-page').classList.add('hidden');
        document.getElementById('settings-page').classList.remove('hidden');
        document.getElementById('go-to-settings-btn').classList.add('hidden');
        document.getElementById('back-to-main-btn').classList.remove('hidden');
        Stats.displayCurrentMonthData();
    };

    document.getElementById('back-to-main-btn').onclick = () => {
        document.getElementById('main-page').classList.remove('hidden');
        document.getElementById('settings-page').classList.add('hidden');
        document.getElementById('go-to-settings-btn').classList.remove('hidden');
        document.getElementById('back-to-main-btn').classList.add('hidden');
        updateDisplays();
    };

    // 2. 탭 전환
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.view-content').forEach(v => v.classList.remove('active'));
            btn.classList.add('active');
            const viewId = `${btn.dataset.view}-view`;
            document.getElementById(viewId).classList.add('active');
            updateDisplays();
        };
    });

    // 3. 기록 버튼 (시작, 종료, 취소)
    document.getElementById('btn-start-trip').onclick = () => {
        const formData = UI.getFormData();
        Data.addRecord({ id: Date.now(), date: Utils.getTodayString(), time: Utils.getCurrentTimeString(), ...formData });
        Utils.showToast('운행 시작 기록됨');
        UI.resetForm();
        updateDisplays();
    };

    document.getElementById('btn-end-trip').onclick = () => {
        Data.addRecord({ id: Date.now(), date: Utils.getTodayString(), time: Utils.getCurrentTimeString(), type: '운행종료', distance: 0, cost: 0, income: 0 });
        Utils.showToast('운행 종료');
        UI.resetForm();
        updateDisplays();
    };

    document.getElementById('btn-save-general').onclick = () => {
        const formData = UI.getFormData();
        Data.addRecord({ id: Date.now(), date: UI.els.dateInput.value, time: UI.els.timeInput.value, ...formData });
        Utils.showToast('저장 완료');
        UI.resetForm();
        updateDisplays();
    };

    // 4. 데이터 백업 및 복원
    document.getElementById('export-json-btn').onclick = () => {
        const blob = new Blob([JSON.stringify({ 
            records: Data.MEM_RECORDS, 
            locations: Data.MEM_LOCATIONS, 
            centers: Data.MEM_CENTERS 
        }, null, 2)], {type: "application/json"});
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `cargo_backup_${Utils.getTodayString()}.json`;
        a.click();
    };

    document.getElementById('import-json-btn').onclick = () => document.getElementById('import-file-input').click();

    document.getElementById('import-file-input').onchange = (e) => {
        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const d = JSON.parse(evt.target.result);
                if(confirm('데이터를 덮어쓰시겠습니까?')) {
                    localStorage.setItem('records', JSON.stringify(d.records || []));
                    localStorage.setItem('saved_locations', JSON.stringify(d.locations || {}));
                    localStorage.setItem('logistics_centers', JSON.stringify(d.centers || []));
                    alert('복원 성공'); location.reload();
                }
            } catch(err) { alert('파일 오류'); }
        };
        reader.readAsText(e.target.files[0]);
    };

    // 5. 아코디언 메뉴
    document.querySelectorAll('.collapsible-header').forEach(header => {
        header.onclick = () => {
            header.classList.toggle('active');
            header.nextElementSibling.classList.toggle('hidden');
        };
    });

    // 6. 상하차지 주소 자동 표시
    UI.els.fromCenterInput.oninput = UI.els.toCenterInput.oninput = () => UI.updateAddressDisplay();

    document.getElementById('refresh-btn').onclick = () => location.reload();
}

document.addEventListener("DOMContentLoaded", initialSetup);