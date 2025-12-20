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

        const money = r.income > 0 ? `<span class="income">+${formatToManwon(r.income)}</span>` : 
                     (r.cost > 0 ? `<span class="cost">-${formatToManwon(r.cost)}</span>` : '0');
        const mFrom = MEM_LOCATIONS[r.from]?.memo || '';
        const mTo = MEM_LOCATIONS[r.to]?.memo || '';

        tr.innerHTML = `
            <td data-label="시작">${r.time}</td>
            <td data-label="종료">${endTime}</td>
            <td data-label="소요">${duration}</td>
            <td data-label="상차" style="text-align:left;">${r.from || ''}${mFrom ? `<span class="table-memo">${mFrom}</span>` : ''}</td>
            <td data-label="하차" style="text-align:left;">${r.to || ''}${mTo ? `<span class="table-memo">${mTo}</span>` : ''}</td>
            <td data-label="비고">${r.distance ? r.distance+'k' : ''}</td>
            <td data-label="금액">${money}</td>
        `;
        tbody.appendChild(tr);
    });

    let totalInc = 0;
    dayRecords.forEach(r => totalInc += (r.income || 0));
    document.getElementById('today-summary').innerHTML = `오늘의 정산 합계: <b>${formatToManwon(totalInc)} 만원</b>`;
}

export function displayCurrentMonthData() {
    const month = new Date().toISOString().slice(0, 7);
    const monthRecords = MEM_RECORDS.filter(r => getStatisticalDate(r.date, r.time).startsWith(month));
    let inc = 0, exp = 0;
    monthRecords.forEach(r => { inc += (r.income || 0); exp += (r.cost || 0); });
    
    document.getElementById('current-month-title').textContent = `${month.split('-')[1]}월 실시간 요약`;
    document.getElementById('current-month-income').textContent = formatToManwon(inc) + "만";
    document.getElementById('current-month-expense').textContent = formatToManwon(exp) + "만";
    document.getElementById('current-month-net-income').textContent = formatToManwon(inc-exp) + "만";
}