export let MEM_RECORDS = [];
export let MEM_LOCATIONS = {};
export let MEM_FARES = {};
export let MEM_CENTERS = [];
export let MEM_DISTANCES = {};
export let MEM_COSTS = {};
export let MEM_EXPENSE_ITEMS = [];

export function setRecords(newRecords) {
    MEM_RECORDS.length = 0;
    MEM_RECORDS.push(...newRecords);
}

export function loadAllData() {
    MEM_RECORDS.length = 0;
    MEM_RECORDS.push(...(JSON.parse(localStorage.getItem('records')) || []));
    Object.assign(MEM_LOCATIONS, JSON.parse(localStorage.getItem('saved_locations')) || {});
    Object.assign(MEM_FARES, JSON.parse(localStorage.getItem('saved_fares')) || {});
    MEM_CENTERS.length = 0;
    MEM_CENTERS.push(...(JSON.parse(localStorage.getItem('logistics_centers')) || ['안성', '안산', '용인', '이천', '인천']));
    MEM_CENTERS.sort();
    Object.assign(MEM_DISTANCES, JSON.parse(localStorage.getItem('saved_distances')) || {});
    Object.assign(MEM_COSTS, JSON.parse(localStorage.getItem('saved_costs')) || {});
    MEM_EXPENSE_ITEMS.length = 0;
    MEM_EXPENSE_ITEMS.push(...(JSON.parse(localStorage.getItem('saved_expense_items')) || []));
}

export function saveData() {
    MEM_RECORDS.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    localStorage.setItem('records', JSON.stringify(MEM_RECORDS));
    localStorage.setItem('saved_locations', JSON.stringify(MEM_LOCATIONS));
    localStorage.setItem('saved_fares', JSON.stringify(MEM_FARES));
    localStorage.setItem('logistics_centers', JSON.stringify(MEM_CENTERS.sort()));
    localStorage.setItem('saved_distances', JSON.stringify(MEM_DISTANCES));
    localStorage.setItem('saved_costs', JSON.stringify(MEM_COSTS));
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

export function updateExpenseItemData(item) {
    const trimmed = item?.trim();
    if (trimmed && !MEM_EXPENSE_ITEMS.includes(trimmed)) {
        MEM_EXPENSE_ITEMS.push(trimmed);
        MEM_EXPENSE_ITEMS.sort();
        saveData();
    }
}

export function addRecord(record) {
    MEM_RECORDS.push(record);
    saveData();
}

export function removeRecord(id) {
    const idx = MEM_RECORDS.findIndex(r => r.id === id);
    if(idx > -1) { MEM_RECORDS.splice(idx, 1); saveData(); }
}