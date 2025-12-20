export let MEM_RECORDS = [];
export let MEM_LOCATIONS = {};
export let MEM_FARES = {};
export let MEM_CENTERS = [];
export let MEM_DISTANCES = {};
export let MEM_EXPENSE_ITEMS = [];

export function loadAllData() {
    MEM_RECORDS = JSON.parse(localStorage.getItem('records')) || [];
    MEM_LOCATIONS = JSON.parse(localStorage.getItem('saved_locations')) || {};
    MEM_FARES = JSON.parse(localStorage.getItem('saved_fares')) || {};
    MEM_CENTERS = JSON.parse(localStorage.getItem('logistics_centers')) || ['안성', '이천', '용인', '인천', '안산', '부천', '남양주'];
    MEM_DISTANCES = JSON.parse(localStorage.getItem('saved_distances')) || {};
    MEM_EXPENSE_ITEMS = JSON.parse(localStorage.getItem('saved_expense_items')) || [];
    
    MEM_CENTERS.sort();
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

export function updateLocationData(name, address, memo) {
    if (!name) return;
    const trimmed = name.trim();
    if (!MEM_CENTERS.includes(trimmed)) MEM_CENTERS.push(trimmed);
    MEM_LOCATIONS[trimmed] = {
        address: address || (MEM_LOCATIONS[trimmed]?.address || ''),
        memo: memo || (MEM_LOCATIONS[trimmed]?.memo || '')
    };
    saveData();
}

export function addRecord(record) {
    MEM_RECORDS.push(record);
    if (record.type === '화물운송' && record.from && record.to) {
        const key = `${record.from}-${record.to}`;
        if (record.income > 0) MEM_FARES[key] = record.income;
        if (record.distance > 0) MEM_DISTANCES[key] = record.distance;
    }
    saveData();
}

export function removeRecord(id) {
    const idx = MEM_RECORDS.findIndex(r => r.id === id);
    if(idx > -1) {
        MEM_RECORDS.splice(idx, 1);
        saveData();
    }
}