// --- START OF FILE js/stats.js ---
import { formatToManwon, getStatisticalDate, getTodayString } from './utils.js';
import { MEM_RECORDS, MEM_LOCATIONS } from './data.js';
import { editRecord } from './ui.js';

let displayedSubsidyCount = 0;
function safeInt(v) { return parseInt(String(v||0).replace(/,/g,''))||0; }
function safeFloat(v) { return parseFloat(String(v||0).replace(/,/g,''))||0; }

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
            if(diff >= 0) duration = diff > 60 ? `${Math.floor(diff/60)}h ${Math.round(diff%60)}m` : `${Math.round(diff%60)}m`;
        }
        
        const money = r.income > 0 ? `<span class="income">+${formatToManwon(r.income)}</span>` : (r.cost > 0 ? `<span class="cost">-${formatToManwon(r.cost)}</span>` : '0');
        const mFrom = MEM_LOCATIONS[r.from]?.memo || '';
        const mTo = MEM_LOCATIONS[r.to]?.memo || '';

        tr.innerHTML = `
            <td data-label="시작">${r.time}</td><td data-label="종료">${endTime}</td><td data-label="소요">${duration}</td>
            <td data-label="상차" style="text-align:left;">${r.from||''}${mFrom?`<span class="table-memo">${mFrom}</span>`:''}</td>
            <td data-label="하차" style="text-align:left;">${r.to||''}${mTo?`<span class="table-memo">${mTo}</span>`:''}</td>
            <td data-label="비고">${r.distance?r.distance+'k':''}</td><td data-label="금액">${money}</td>
        `;
        tbody.appendChild(tr);
    });
    
    let inc=0, exp=0;
    dayRecords.forEach(r => { inc += (r.income||0); exp += (r.cost||0); });
    document.getElementById('today-summary').innerHTML = `오늘 수입: ${formatToManwon(inc)} / 지출: ${formatToManwon(exp)} / <b>정산: ${formatToManwon(inc-exp)}만</b>`;
}

export function displayCurrentMonthData() {
    const d = new Date(); if(d.getHours()<4) d.setDate(d.getDate()-1);
    const sel = d.toISOString().slice(0,7);
    const recs = MEM_RECORDS.filter(r => getStatisticalDate(r.date, r.time).startsWith(sel));
    let inc=0, exp=0, cnt=0, dist=0;
    recs.forEach(r => { inc+=safeInt(r.income); exp+=safeInt(r.cost); if(r.type==='화물운송'){cnt++; dist+=safeFloat(r.distance);} });
    
    document.getElementById('current-month-title').textContent = `${parseInt(sel.slice(5))}월 실시간 요약`;
    document.getElementById('current-month-operating-days').textContent = new Set(recs.map(r=>getStatisticalDate(r.date, r.time))).size + '일';
    document.getElementById('current-month-trip-count').textContent = cnt + '건';
    document.getElementById('current-month-total-mileage').textContent = dist.toFixed(1) + 'km';
    document.getElementById('current-month-income').textContent = formatToManwon(inc) + '만';
    document.getElementById('current-month-expense').textContent = formatToManwon(exp) + '만';
    document.getElementById('current-month-net-income').textContent = formatToManwon(inc-exp) + '만';
}

export function displayCumulativeData() {
    let inc=0, exp=0, cnt=0, dist=0;
    MEM_RECORDS.forEach(r => { inc+=safeInt(r.income); exp+=safeInt(r.cost); if(r.type==='화물운송'){cnt++; dist+=safeFloat(r.distance);} });
    const cor = parseFloat(localStorage.getItem('mileage_correction')||0);
    
    document.getElementById('cumulative-operating-days').textContent = new Set(MEM_RECORDS.map(r=>getStatisticalDate(r.date, r.time))).size + '일';
    document.getElementById('cumulative-trip-count').textContent = cnt + '건'; // [수정] 누적 건수 표시 추가
    document.getElementById('cumulative-total-mileage').textContent = (dist + cor).toLocaleString() + 'km';
    document.getElementById('cumulative-income').textContent = formatToManwon(inc) + '만';
    document.getElementById('cumulative-expense').textContent = formatToManwon(exp) + '만';
    document.getElementById('cumulative-net-income').textContent = formatToManwon(inc-exp) + '만';
}

export function displaySubsidyRecords() { /* 16.4 버전과 동일한 주유 목록 코드 */ }