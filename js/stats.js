import { getStatisticalDate, formatToManwon } from './utils.js';
import { MEM_RECORDS, MEM_LOCATIONS } from './data.js';

export function displayTodayRecords(date) {
    const tbody = document.querySelector('#today-records-table tbody');
    const dayRecords = MEM_RECORDS.filter(r => getStatisticalDate(r.date, r.time) === date).sort((a,b) => a.time.localeCompare(b.time));
    tbody.innerHTML = "";
    dayRecords.forEach(r => {
        const tr = document.createElement('tr');
        if (r.type === '화물운송') {
            const fL = MEM_LOCATIONS[r.from] || {}, tL = MEM_LOCATIONS[r.to] || {};
            tr.innerHTML = `<td>${r.time}</td><td>-</td><td>-</td>
                <td>${r.from}${fL.memo ? `<span class="table-memo">${fL.memo}</span>` : ''}</td>
                <td>${r.to}${tL.memo ? `<span class="table-memo">${tL.memo}</span>` : ''}</td>
                <td>${r.distance}km</td><td class="income">${formatToManwon(r.income)}</td>`;
        } else {
            tr.innerHTML = `<td>${r.time}</td><td colspan="5"><b>[${r.type}]</b> ${r.expenseItem || r.brand || ''}</td><td class="cost">${formatToManwon(r.cost || r.income)}</td>`;
        }
        tbody.appendChild(tr);
    });
}