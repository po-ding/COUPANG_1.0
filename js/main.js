// --- START OF FILE js/main.js ---

import * as Utils from './utils.js';
import * as Data from './data.js';
import * as UI from './ui.js';
import * as Stats from './stats.js';

window.viewDateDetails = function(date) { 
    document.getElementById('today-date-picker').value = date; 
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove("active")); 
    document.querySelector('.tab-btn[data-view="today"]').classList.add("active"); 
    document.querySelectorAll('.view-content').forEach(c => c.classList.remove('active')); 
    document.getElementById("today-view").classList.add("active"); Stats.displayTodayRecords(date); 
};

window.toggleAllSummaryValues = function(gridElement) { 
    const isShowing = gridElement.classList.toggle('active'); 
    gridElement.querySelectorAll('.summary-item').forEach(item => { 
        if(isShowing) { item.classList.add('active'); item.querySelector('.summary-value').classList.remove('hidden'); } 
        else { item.classList.remove('active'); item.querySelector('.summary-value').classList.add('hidden'); } 
    }); 
};

function initialSetup() {
    Data.loadAllData();
    UI.populateCenterDatalist();
    UI.populateExpenseDatalist();
    UI.setupRegionButtons();
    
    const y = new Date().getFullYear(); const yrs = []; for(let i=0; i<5; i++) yrs.push(`<option value="${y-i}">${y-i}년</option>`);
    [document.getElementById('daily-year-select'), document.getElementById('weekly-year-select'), document.getElementById('monthly-year-select'), document.getElementById('print-year-select')].forEach(el => el.innerHTML = yrs.join(''));
    const ms = []; for(let i=1; i<=12; i++) ms.push(`<option value="${i.toString().padStart(2,'0')}">${i}월</option>`);
    [document.getElementById('daily-month-select'), document.getElementById('weekly-month-select'), document.getElementById('print-month-select')].forEach(el => { el.innerHTML = ms.join(''); el.value = (new Date().getMonth()+1).toString().padStart(2,'0'); });

    document.getElementById('mileage-correction').value = localStorage.getItem('mileage_correction') || 0;
    document.getElementById('subsidy-limit').value = localStorage.getItem('fuel_subsidy_limit') || 0;
    
    const statToday = Utils.getStatisticalDate(Utils.getTodayString(), Utils.getCurrentTimeString());
    document.getElementById('today-date-picker').value = statToday;
    UI.resetForm(); updateAllDisplays();

    document.getElementById('ocr-input').addEventListener('change', (e) => { if (e.target.files.length > 0) UI.processReceiptImage(e.target.files[0]); });
    const ocrIds = ['ocr-cost', 'ocr-liters', 'ocr-price', 'ocr-subsidy'];
    ocrIds.forEach(id => document.getElementById(id).addEventListener('input', () => {
        const lit = parseFloat(document.getElementById('ocr-liters').value)||0, pr = parseInt(document.getElementById('ocr-price').value)||0;
        let c = parseInt(document.getElementById('ocr-cost').value)||0;
        if ((document.activeElement.id==='ocr-liters'||document.activeElement.id==='ocr-price') && lit>0 && pr>0) { c = Math.round(lit*pr); document.getElementById('ocr-cost').value = c; }
        document.getElementById('ocr-net-cost').value = c - (parseInt(document.getElementById('ocr-subsidy').value)||0);
    }));

    document.getElementById('btn-retry-ocr').addEventListener('click', () => {
        ['ocr-date', 'ocr-time', 'ocr-cost', 'ocr-liters', 'ocr-price', 'ocr-subsidy', 'ocr-remaining', 'ocr-net-cost'].forEach(id => document.getElementById(id).value = '');
        document.getElementById('ocr-input').value = ''; document.getElementById('ocr-result-container').classList.add('hidden'); document.getElementById('ocr-status').textContent = '';
    });

    document.getElementById('btn-save-ocr').addEventListener('click', () => {
        const cost = parseInt(document.getElementById('ocr-cost').value)||0, lit = parseFloat(document.getElementById('ocr-liters').value)||0;
        if (cost===0 && lit===0) { alert("내역 확인요망"); return; }
        Data.addRecord({ id: Date.now(), date: document.getElementById('ocr-date').value||Utils.getTodayString(), time: document.getElementById('ocr-time').value||"12:00", type: '주유소', cost: cost, income: 0, distance: 0, liters: lit, unitPrice: parseInt(document.getElementById('ocr-price').value)||0, subsidy: parseInt(document.getElementById('ocr-subsidy').value)||0, brand: "기타" });
        Utils.showToast("저장됨"); document.getElementById('btn-retry-ocr').click(); updateAllDisplays(); Stats.displaySubsidyRecords(); Stats.displayCurrentMonthData();
    });
}

