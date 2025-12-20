import { getStatisticalDate, formatToManwon } from './utils.js';
import { MEM_RECORDS, MEM_LOCATIONS } from './data.js';

/** 기록 조회 테이블 렌더링 */
export function displayTodayRecords(date) {
    const tbody = document.querySelector('#today-records-table tbody');
    const dayRecords = MEM_RECORDS.filter(r => getStatisticalDate(r.date, r.time) === date);
    tbody.innerHTML = "";

    dayRecords.forEach(r => {
        const tr = document.createElement('tr');
        tr.onclick = () => window.editRecord(r.id);
        
        if (['화물운송', '대기'].includes(r.type)) {
            const fL = MEM_LOCATIONS[r.from] || {}, tL = MEM_LOCATIONS[r.to] || {};
            tr.innerHTML = `
                <td data-label="시간">${r.time}</td><td data-label="종료">-</td><td data-label="소요">-</td>
                <td data-label="상차">${r.from}${fL.memo ? `<span class="table-memo">${fL.memo}</span>` : ''}</td>
                <td data-label="하차">${r.to}${tL.memo ? `<span class="table-memo">${tL.memo}</span>` : ''}</td>
                <td data-label="비고">${r.distance}km</td>
                <td data-label="금액" class="income">${formatToManwon(r.income)}</td>
            `;
        } else {
            tr.innerHTML = `
                <td data-label="시간">${r.time}</td>
                <td colspan="5" style="text-align:left; padding-left:15px;"><b>[${r.type}]</b> ${r.expenseItem || r.brand || ''}</td>
                <td data-label="금액" class="cost">${formatToManwon(r.cost || r.income)}</td>
            `;
        }
        tbody.appendChild(tr);
    });
    
    // 요약 표시
    let totalInc = 0, totalExp = 0, totalDist = 0;
    dayRecords.forEach(r => {
        totalInc += parseInt(r.income) || 0;
        totalExp += parseInt(r.cost) || 0;
        if(r.type === '화물운송') totalDist += parseFloat(r.distance) || 0;
    });
    document.getElementById('today-summary').innerHTML = `수입: <span class="income">${formatToManwon(totalInc)}</span> | 지출: <span class="cost">${formatToManwon(totalExp)}</span> | 거리: ${totalDist.toFixed(1)}km`;
}

/** 실시간 통계 요약 */
export function displayCumulativeData() {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthRecords = MEM_RECORDS.filter(r => getStatisticalDate(r.date, r.time).startsWith(currentMonth));
    
    let inc = 0, exp = 0, dist = 0, days = new Set();
    monthRecords.forEach(r => {
        inc += parseInt(r.income) || 0;
        exp += parseInt(r.cost) || 0;
        if (r.type === '화물운송') dist += parseFloat(r.distance) || 0;
        days.add(getStatisticalDate(r.date, r.time));
    });

    document.getElementById('current-month-title').textContent = `${currentMonth} 통계 (04시 기준)`;
    document.getElementById('current-month-operating-days').textContent = `${days.size}일`;
    document.getElementById('current-month-total-mileage').textContent = `${dist.toFixed(1)}km`;
    document.getElementById('current-month-income').textContent = `${formatToManwon(inc)}만원`;
    document.getElementById('current-month-expense').textContent = `${formatToManwon(exp)}만원`;
    document.getElementById('current-month-net-income').textContent = `${formatToManwon(inc-exp)}만원`;
}

/** 상세 내역서 인쇄 기능 */
export function generatePrintView(year, month) {
    const target = MEM_RECORDS.filter(r => getStatisticalDate(r.date, r.time).startsWith(`${year}-${month}`));
    const win = window.open('', '_blank');
    let html = `<html><head><title>${month}월 운송내역</title><style>table{width:100%; border-collapse:collapse;} th,td{border:1px solid #000; padding:5px; text-align:center; font-size:12px;}</style></head><body>`;
    html += `<h2>${year}년 ${month}월 운송 명세서</h2><table><thead><tr><th>날짜</th><th>상차</th><th>하차</th><th>거리</th><th>금액</th></tr></thead><tbody>`;
    target.forEach(r => {
        html += `<tr><td>${r.date} ${r.time}</td><td>${r.from||'-'}</td><td>${r.to||'-'}</td><td>${r.distance||0}km</td><td>${(r.income||r.cost).toLocaleString()}원</td></tr>`;
    });
    html += `</tbody></table></body></html>`;
    win.document.write(html);
    win.document.close();
}