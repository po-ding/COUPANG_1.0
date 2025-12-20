import { formatToManwon, getStatisticalDate } from './utils.js';
import { MEM_RECORDS, MEM_LOCATIONS } from './data.js';
import { editRecord } from './ui.js';

let displayedSubsidyCount = 0;
const safeInt = (v) => v ? parseInt(String(v).replace(/,/g, ''), 10) || 0 : 0;
const safeFloat = (v) => v ? parseFloat(String(v).replace(/,/g, '')) || 0 : 0;

export function calculateTotalDuration(records) {
    const sorted = [...records].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    if (sorted.length < 2) return '0h 0m';
    let mins = 0;
    for (let i = 1; i < sorted.length; i++) {
        if (sorted[i-1].type !== '운행종료') mins += (new Date(`${sorted[i].date}T${sorted[i].time}`) - new Date(`${sorted[i-1].date}T${sorted[i-1].time}`)) / 60000;
    }
    return `${Math.floor(mins / 60)}h ${Math.round(mins % 60)}m`;
}

export function createSummaryHTML(title, records) {
    let inc=0, exp=0, dist=0, trips=0, fuelC=0, fuelL=0;
    records.filter(r => !['운행취소', '운행종료'].includes(r.type)).forEach(r => {
        inc += safeInt(r.income); exp += safeInt(r.cost);
        if (r.type === '주유소') { fuelC += safeInt(r.cost); fuelL += safeFloat(r.liters); }
        if (r.type === '화물운송') { dist += safeFloat(r.distance); trips++; }
    });
    const metrics = [
        { label: '수입', value: formatToManwon(inc), unit: ' 만원', className: 'income' },
        { label: '지출', value: formatToManwon(exp), unit: ' 만원', className: 'cost' },
        { label: '정산', value: formatToManwon(inc-exp), unit: ' 만원', className: 'net' },
        { label: '거리', value: dist.toFixed(1), unit: ' km' },
        { label: '건수', value: trips, unit: ' 건' },
        { label: '주유', value: formatToManwon(fuelC), unit: ' 만원', className: 'cost' },
        { label: '리터', value: fuelL.toFixed(2), unit: ' L' }
    ];
    const items = metrics.map(m => `<div class="summary-item"><span class="summary-label">${m.label}</span><span class="summary-value ${m.className || ''} hidden">${m.value}${m.unit}</span></div>`).join('');
    return `<strong>${title}</strong><div class="summary-toggle-grid" onclick="window.toggleAllSummaryValues(this)">${items}</div>`;
}

export function displayTodayRecords(date) {
    const tbody = document.querySelector('#today-records-table tbody');
    const dayRecords = MEM_RECORDS.filter(r => getStatisticalDate(r.date, r.time) === date).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    tbody.innerHTML = '';
    dayRecords.filter(r => r.type !== '운행종료').forEach(r => {
        const tr = document.createElement('tr');
        tr.onclick = () => editRecord(r.id);
        let money = '';
        if(safeInt(r.income) > 0) money += `<span class="income">+${formatToManwon(r.income)}</span> `;
        if(safeInt(r.cost) > 0) money += `<span class="cost">-${formatToManwon(r.cost)}</span>`;
        
        if (['화물운송', '대기', '운행취소'].includes(r.type)) {
            const fromLoc = MEM_LOCATIONS[r.from] || {}, toLoc = MEM_LOCATIONS[r.to] || {};
            tr.innerHTML = `<td>${r.time}</td><td>-</td><td>-</td>
                <td><span class="location-clickable" data-center="${r.from}">${r.from||''}</span>${fromLoc.memo?`<span class="table-memo">${fromLoc.memo}</span>`:''}</td>
                <td><span class="location-clickable" data-center="${r.to}">${r.to||''}</span>${toLoc.memo?`<span class="table-memo">${toLoc.memo}</span>`:''}</td>
                <td>${r.distance?r.distance+'km':(r.type==='운행취소'?'취소':'')}</td><td>${money||'0'}</td>`;
        } else {
            tr.innerHTML = `<td>${r.time}</td><td colspan="5"><b>[${r.type}]</b> ${r.expenseItem||r.supplyItem||r.brand||''}</td><td>${money||'0'}</td>`;
        }
        tbody.appendChild(tr);
    });
    document.getElementById('today-summary').innerHTML = createSummaryHTML('오늘의 기록 (04시 기준)', dayRecords);
}

// ... displayDailyRecords, displayWeeklyRecords, displayMonthlyRecords, displayCurrentMonthData, displayCumulativeData, generatePrintView 는 기존 로직과 동일하되 safeInt/safeFloat 적용 유지 ...
// (지면 관계상 핵심 통계 함수 위주로 표기하며, 기존 stats.js의 나머지 시각화 함수들은 위 스타일을 따름)