function updateAllDisplays() {
    const d = document.getElementById('today-date-picker').value || Utils.getStatisticalDate(Utils.getTodayString(), Utils.getCurrentTimeString());
    Stats.displayTodayRecords(d); Stats.displayDailyRecords(); Stats.displayWeeklyRecords(); Stats.displayMonthlyRecords();
}

UI.els.btnTripCancel.addEventListener('click', () => { Data.addRecord({ id: Date.now(), date: Utils.getTodayString(), time: Utils.getCurrentTimeString(), ...UI.getFormDataWithoutTime(), type: '운행취소' }); Utils.showToast('저장됨'); UI.resetForm(); updateAllDisplays(); });
UI.els.btnStartTrip.addEventListener('click', () => { const f = UI.getFormDataWithoutTime(); if (f.type==='화물운송' && f.distance<=0) { alert('거리 입력 필수'); return; } Data.addRecord({ id: Date.now(), date: Utils.getTodayString(), time: Utils.getCurrentTimeString(), ...f }); Utils.showToast('저장됨'); UI.resetForm(); updateAllDisplays(); });
UI.els.btnEndTrip.addEventListener('click', () => { Data.addRecord({ id: Date.now(), date: Utils.getTodayString(), time: Utils.getCurrentTimeString(), type: '운행종료', distance: 0, cost: 0, income: 0 }); Utils.showToast('종료됨'); UI.resetForm(); updateAllDisplays(); });
UI.els.btnSaveGeneral.addEventListener('click', () => { const f = UI.getFormDataWithoutTime(); Data.addRecord({ id: Date.now(), date: UI.els.dateInput.value, time: UI.els.timeInput.value, ...f }); if(['지출','수입'].includes(f.type)&&f.expenseItem) Data.updateExpenseItemData(f.expenseItem); Utils.showToast('저장됨'); UI.populateExpenseDatalist(); UI.resetForm(); updateAllDisplays(); if(f.type==='주유소') Stats.displaySubsidyRecords(); });
UI.els.btnUpdateRecord.addEventListener('click', () => {
    const id = parseInt(UI.els.editIdInput.value); const idx = Data.MEM_RECORDS.findIndex(r => r.id === id);
    if (idx > -1) { const f = UI.getFormDataWithoutTime(); Data.MEM_RECORDS[idx] = { ...Data.MEM_RECORDS[idx], ...f }; Data.saveData(); Utils.showToast('수정됨'); UI.resetForm(); updateAllDisplays(); }
});
UI.els.btnDeleteRecord.addEventListener('click', () => { if(confirm('삭제?')) { Data.removeRecord(parseInt(UI.els.editIdInput.value)); UI.resetForm(); updateAllDisplays(); }});
UI.els.btnCancelEdit.addEventListener('click', UI.resetForm);

[UI.els.fromCenterInput, UI.els.toCenterInput].forEach(el => el.addEventListener('input', () => {
    const f = UI.els.fromCenterInput.value.trim(), t = UI.els.toCenterInput.value.trim();
    if (f && t) { const k = `${f}-${t}`; if(Data.MEM_FARES[k]) UI.els.incomeInput.value = (Data.MEM_FARES[k]/10000).toFixed(2); if(Data.MEM_DISTANCES[k]) UI.els.manualDistanceInput.value = Data.MEM_DISTANCES[k]; }
    UI.updateAddressDisplay();
}));
UI.els.fromCenterInput.addEventListener('focus', () => UI.populateCenterDatalist());
UI.els.toCenterInput.addEventListener('focus', () => UI.populateCenterDatalist());

