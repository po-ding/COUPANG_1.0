import { formatToManwon, getStatisticalDate, getTodayString } from './utils.js';
import { MEM_RECORDS, MEM_LOCATIONS } from './data.js';
import { editRecord } from './ui.js';

const SUBSIDY_PAGE_SIZE = 10;
let displayedSubsidyCount = 0;

export function calculateTotalDuration(records) {
    const sorted = [...records].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    let totalMinutes = 0;
    if (sorted.length < 2) return '0h 0m';
    for (let i = 1; i < sorted.length; i++) {
        const curr = new Date(`${sorted[i].date}T${sorted[i].time}`);
        const prev = new Date(`${sorted[i-1].date}T${sorted[i-1].time}`);
        if (sorted[i-1].type !== '운행종료') {
            totalMinutes += (curr - prev) / 60000;
        }
    }
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);
    return `${hours}h ${minutes}m`;
}

export function createSummaryHTML(title, records) {
    const validRecords = records.filter(r => r.type !== '이동취소' && r.type !== '운행종료');
    let totalIncome = 0, totalExpense = 0, totalDistance = 0, totalTripCount = 0;
    let totalFuelCost = 0, totalFuelLiters = 0;
    validRecords.forEach(r => {
        totalIncome += parseInt(r.income || 0);
        totalExpense += parseInt(r.cost || 0);
        if (r.type === '주유소') { totalFuelCost += parseInt(r.cost || 0); totalFuelLiters += parseFloat(r.liters || 0); }
        if (['화물운송'].includes(r.type)) { totalDistance += parseFloat(r.distance || 0); totalTripCount++; }
    });
    const netIncome = totalIncome - totalExpense;
    const metrics = [
        { label: '수입', value: formatToManwon(totalIncome), unit: ' 만원', className: 'income' },
        { label: '지출', value: formatToManwon(totalExpense), unit: ' 만원', className: 'cost' },
        { label: '정산', value: formatToManwon(netIncome), unit: ' 만원', className: 'net' },
        { label: '운행거리', value: totalDistance.toFixed(1), unit: ' km' },
        { label: '운행건수', value: totalTripCount, unit: ' 건' },
        { label: '주유금액', value: formatToManwon(totalFuelCost), unit: ' 만원', className: 'cost' },
        { label: '주유리터', value: totalFuelLiters.toFixed(2), unit: ' L' },
    ];
    let itemsHtml = metrics.map(m => `<div class="summary-item"><span class="summary-label">${m.label}</span><span class="summary-value ${m.className || ''} hidden">${m.value}${m.unit}</span></div>`).join('');
    return `<strong>${title}</strong><div class="summary-toggle-grid" onclick="window.toggleAllSummaryValues(this)">${itemsHtml}</div>`;
}

