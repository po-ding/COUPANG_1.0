import * as Utils from './utils.js';
import * as Data from './data.js';
import * as UI from './ui.js';
import * as Stats from './stats.js';
import * as Location from './location.js';

function init() {
    Data.loadAllData();
    UI.resetForm();
    
    const targetDate = Utils.getStatisticalDate(Utils.getTodayString(), Utils.getCurrentTimeString());
    document.getElementById('today-date-picker').value = targetDate;
    
    // 이벤트 바인딩
    UI.els.typeSelect.onchange = UI.toggleUI;
    [UI.els.fromCenterInput, UI.els.toCenterInput].forEach(input => {
        input.oninput = Location.handleTransportInput;
    });

    UI.els.btnStartTrip.onclick = () => {
        const formData = {
            type: UI.els.typeSelect.value,
            from: UI.els.fromCenterInput.value.trim(),
            to: UI.els.toCenterInput.value.trim(),
            distance: parseFloat(UI.els.manualDistanceInput.value) || 0,
            income: Math.round((parseFloat(UI.els.incomeInput.value) || 0) * 10000),
            date: Utils.getTodayString(),
            time: Utils.getCurrentTimeString()
        };
        Data.addRecord({ id: Date.now(), ...formData });
        Utils.showToast("저장되었습니다.");
        UI.resetForm();
        updateAll();
    };

    document.getElementById('go-to-settings-btn').onclick = () => {
        document.getElementById('main-page').classList.add('hidden');
        document.getElementById('settings-page').classList.remove('hidden');
        document.getElementById('go-to-settings-btn').classList.add('hidden');
        document.getElementById('back-to-main-btn').classList.remove('hidden');
    };

    document.getElementById('back-to-main-btn').onclick = () => {
        document.getElementById('main-page').classList.remove('hidden');
        document.getElementById('settings-page').classList.add('hidden');
        document.getElementById('go-to-settings-btn').classList.remove('hidden');
        document.getElementById('back-to-main-btn').classList.add('hidden');
    };

    document.getElementById('toggle-center-management').onclick = function() {
        this.nextElementSibling.classList.toggle('hidden');
        Location.displayCenterList();
    };

    window.deleteCenter = (name) => {
        if(!confirm("삭제하시겠습니까?")) return;
        Data.MEM_CENTERS.splice(Data.MEM_CENTERS.indexOf(name), 1);
        Data.saveData();
        Location.displayCenterList();
        Location.populateCenterDatalist();
    };

    updateAll();
}

function updateAll() {
    const d = document.getElementById('today-date-picker').value;
    Stats.displayTodayRecords(d);
}

document.addEventListener("DOMContentLoaded", init);