document.getElementById('go-to-settings-btn').addEventListener("click", () => { document.getElementById('main-page').classList.add("hidden"); document.getElementById('settings-page').classList.remove("hidden"); document.getElementById('go-to-settings-btn').classList.add("hidden"); document.getElementById('back-to-main-btn').classList.remove("hidden"); Stats.displayCumulativeData(); Stats.displayCurrentMonthData(); });
document.getElementById('back-to-main-btn').addEventListener("click", () => { document.getElementById('main-page').classList.remove("hidden"); document.getElementById('settings-page').classList.add("hidden"); document.getElementById('go-to-settings-btn').classList.remove("hidden"); document.getElementById('back-to-main-btn').classList.add("hidden"); updateAllDisplays(); });
document.querySelectorAll('.collapsible-header').forEach(h => h.addEventListener("click", () => { h.classList.toggle("active"); h.nextElementSibling.classList.toggle("hidden"); if(h.id==='toggle-subsidy-management'&&!h.nextElementSibling.classList.contains('hidden')) Stats.displaySubsidyRecords(); if(h.id==='toggle-center-management'&&!h.nextElementSibling.classList.contains('hidden')) UI.displayCenterList(); }));

document.getElementById('prev-day-btn').addEventListener('click', () => { const p = document.getElementById('today-date-picker'); const d = new Date(p.value); d.setDate(d.getDate()-1); p.value = d.toISOString().split('T')[0]; updateAllDisplays(); });
document.getElementById('next-day-btn').addEventListener('click', () => { const p = document.getElementById('today-date-picker'); const d = new Date(p.value); d.setDate(d.getDate()+1); p.value = d.toISOString().split('T')[0]; updateAllDisplays(); });
document.getElementById('today-date-picker').addEventListener('change', updateAllDisplays);
document.getElementById('refresh-btn').addEventListener('click', () => location.reload());

document.querySelectorAll('.tab-btn').forEach(btn => btn.addEventListener("click", (e) => {
    if(btn.parentElement.classList.contains('view-tabs')) {
        document.querySelectorAll('.view-tabs .tab-btn').forEach(b => b.classList.remove("active")); btn.classList.add("active");
        document.querySelectorAll('.view-content').forEach(c => c.classList.remove('active')); document.getElementById(btn.dataset.view + "-view").classList.add("active"); updateAllDisplays();
    }
}));

document.getElementById('export-json-btn').addEventListener('click', () => {
    const d = { records: Data.MEM_RECORDS, centers: Data.MEM_CENTERS, locations: Data.MEM_LOCATIONS, fares: Data.MEM_FARES, distances: Data.MEM_DISTANCES, costs: Data.MEM_COSTS, subsidy: localStorage.getItem('fuel_subsidy_limit'), correction: localStorage.getItem('mileage_correction'), expenseItems: Data.MEM_EXPENSE_ITEMS };
    const b = new Blob([JSON.stringify(d,null,2)],{type:"application/json"}); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download=`backup_${Utils.getTodayString()}.json`; a.click();
});
document.getElementById('import-json-btn').addEventListener('click', () => document.getElementById('import-file-input').click());
document.getElementById('import-file-input').addEventListener('change', (e) => {
    if(!confirm('복원?')) return; const r = new FileReader(); r.onload = (evt) => {
        const d = JSON.parse(evt.target.result); if(d.records) localStorage.setItem('records', JSON.stringify(d.records)); if(d.centers) localStorage.setItem('logistics_centers', JSON.stringify(d.centers));
        if(d.locations) localStorage.setItem('saved_locations', JSON.stringify(d.locations)); if(d.expenseItems) localStorage.setItem('saved_expense_items', JSON.stringify(d.expenseItems)); location.reload();
    }; r.readAsText(e.target.files[0]);
});

document.addEventListener("DOMContentLoaded", initialSetup);