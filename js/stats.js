import { MEM_RECORDS, MEM_LOCATIONS } from './data.js';
import { formatToManwon, getStatisticalDate } from './utils.js';

export function displayTodayRecords(date) {
    const tbody = document.querySelector('#today-records-table tbody');
    const dayRecords = MEM_RECORDS.filter(r => getStatisticalDate(r.date, r.time) === date)
                                  .sort((a,b) => (a.date+a.time).localeCompare(b.date+b.time));
    
    tbody.innerHTML = dayRecords.map(r => {
        const locFrom = MEM_LOCATIONS[r.from] || {};
        const locTo = MEM_LOCATIONS[r.to] || {};
        const money = r.income ? `<span class="income">${formatToManwon(r.income)}</span>` : `<span class="cost">${formatToManwon(r.cost)}</span>`;
        
        return `<tr>
            <td>${r.time}</td>
            <td>-</td><td>-</td>
            <td>${r.from || ''}${locFrom.memo ? `<span class="table-memo">${locFrom.memo}</span>` : ''}</td>
            <td>${r.to || ''}${locTo.memo ? `<span class="table-memo">${locTo.memo}</span>` : ''}</td>
            <td>${r.distance || 0}km</td>
            <td>${money}</td>
        </tr>`;
    }).join('');

    // 간략 요약
    let inc = 0, exp = 0;
    dayRecords.forEach(r => { inc += (r.income || 0); exp += (r.cost || 0); });
    document.getElementById('today-summary').innerHTML = `수입: ${formatToManwon(inc)} / 지출: ${formatToManwon(exp)} / <b>정산: ${formatToManwon(inc-exp)}</b>`;
}

export function displayCurrentMonthData() {
    const month = new Date().toISOString().slice(0, 7);
    const records = MEM_RECORDS.filter(r => getStatisticalDate(r.date, r.time).startsWith(month));
    let inc = 0, exp = 0, dist = 0;
    records.forEach(r => { inc += (r.income||0); exp += (r.cost||0); dist += (r.distance||0); });
    
    document.getElementById('current-month-title').textContent = `${month} 요약`;
    document.getElementById('current-month-income').textContent = formatToManwon(inc) + "만";
    document.getElementById('current-month-expense').textContent = formatToManwon(exp) + "만";
    document.getElementById('current-month-net-income').textContent = formatToManwon(inc-exp) + "만";
    document.getElementById('current-month-total-mileage').textContent = dist + " km";
}