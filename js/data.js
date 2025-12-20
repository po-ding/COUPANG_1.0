// --- START OF FILE js/data.js ---

export let MEM_RECORDS = [];
export let MEM_LOCATIONS = {};
export let MEM_FARES = {};
export let MEM_CENTERS = [];
export let MEM_DISTANCES = {};
export let MEM_COSTS = {};
export let MEM_EXPENSE_ITEMS = [];

// [추가] 분석된 상차 빈도 기반 권역 매핑
export const REGION_GROUPS = {
    northwest: ["MNYJ2", "고양1.CFC", "남양주4", "남양주3", "남양주(이패A,B)", "MGMP", "구리3", "고양3", "남양주4(토평)", "남양주1"],
    incheon: ["인천31.32.41.42", "인천26,28", "인천45", "인천16", "인천4", "인천13", "인천14"],
    siheung: ["XRC13", "XRC10", "시흥3", "시흥2", "안산1(SH)", "안산2", "시흥1", "시흥2(SH)", "안산3", "군포1"],
    southeast: ["안성5", "용인5", "곤지암2", "이천2", "서초1(SH)", "곤지암1", "안성4", "여주1", "이천3", "경광주4", "경광주3", "서초.양재B"],
    chung: ["XRC12.성환", "목천1", "XRC11.세종", "XHM5.천안", "XRC06.성거", "천안2", "천안6", "천안8", "M아산1"]
};

export function setRecords(newRecords) {
    MEM_RECORDS.length = 0; 
    MEM_RECORDS.push(...newRecords); 
}

export function loadAllData() {
    try {
        const records = JSON.parse(localStorage.getItem('records')) || [];
        MEM_RECORDS.length = 0;
        if (Array.isArray(records)) MEM_RECORDS.push(...records);

        const locs = JSON.parse(localStorage.getItem('saved_locations')) || {};
        for (let k in MEM_LOCATIONS) delete MEM_LOCATIONS[k];
        Object.assign(MEM_LOCATIONS, locs);

        const fares = JSON.parse(localStorage.getItem('saved_fares')) || {};
        for (let k in MEM_FARES) delete MEM_FARES[k];
        Object.assign(MEM_FARES, fares);

        const centers = JSON.parse(localStorage.getItem('logistics_centers')) || [];
        MEM_CENTERS.length = 0;
        if (Array.isArray(centers)) MEM_CENTERS.push(...centers);
        
        if (MEM_CENTERS.length === 0) MEM_CENTERS.push('안성', '안산', '용인', '이천', '인천');
        MEM_CENTERS.sort(); 

        const dists = JSON.parse(localStorage.getItem('saved_distances')) || {};
        for (let k in MEM_DISTANCES) delete MEM_DISTANCES[k];
        Object.assign(MEM_DISTANCES, dists);

        const costs = JSON.parse(localStorage.getItem('saved_costs')) || {};
        for (let k in MEM_COSTS) delete MEM_COSTS[k];
        Object.assign(MEM_COSTS, costs);

        const items = JSON.parse(localStorage.getItem('saved_expense_items')) || [];
        MEM_EXPENSE_ITEMS.length = 0;
        if (Array.isArray(items)) MEM_EXPENSE_ITEMS.push(...items);

        syncHistoryToAutocompleteDB();
    } catch (e) {
        console.error("데이터 로드 중 오류:", e);
    }
}

export function saveData() {
    MEM_RECORDS.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    localStorage.setItem('records', JSON.stringify(MEM_RECORDS));
    localStorage.setItem('saved_locations', JSON.stringify(MEM_LOCATIONS));
    localStorage.setItem('saved_fares', JSON.stringify(MEM_FARES));
    MEM_CENTERS.sort();
    localStorage.setItem('logistics_centers', JSON.stringify(MEM_CENTERS));
    localStorage.setItem('saved_distances', JSON.stringify(MEM_DISTANCES));
    localStorage.setItem('saved_costs', JSON.stringify(MEM_COSTS));
    localStorage.setItem('saved_expense_items', JSON.stringify(MEM_EXPENSE_ITEMS));
}

export function updateLocationData(name, address, memo) {
    if (!name) return;
    const trimmed = name.trim();
    if (!MEM_CENTERS.includes(trimmed)) {
        MEM_CENTERS.push(trimmed);
        MEM_CENTERS.sort(); 
    }
    if (address || memo) {
        MEM_LOCATIONS[trimmed] = { ...(MEM_LOCATIONS[trimmed] || {}), address: address || (MEM_LOCATIONS[trimmed]?.address || ''), memo: memo || (MEM_LOCATIONS[trimmed]?.memo || '') };
    }
    saveData();
}

export function updateExpenseItemData(item) {
    if (!item) return;
    const trimmed = item.trim();
    if (!MEM_EXPENSE_ITEMS.includes(trimmed)) {
        MEM_EXPENSE_ITEMS.push(trimmed);
        MEM_EXPENSE_ITEMS.sort();
        saveData();
    }
}

export function syncHistoryToAutocompleteDB() {
    let updated = false;
    MEM_RECORDS.forEach(r => {
        if (r.type === '화물운송' && r.from && r.to) {
            const key = `${r.from.trim()}-${r.to.trim()}`;
            if (r.income > 0 && !MEM_FARES[key]) { MEM_FARES[key] = r.income; updated = true; }
            if (r.distance > 0 && !MEM_DISTANCES[key]) { MEM_DISTANCES[key] = r.distance; updated = true; }
            if (r.cost > 0 && !MEM_COSTS[key]) { MEM_COSTS[key] = r.cost; updated = true; }
        }
    });
    if (updated) saveData();
}

export function addRecord(record) {
    if (record.type === '화물운송' && record.from && record.to) {
        const key = `${record.from}-${record.to}`;
        if(record.income > 0) MEM_FARES[key] = record.income;
        if(record.distance > 0) MEM_DISTANCES[key] = record.distance;
        if(record.cost > 0) MEM_COSTS[key] = record.cost;
    }
    MEM_RECORDS.push(record);
    saveData();
}

export function removeRecord(id) {
    const idx = MEM_RECORDS.findIndex(r => r.id === id);
    if(idx > -1) {
        MEM_RECORDS.splice(idx, 1);
        saveData();
    }
}