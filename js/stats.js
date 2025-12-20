import { MEM_RECORDS, MEM_LOCATIONS } from './data.js';
import { formatToManwon, getStatisticalDate } from './utils.js';
import { editRecord } from './ui.js';

export function displayTodayRecords(date) {
    const tbody = document.querySelector('#today-records-table tbody');
    const dayRecords = MEM_RECORDS.filter(r => getStatisticalDate(r.date, r.time) === date)
                                  .sort((a,b) => (a.date+a.time).localeCompare(b.date+b.time));
    
    tbody.innerHTML = '';
    
    dayRecords.forEach((r, idx) => {
        if (r.type === '운행종료') return;

        const tr = document.createElement('tr');
        tr.onclick = () => editRecord(r.id);

        // 종료 시간 및 소요 시간 계산
        let endTime = '진행중';
        let duration = '-';
        const nextRecord = dayRecords[idx + 1];
        if (nextRecord) {
            endTime = nextRecord.time;
            const start = new Date(`${r.date}T${r.time}`);
            const end = new Date(`${nextRecord.date}T${nextRecord.time}`);
            const diff = (end - start) / 60000;
            if (diff >= 0) {
                const h = Math.floor(diff / 60);
                const m = Math.round(diff % 60);
                duration = h > 0 ? `${h}h ${m}m` : `${m}m`;
            }
        }

        const money = r.income > 0 ? `<span class="income">+${formatToManwon(r.income)}</span>` : 
                     (r.cost > 0 ? `<span class="cost">-${formatToManwon(r.cost)}</span>` : '0');

        const locFrom = MEM_LOCATIONS[r.from] || {};
        const locTo = MEM_LOCATIONS[r.to] || {};

        if (r.type === '화물운송' || r.type === '대기' || r.type === '운행취소') {
            tr.innerHTML = `
                <td data-label="시작">${r.time}</td>
                <td data-label="종료">${endTime}</td>
                <td data-label="소요">${duration}</td>
                <td data-label="상차">${r.from || ''}${locFrom.memo ? `<span class="table-memo">${locFrom.memo}</span>` : ''}</td>
                <td data-label="하차">${r.to || ''}${locTo.memo ? `<span class="table-memo">${locTo.memo}</span>` : ''}</td>
                <td data-label="비고">${r.type === '운행취소' ? '취소' : (r.distance ? r.distance+'km' : '')}</td>
                <td data-label="금액">${money}</td>
            `;
        } else {
            tr.innerHTML = `
                <td data-label="시작">${r.time}</td>
                <td colspan="5" style="text-align:left; padding-left:10px;"><b>[${r.type}]</b> ${r.expenseItem || r.supplyItem || ''}</td>
                <td data-label="금액">${money}</td>
            `;
        }
        tbody.appendChild(tr);
    });

    let inc = 0, exp = 0;
    dayRecords.forEach(r => { if(r.type !== '운행취소') { inc += (r.income||0); exp += (r.cost||0); }});
    document.getElementById('today-summary').innerHTML = `수입: ${formatToManwon(inc)} / 지출: ${formatToManwon(exp)} / <b>정산: ${formatToManwon(inc-exp)}만</b>`;
}