// [수정됨] 04시 기준 적용 및 주유/소모품 간소화 표시
export function displayTodayRecords(date) {
    const todayTbody = document.querySelector('#today-records-table tbody');
    const todaySummaryDiv = document.getElementById('today-summary');
    
    // [04시 기준 필터링]
    const dayRecords = MEM_RECORDS.filter(r => getStatisticalDate(r.date, r.time) === date)
                                  .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    
    todayTbody.innerHTML = '';
    const displayList = dayRecords.filter(r => r.type !== '운행종료');

    displayList.forEach(r => {
        const tr = document.createElement('tr');
        tr.onclick = () => editRecord(r.id);

        let timeDisplay = r.time;
        // [익일 표시] 실제 날짜가 통계 날짜와 다르면 (즉, 새벽 00:00~03:59인 경우)
        if(r.date !== date) { 
            timeDisplay = `<span style="font-size:0.8em; color:#888;">(익일)</span> ${r.time}`;
        }

        let money = '';
        if(r.income > 0) money += `<span class="income">+${formatToManwon(r.income)}</span> `;
        if(r.cost > 0) money += `<span class="cost">-${formatToManwon(r.cost)}</span>`;
        if(money === '') money = '0'; 

        const isTransport = (r.type === '화물운송' || r.type === '대기');

        if (isTransport) {
            let endTime = '진행중';
            let duration = '-';

            const idx = dayRecords.findIndex(item => item.id === r.id);
            if (idx > -1 && idx < dayRecords.length - 1) {
                const next = dayRecords[idx+1];
                endTime = next.time;
                const diff = new Date(`2000-01-01T${next.time}`) - new Date(`2000-01-01T${r.time}`);
                const h = Math.floor(Math.abs(diff)/3600000);
                const m = Math.floor((Math.abs(diff)%3600000)/60000);
                duration = h > 0 ? `${h}h ${m}m` : `${m}m`;
            }

            const fromVal = (r.from||'').replace(/"/g, '&quot;');
            const toVal = (r.to||'').replace(/"/g, '&quot;');
            const fromCell = `<span class="location-clickable" data-center="${fromVal}">${r.from || ''}</span>`;
            const toCell = `<span class="location-clickable" data-center="${toVal}">${r.to || ''}</span>`;
            
            let noteCell = '';
            if(r.distance) noteCell = `<span class="note">${r.distance} km</span>`;
            if(r.type === '대기') noteCell = `<span class="note">대기중</span>`;

            tr.innerHTML = `
                <td data-label="시작">${timeDisplay}</td>
                <td data-label="종료">${endTime}</td>
                <td data-label="소요">${duration}</td>
                <td data-label="상차">${fromCell}</td>
                <td data-label="하차">${toCell}</td>
                <td data-label="비고">${noteCell}</td>
                <td data-label="금액">${money}</td>
            `;
        } else {
            // [주유/소모품 등 간소화]
            const detail = r.expenseItem || r.supplyItem || r.brand || '';
            const content = `<span style="font-weight:bold; color:#555;">[${r.type}]</span> ${detail}`;
            
            tr.innerHTML = `
                <td data-label="시작">${timeDisplay}</td>
                <td colspan="5" data-label="내용">${content}</td>
                <td data-label="금액">${money}</td>
            `;
        }
        
        todayTbody.appendChild(tr);
    });
    todaySummaryDiv.innerHTML = createSummaryHTML('오늘의 기록 (04시 기준)', dayRecords);
}

// ... (displaySubsidyRecords, displayDailyRecords, displayWeeklyRecords, displayMonthlyRecords, displayCurrentMonthData, displayCumulativeData, renderMileageSummary 는 기존과 동일하므로 생략하거나 기존 stats.js 유지)

// [인쇄 화면에도 04시 기준 적용]
export function generatePrintView(year, month, period, isDetailed) {
    const sDay = period === 'second' ? 16 : 1;
    const eDay = period === 'first' ? 15 : 31;
    const periodStr = period === 'full' ? '1일 ~ 말일' : `${sDay}일 ~ ${eDay===15?15:'말'}일`;
    
    const target = MEM_RECORDS.filter(r => { 
        const statDate = getStatisticalDate(r.date, r.time);
        const d = new Date(statDate); 
        return statDate.startsWith(`${year}-${month}`) && d.getDate() >= sDay && d.getDate() <= eDay; 
    }).sort((a,b) => (a.date+a.time).localeCompare(b.date+b.time));
    
    const transport = target.filter(r => ['화물운송', '대기'].includes(r.type));
    let inc=0, exp=0, dist=0;
    target.forEach(r => { inc += (r.income||0); exp += (r.cost||0); });
    transport.forEach(r => dist += (r.distance||0));
    
    // 근무일: 화물운송이 있는 날짜만 카운트
    const workDays = new Set(
        target.filter(r => r.type === '화물운송')
              .map(r => getStatisticalDate(r.date, r.time))
    ).size;

    const w = window.open('','_blank');
    let lastDate = '';
    let h = `<html><head><title>운송내역</title><style>body{font-family:sans-serif;margin:20px} table{width:100%;border-collapse:collapse;font-size:12px; table-layout:fixed;} th,td{border:1px solid #ccc;padding:6px;text-align:center; word-wrap:break-word;} th{background:#eee} .summary{border:1px solid #ddd;padding:15px;margin-bottom:20px} .date-border { border-top: 2px solid #000 !important; } .left-align { text-align: left; padding-left: 5px; } .col-date { width: 50px; } .col-location { width: 120px; }</style></head><body><h2>${year}년 ${month}월 ${periodStr} 운송내역 (04시 기준)</h2><div class="summary"><p>근무일: ${workDays}일 | 건수: ${transport.length}건 | 거리: ${dist.toFixed(1)}km | 수입: ${formatToManwon(inc)}만 | 지출: ${formatToManwon(exp)}만 | 순수익: ${formatToManwon(inc-exp)}만</p></div><table><thead><tr>${isDetailed?'<th>시간</th>':''}<th class="col-date">날짜</th><th class="col-location">상차지</th><th class="col-location">하차지</th><th>내용</th>${isDetailed?'<th>거리</th><th>수입</th><th>지출</th>':''}</tr></thead><tbody>`;
    (isDetailed ? target : transport).forEach(r => {
        const statDate = getStatisticalDate(r.date, r.time);
        let borderClass = ''; if(lastDate !== '' && lastDate !== statDate) borderClass = 'class="date-border"'; lastDate = statDate;
        let from = '', to = '', desc = r.type;
        if(r.from || r.to) { from = r.from || ''; to = r.to || ''; desc = ''; } else { from = r.expenseItem || r.supplyItem || r.brand || ''; }
        if(r.type === '대기') desc = '대기';
        
        let dateDisplay = statDate.substring(5);
        if(r.date !== statDate) dateDisplay += ' <span style="font-size:0.8em">(익일)</span>';

        h += `<tr ${borderClass}>${isDetailed?`<td>${r.time}</td>`:''}<td>${dateDisplay}</td><td class="left-align">${from}</td><td class="left-align">${to}</td><td>${desc}</td>${isDetailed?`<td>${r.distance||'-'}</td><td>${formatToManwon(r.income)}</td><td>${formatToManwon(r.cost)}</td>`:''}</tr>`;
    });
    h += `</tbody></table><button onclick="window.print()">인쇄</button></body></html>`;
    w.document.write(h); w.document.close();
}