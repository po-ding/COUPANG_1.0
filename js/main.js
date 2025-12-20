import * as Utils from './utils.js';
import * as Data from './data.js';
import * as UI from './ui.js';
import * as Stats from './stats.js';
import * as Location from './location.js';

function init() {
    Data.loadAllData();
    UI.resetForm();
    
    // 초기 날짜 설정
    const targetDate = Utils.getStatisticalDate(Utils.getTodayString(), Utils.getCurrentTimeString());
    document.getElementById('today-date-picker').value = targetDate;
    
    // 이벤트 바인딩
    UI.els.typeSelect.onchange = UI.toggleUI;
    [UI.els.fromCenterInput, UI.els.toCenterInput].forEach(el => el.oninput = Location.handleTransportInput);

    // 저장 로직
    UI.els.btnStartTrip.onclick = () => {
        const d = {
            id: Date.now(), date: Utils.getTodayString(), time: Utils.getCurrentTimeString(),
            type: UI.els.typeSelect.value, from: UI.els.fromCenterInput.value.trim(),
            to: UI.els.toCenterInput.value.trim(), distance: parseFloat(UI.els.manualDistanceInput.value) || 0,
            income: Math.round((parseFloat(UI.els.incomeInput.value) || 0) * 10000)
        };
        Data.addRecord(d);
        Utils.showToast("기록되었습니다.");
        UI.resetForm();
        updateAll();
    };

    // 설정 페이지 전환
    document.getElementById('go-to-settings-btn').onclick = () => {
        document.getElementById('main-page').classList.add('hidden');
        document.getElementById('settings-page').classList.remove('hidden');
        document.getElementById('go-to-settings-btn').classList.add('hidden');
        document.getElementById('back-to-main-btn').classList.remove('hidden');
        Stats.displayCumulativeData();
    };

    document.getElementById('back-to-main-btn').onclick = () => {
        document.getElementById('main-page').classList.remove('hidden');
        document.getElementById('settings-page').classList.add('hidden');
        document.getElementById('go-to-settings-btn').classList.remove('hidden');
        document.getElementById('back-to-main-btn').classList.add('hidden');
        updateAll();
    };

    // 아코디언 메뉴
    document.querySelectorAll('.collapsible-header').forEach(h => {
        h.onclick = () => { h.classList.toggle('active'); h.nextElementSibling.classList.toggle('hidden'); if(h.id==='toggle-center-management') Location.displayCenterList(); };
    });

    // 전역 함수 연결
    window.deleteCenter = (name) => {
        if(!confirm("삭제?")) return;
        Data.MEM_CENTERS.splice(Data.MEM_CENTERS.indexOf(name), 1);
        Data.saveData();
        Location.displayCenterList();
        Location.populateCenterDatalist();
    };
    
    // 수정 함수 연결
    window.editRecord = (id) => {
        const r = Data.MEM_RECORDS.find(x => x.id === id);
        if(!r) return;
        UI.els.dateInput.value = r.date; UI.els.timeInput.value = r.time; UI.els.typeSelect.value = r.type;
        UI.els.fromCenterInput.value = r.from || ''; UI.els.toCenterInput.value = r.to || '';
        UI.els.manualDistanceInput.value = r.distance || 0;
        UI.els.incomeInput.value = (r.income/10000) || 0; UI.els.costInput.value = (r.cost/10000) || 0;
        UI.els.editIdInput.value = id; UI.els.editModeIndicator.classList.remove('hidden');
        UI.toggleUI(); Location.handleTransportInput();
        window.scrollTo(0,0);
    };

    updateAll();
}

function updateAll() {
    Stats.displayTodayRecords(document.getElementById('today-date-picker').value);
}

document.addEventListener("DOMContentLoaded", init);