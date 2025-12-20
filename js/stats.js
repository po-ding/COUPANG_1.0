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
            if(diff >= 0) {
                const h = Math.floor(diff/60);
                const m = Math.round(diff%60);
                duration = h > 0 ? `${h}h ${m}m` : `${m}m`;
            }
        }

        const money = r.income > 0 ? `<span class="income">+${formatToManwon(r.income)}</span>` : (r.cost > 0 ? `<span class="cost">-${formatToManwon(r.cost)}</span>` : '0');
        const mFrom = MEM_LOCATIONS[r.from]?.memo || '';
        const mTo = MEM_LOCATIONS[r.to]?.memo || '';

        tr.innerHTML = `
            <td>${r.time}</td><td>${endTime}</td><td>${duration}</td>
            <td style="text-align:left;">${r.from || ''}${mFrom ? `<span class="table-memo">${mFrom}</span>` : ''}</td>
            <td style="text-align:left;">${r.to || ''}${mTo ? `<span class="table-memo">${mTo}</span>` : ''}</td>
            <td>${r.distance ? r.distance+'k' : ''}</td><td>${money}</td>
        `;
        tbody.appendChild(tr);
    });

    let inc = 0;
    dayRecords.forEach(r => inc += (r.income || 0));
    document.getElementById('today-summary').innerHTML = `오늘 정산: <b>${formatToManwon(inc)} 만원</b>`;
}