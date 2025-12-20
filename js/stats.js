import { MEM_RECORDS, MEM_LOCATIONS } from './data.js';
import { formatToManwon, getStatisticalDate } from './utils.js';
import { editRecord } from './ui.js';

export function displayTodayRecords(date) {
    const tbody = document.querySelector('#today-records-table tbody');
    const dayRecords = MEM_RECORDS.filter(r => getStatisticalDate(r.date, r.time) === date)
                                  .sort((a,b) => (a.date+a.time).localeCompare(b.date+b.time));
    
    tbody.innerHTML = '';
    dayRecords.forEach((r, idx) => {
        if(r.type === '운행종료') return;
        const tr = document.createElement('tr');
        tr.onclick = () => editRecord(r.id);

        let endTime = '-', duration = '-';
        const next = dayRecords[idx+1];
        if(next) {
            endTime = next.time;
            const diff = (new Date(`${next.date}T${next.time}`) - new Date(`${r.date}T${r.time}`)) / 60000;
            if(diff >= 0) duration = Math.floor(diff/60) > 0 ? `${Math.floor(diff/60)}h ${Math.round(diff%60)}m` : `${Math.round(diff%60)}m`;
        }

        const money = r.income > 0 ? `<span class="income">+${formatToManwon(r.income)}</span>` : (r.cost > 0 ? `<span class="cost">-${formatToManwon(r.cost)}</span>` : '0');
        const mFrom = MEM_LOCATIONS[r.from]?.memo || '';
        const mTo = MEM_LOCATIONS[r.to]?.memo || '';

        tr.innerHTML = `
            <td>${r.time}</td><td>${endTime}</td><td>${duration}</td>
            <td>${r.from || ''}${mFrom ? `<span class="table-memo">${mFrom}</span>` : ''}</td>
            <td>${r.to || ''}${mTo ? `<span class="table-memo">${mTo}</span>` : ''}</td>
            <td>${r.distance ? r.distance+'k' : ''}</td><td>${money}</td>
        `;
        tbody.appendChild(tr);
    });

    let totalInc = 0;
    dayRecords.forEach(r => totalInc += (r.income || 0));
    document.getElementById('today-summary').innerHTML = `오늘 정산: <b>${formatToManwon(totalInc)} 만원</b>`;
}