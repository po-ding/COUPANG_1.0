import { getTodayString, getCurrentTimeString } from './utils.js';
import { MEM_LOCATIONS, MEM_CENTERS, updateLocationData, saveData, MEM_RECORDS, MEM_EXPENSE_ITEMS } from './data.js';

const REGIONS = {
    "인천": ["인천"],
    "남양주/구리": ["남양주", "구리", "MNYJ"],
    "시흥/안산/부천": ["시흥", "안산", "부천", "군포", "안양"],
    "용인/이천/광주": ["용인", "이천", "경광주", "곤지암", "마장"],
    "안성/여주": ["안성", "여주", "M안성"],
    "천안/아산/세종": ["천안", "아산", "세종", "성환", "성거", "XRC", "XHM"],
    "고양/김포": ["고양", "MGMP"]
};

export function getRegionOfCenter(name) {
    for (const [r, keywords] of Object.entries(REGIONS)) {
        if (keywords.some(k => name.includes(k))) return r;
    }
    return "기타";
}

export function renderQuickShortcuts() {
    const tabContainer = document.getElementById('quick-region-tabs');
    const chipContainer = document.getElementById('quick-center-chips');
    if(!tabContainer || !chipContainer) return;

    const groups = { "기타": [] };
    Object.keys(REGIONS).forEach(r => groups[r] = []);
    MEM_CENTERS.forEach(c => groups[getRegionOfCenter(c)].push(c));

    tabContainer.innerHTML = '';
    Object.keys(groups).forEach(region => {
        if (groups[region].length === 0) return;
        const btn = document.createElement('button');
        btn.type = 'button'; btn.className = 'region-btn'; btn.textContent = region;
        btn.onclick = () => {
            tabContainer.querySelectorAll('.region-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            chipContainer.innerHTML = '';
            groups[region].forEach(c => {
                const chip = document.createElement('div');
                chip.className = `chip`;
                chip.textContent = c;
                chip.onclick = () => {
                    const from = document.getElementById('from-center');
                    const to = document.getElementById('to-center');
                    if (!from.value) from.value = c;
                    else to.value = c;
                    from.dispatchEvent(new Event('input'));
                };
                chipContainer.appendChild(chip);
            });
        };
        tabContainer.appendChild(btn);
    });
}

export function displayCenterList(filter='') {
    const container = document.getElementById('center-list-container');
    if(!container) return;
    container.innerHTML = "";
    const filtered = MEM_CENTERS.filter(c => c.includes(filter));
    const groups = {};
    filtered.forEach(c => {
        const r = getRegionOfCenter(c);
        if(!groups[r]) groups[r] = [];
        groups[r].push(c);
    });

    Object.keys(groups).sort().forEach(region => {
        const title = document.createElement('div');
        title.className = 'settings-region-title';
        title.textContent = region;
        container.appendChild(title);
        groups[region].forEach(c => {
            const div = document.createElement('div');
            div.className = 'center-item';
            div.innerHTML = `<span>${c}</span><button class="del-btn">삭제</button>`;
            div.querySelector('.del-btn').onclick = () => {
                if(confirm('삭제?')) {
                    MEM_CENTERS.splice(MEM_CENTERS.indexOf(c), 1);
                    saveData(); displayCenterList(filter);
                }
            };
            container.appendChild(div);
        });
    });
}

export function toggleUI() {
    const type = document.getElementById('type').value;
    const transport = document.getElementById('transport-details');
    transport.classList.toggle('hidden', type !== '화물운송');
}

export function resetForm() {
    document.getElementById('record-form').reset();
    document.getElementById('date').value = getTodayString();
    document.getElementById('time').value = getCurrentTimeString();
    toggleUI();
}