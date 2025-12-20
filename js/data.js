// --- START OF FILE js/data.js ---
export let MEM_RECORDS = [];
export let MEM_LOCATIONS = {};
export let MEM_FARES = {};
export let MEM_CENTERS = [];
export let MEM_DISTANCES = {};
export let MEM_COSTS = {};
export let MEM_EXPENSE_ITEMS = [];

// [분석 반영] 상차 빈도순 권역 데이터
export const REGION_GROUPS = {
    northwest: ["MNYJ2", "고양1.CFC", "남양주4", "남양주3", "MGMP", "남양주(이패A,B)", "구리3", "남양주4(토평)", "남양주1", "고양3"],
    incheon: ["인천31.32.41.42", "인천26,28", "인천45", "인천16", "인천4", "인천13", "인천14"],
    siheung: ["XRC13", "XRC10", "시흥3", "시흥2", "안산1(SH)", "안산2", "시흥1", "시흥2(SH)", "안산3", "군포1"],
    southeast: ["안성5", "용인5", "곤지암2", "이천2", "서초1(SH)", "곤지암1", "안성4", "여주1", "이천3", "경광주4", "경광주3", "서초.양재B"],
    chung: ["XRC12.성환", "목천1", "XRC11.세종", "XHM5.천안", "XRC06.성거", "천안2", "천안6", "천안8", "M아산1"]
};

export function loadAllData() {
    try {
        MEM_RECORDS = JSON.parse(localStorage.getItem('records')) || [];
        MEM_LOCATIONS = JSON.parse(localStorage.getItem('saved_locations')) || {};
        MEM_FARES = JSON.parse(localStorage.getItem('saved_fares')) || {};
        MEM_CENTERS = JSON.parse(localStorage.getItem('logistics_centers')) || ['남양주4', '인천31.32.41.42', '고양1.CFC'];
        MEM_DISTANCES = JSON.parse(localStorage.getItem('saved_distances')) || {};
        MEM_COSTS = JSON.parse(localStorage.getItem('saved_costs')) || {};
        MEM_EXPENSE_ITEMS = JSON.parse(localStorage.getItem('saved_expense_items')) || [];
    } catch (e) { console.error(e); }
}

export function saveData() {
    MEM_RECORDS.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    localStorage.setItem('records', JSON.stringify(MEM_RECORDS));
    localStorage.setItem('saved_locations', JSON.stringify(MEM_LOCATIONS));
    localStorage.setItem('saved_fares', JSON.stringify(MEM_FARES));
    localStorage.setItem('logistics_centers', JSON.stringify(MEM_CENTERS));
    localStorage.setItem('saved_distances', JSON.stringify(MEM_DISTANCES));
    localStorage.setItem('saved_expense_items', JSON.stringify(MEM_EXPENSE_ITEMS));
}

export function addRecord(record) {
    MEM_RECORDS.push(record);
    saveData();
}

export function removeRecord(id) {
    const idx = MEM_RECORDS.findIndex(r => r.id === id);
    if(idx > -1) { MEM_RECORDS.splice(idx, 1); saveData(); }
}