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
    MEM_CENTERS = JSON.parse(localStorage.getItem('logistics_centers')) || ['안성', '이천', '용인', '인천'];
    MEM_DISTANCES = JSON.parse(localStorage.getItem('saved_distances')) || {};
    MEM_EXPENSE_ITEMS = JSON.parse(localStorage.getItem('saved_expense_items')) || [];
}

export function saveData() {
    localStorage.setItem('records', JSON.stringify(MEM_RECORDS));
    localStorage.setItem('saved_locations', JSON.stringify(MEM_LOCATIONS));
    localStorage.setItem('saved_fares', JSON.stringify(MEM_FARES));
    localStorage.setItem('logistics_centers', JSON.stringify(MEM_CENTERS.sort()));
    localStorage.setItem('saved_distances', JSON.stringify(MEM_DISTANCES));
    localStorage.setItem('saved_expense_items', JSON.stringify(MEM_EXPENSE_ITEMS));
}

export function updateLocationData(name, addr, memo) {
    if (!name) return;
    if (!MEM_CENTERS.includes(name)) MEM_CENTERS.push(name);
    MEM_LOCATIONS[name] = { address: addr || '', memo: memo || '' };
    saveData();
}

export function addRecord(r) {
    MEM_RECORDS.push(r);
    if (r.type === '화물운송' && r.from && r.to) {
        const key = `${r.from}-${r.to}`;
        if (r.income > 0) MEM_FARES[key] = r.income;
        if (r.distance > 0) MEM_DISTANCES[key] = r.distance;
    }
    saveData();
}