// --- START OF FILE js/stats.js ---

import { formatToManwon, getStatisticalDate, getTodayString } from './utils.js';
import { MEM_RECORDS, MEM_LOCATIONS } from './data.js';
import { editRecord } from './ui.js';

let displayedSubsidyCount = 0;
function safeInt(v) { if(!v) return 0; return parseInt(String(v).replace(/,/g,''),10)||0; }
function safeFloat(v) { if(!v) return 0; return parseFloat(String(v).replace(/,/g,''))||0; }

export function calculateTotalDuration(recs) {
    const s = [...recs].sort((a,b) => (a.date+a.time).localeCompare(b.date+b.time));
    let mins = 0; if (s.length < 2) return '0h 0m';
    for (let i = 1; i < s.length; i++) {
        if (s[i-1].type !== '운행종료') mins += (new Date(`${s[i].date}T${s[i].time}`) - new Date(`${s[i-1].date}T${s[i-1].time}`)) / 60000;
    }
    return `${Math.floor(mins/60)}h ${Math.round(mins%60)}m`;
}

export function createSummaryHTML(t, recs) {
    const v = recs.filter(r => r.type !== '운행취소' && r.type !== '운행종료');
    let inc=0, exp=0, dist=0, cnt=0, fcost=0, flit=0;
    v.forEach(r => { inc+=safeInt(r.income); exp+=safeInt(r.cost); if(r.type==='주유소'){fcost+=safeInt(r.cost); flit+=safeFloat(r.liters);} if(r.type==='화물운송'){dist+=safeFloat(r.distance); cnt++;} });
    const items = [
        { l: '수입', v: formatToManwon(inc), u: ' 만', c: 'income' }, { l: '지출', v: formatToManwon(exp), u: ' 만', c: 'cost' },
        { l: '정산', v: formatToManwon(inc-exp), u: ' 만', c: 'net' }, { l: '거리', v: dist.toFixed(1), u: ' km' },
        { l: '건수', v: cnt, u: ' 건' }, { l: '주유', v: formatToManwon(fcost), u: ' 만', c: 'cost' }, { l: '리터', v: flit.toFixed(1), u: ' L' }
    ];
    return `<strong>${t}</strong><div class="summary-toggle-grid" onclick="window.toggleAllSummaryValues(this)">${items.map(m=>`<div class="summary-item"><span class="summary-label">${m.l}</span><span class="summary-value ${m.c||''} hidden">${m.v}${m.u}</span></div>`).join('')}</div>`;
}

export function displayTodayRecords(date) {
    const tbody = document.querySelector('#today-records-table tbody');
    const recs = MEM_RECORDS.filter(r => getStatisticalDate(r.date, r.time) === date).sort((a, b) => (a.date+a.time).localeCompare(b.date+b.time));
    tbody.innerHTML = '';
    recs.filter(r => r.type !== '운행종료').forEach(r => {
        const tr = document.createElement('tr'); tr.onclick = () => editRecord(r.id);
        let time = r.time; if(r.date!==date) time = `<span style="font-size:0.8em; color:#888;">(익일)</span> ${r.time}`;
        let mon = ''; if(r.income>0) mon+=`<span class="income">+${formatToManwon(r.income)}</span> `; if(r.cost>0) mon+=`<span class="cost">-${formatToManwon(r.cost)}</span>`;
        if (['화물운송','대기','운행취소'].includes(r.type)) {
            let end='진행', dur='-'; const idx = MEM_RECORDS.findIndex(i=>i.id===r.id);
            if(idx>-1 && idx<MEM_RECORDS.length-1) {
                const n = MEM_RECORDS[idx+1]; end = n.date!==r.date ? `<span style="font-size:0.8em; color:#888;">(${n.date.slice(5)})</span><br>${n.time}` : n.time;
                const d = (new Date(`${n.date}T${n.time}`) - new Date(`${r.date}T${r.time}`))/60000;
                if(d>=0) dur = d>60 ? `${Math.floor(d/60)}h ${Math.round(d%60)}m` : `${Math.round(d%60)}m`;
            }
            const lFrom = MEM_LOCATIONS[r.from]||{}, lTo = MEM_LOCATIONS[r.to]||{};
            tr.innerHTML = `<td data-label="시작">${time}</td><td data-label="종료">${end}</td><td data-label="소요">${dur}</td><td data-label="상차"><span class="location-clickable" data-center="${r.from}">${r.from||''}</span>${lFrom.memo?`<span class="table-memo">${lFrom.memo}</span>`:''}</td><td data-label="하차"><span class="location-clickable" data-center="${r.to}">${r.to||''}</span>${lTo.memo?`<span class="table-memo">${lTo.memo}</span>`:''}</td><td data-label="비고">${r.type==='운행취소'?'<span class="cancelled">취소</span>':(r.distance?r.distance+'k':'')}</td><td data-label="금액">${mon||0}</td>`;
        } else {
            tr.innerHTML = `<td data-label="시작">${time}</td><td colspan="5" style="text-align:left;"><b>[${r.type}]</b> ${r.expenseItem||r.supplyItem||r.brand||''}</td><td data-label="금액">${mon||0}</td>`;
        }
        tbody.appendChild(tr);
    });
    document.getElementById('today-summary').innerHTML = createSummaryHTML('오늘 기록', recs);
}

export function displaySubsidyRecords(append=false) {
    const list = document.getElementById('subsidy-records-list'), fuel = MEM_RECORDS.filter(r=>r.type==='주유소').sort((a,b)=>(b.date+b.time).localeCompare(a.date+a.time));
    if(!append) { displayedSubsidyCount=0; list.innerHTML=''; }
    if(fuel.length===0) { list.innerHTML='<p class="note">내역 없음</p>'; return; }
    fuel.slice(displayedSubsidyCount, displayedSubsidyCount+10).forEach(r => {
        const d = document.createElement('div'); d.className='center-item';
        d.innerHTML = `<div class="info"><span>${r.date} (${r.brand})</span><b>${formatToManwon(r.cost)} 만</b></div><div style="display:flex; justify-content:space-between; font-size:0.9em;"><span>${r.liters}L</span><span>${r.unitPrice}원</span></div>`;
        list.appendChild(d);
    });
    displayedSubsidyCount += 10;
    const btnBox = document.getElementById('subsidy-load-more-container');
    if(displayedSubsidyCount < fuel.length) { btnBox.innerHTML = '<button class="load-more-btn">▼ 더 보기</button>'; btnBox.querySelector('button').onclick=()=>displaySubsidyRecords(true); }
    else btnBox.innerHTML = '';
}

export function displayDailyRecords() {
    const y = document.getElementById('daily-year-select').value, m = document.getElementById('daily-month-select').value, sel = `${y}-${m}`;
    const tbody = document.querySelector('#daily-summary-table tbody'), summary = document.getElementById('daily-summary'), recs = MEM_RECORDS.filter(r => getStatisticalDate(r.date, r.time).startsWith(sel));
    tbody.innerHTML = ''; summary.innerHTML = createSummaryHTML(`${parseInt(m)}월 총계`, recs);
    const byDate = {}; recs.forEach(r => { const d = getStatisticalDate(r.date, r.time); if(!byDate[d]) byDate[d]=[]; byDate[d].push(r); });
    Object.keys(byDate).sort().reverse().forEach(d => {
        let inc=0, exp=0, dist=0, cnt=0; byDate[d].forEach(r => { if(r.type!=='운행종료'&&r.type!=='운행취소'){inc+=safeInt(r.income); exp+=safeInt(r.cost);} if(r.type==='화물운송'){dist+=safeFloat(r.distance); cnt++;} });
        const tr = document.createElement('tr'); tr.innerHTML = `<td data-label="일">${parseInt(d.slice(8))}</td><td data-label="수입" class="income">${formatToManwon(inc)}</td><td data-label="지출" class="cost">${formatToManwon(exp)}</td><td data-label="정산"><b>${formatToManwon(inc-exp)}</b></td><td data-label="거리">${dist.toFixed(1)}</td><td data-label="이동">${cnt}</td><td data-label="소요">${calculateTotalDuration(byDate[d])}</td><td data-label="관리"><button class="edit-btn" onclick="window.viewDateDetails('${d}')">상세</button></td>`;
        tbody.appendChild(tr);
    });
}

export function displayWeeklyRecords() {
    const y = document.getElementById('weekly-year-select').value, m = document.getElementById('weekly-month-select').value, sel = `${y}-${m}`;
    const tbody = document.querySelector('#weekly-summary-table tbody'), summary = document.getElementById('weekly-summary'), recs = MEM_RECORDS.filter(r => getStatisticalDate(r.date, r.time).startsWith(sel));
    tbody.innerHTML = ''; summary.innerHTML = createSummaryHTML(`${parseInt(m)}월 주별`, recs);
    const wks = {}; recs.forEach(r => { const d = new Date(getStatisticalDate(r.date, r.time)), w = Math.ceil((d.getDate()+(new Date(d.getFullYear(),d.getMonth(),1).getDay()))/7); if(!wks[w]) wks[w]=[]; wks[w].push(r); });
    Object.keys(wks).forEach(w => {
        let inc=0, exp=0, dist=0, cnt=0; wks[w].forEach(r => { if(r.type!=='운행종료'&&r.type!=='운행취소'){inc+=safeInt(r.income); exp+=safeInt(r.cost);} if(r.type==='화물운송'){dist+=safeFloat(r.distance); cnt++;} });
        const dts = wks[w].map(r => new Date(getStatisticalDate(r.date, r.time)).getDate());
        const tr = document.createElement('tr'); tr.innerHTML = `<td data-label="주차">${w}주</td><td data-label="기간">${Math.min(...dts)}~${Math.max(...dts)}</td><td data-label="수입">${formatToManwon(inc)}</td><td data-label="지출">${formatToManwon(exp)}</td><td data-label="정산">${formatToManwon(inc-exp)}</td><td data-label="거리">${dist.toFixed(1)}</td><td data-label="이동">${cnt}</td><td data-label="소요">${calculateTotalDuration(wks[w])}</td>`;
        tbody.appendChild(tr);
    });
}

export function displayMonthlyRecords() {
    const y = document.getElementById('monthly-year-select').value, tbody = document.querySelector('#monthly-summary-table tbody'), summary = document.getElementById('monthly-yearly-summary'), recs = MEM_RECORDS.filter(r => getStatisticalDate(r.date, r.time).startsWith(y));
    tbody.innerHTML = ''; summary.innerHTML = createSummaryHTML(`${y}년`, recs);
    const mths = {}; recs.forEach(r => { const m = getStatisticalDate(r.date, r.time).slice(0,7); if(!mths[m]) mths[m]=[]; mths[m].push(r); });
    Object.keys(mths).sort().reverse().forEach(m => {
        let inc=0, exp=0, dist=0, cnt=0; mths[m].forEach(r => { if(r.type!=='운행종료'&&r.type!=='운행취소'){inc+=safeInt(r.income); exp+=safeInt(r.cost);} if(r.type==='화물운송'){dist+=safeFloat(r.distance); cnt++;} });
        const tr = document.createElement('tr'); tr.innerHTML = `<td data-label="월">${parseInt(m.slice(5))}월</td><td data-label="수입">${formatToManwon(inc)}</td><td data-label="지출">${formatToManwon(exp)}</td><td data-label="정산">${formatToManwon(inc-exp)}</td><td data-label="거리">${dist.toFixed(1)}</td><td data-label="이동">${cnt}</td><td data-label="소요">${calculateTotalDuration(mths[m])}</td>`;
        tbody.appendChild(tr);
    });
}

export function displayCurrentMonthData() {
    const d = new Date(); if(d.getHours()<4) d.setDate(d.getDate()-1); const sel = d.toISOString().slice(0,7);
    const recs = MEM_RECORDS.filter(r => getStatisticalDate(r.date, r.time).startsWith(sel) && r.type!=='운행취소' && r.type!=='운행종료');
    let inc=0, exp=0, cnt=0, dist=0, lit=0; recs.forEach(r => { inc+=safeInt(r.income); exp+=safeInt(r.cost); if(r.type==='화물운송'){cnt++; dist+=safeFloat(r.distance);} if(r.type==='주유소') lit+=safeFloat(r.liters); });
    document.getElementById('current-month-title').textContent = `${parseInt(sel.slice(5))}월 실시간 요약`;
    document.getElementById('current-month-operating-days').textContent = new Set(recs.map(r=>getStatisticalDate(r.date, r.time))).size + '일';
    document.getElementById('current-month-trip-count').textContent = cnt+'건';
    document.getElementById('current-month-total-mileage').textContent = dist.toFixed(1)+'km';
    document.getElementById('current-month-income').textContent = formatToManwon(inc)+'만';
    document.getElementById('current-month-expense').textContent = formatToManwon(exp)+'만';
    document.getElementById('current-month-net-income').textContent = formatToManwon(inc-exp)+'만';
    const lim = parseFloat(localStorage.getItem("fuel_subsidy_limit"))||0;
    const pct = lim>0 ? Math.min(100, 100*lit/lim).toFixed(1) : 0;
    document.getElementById('subsidy-summary').innerHTML = `한도: ${lim}L | 사용: ${lit.toFixed(1)}L | 잔여: ${(lim-lit).toFixed(1)}L<div class="progress-bar-container"><div class="progress-bar progress-bar-used" style="width:${pct}%"></div></div>`;
}

export function displayCumulativeData() {
    const recs = MEM_RECORDS.filter(r=>r.type!=='운행취소'&&r.type!=='운행종료');
    let inc=0, exp=0, cnt=0, dist=0, lit=0; recs.forEach(r=>{ inc+=safeInt(r.income); exp+=safeInt(r.cost); if(r.type==='화물운송'){cnt++; dist+=safeFloat(r.distance);} if(r.type==='주유소') lit+=safeFloat(r.liters); });
    const cor = parseFloat(localStorage.getItem("mileage_correction"))||0, td = dist+cor;
    document.getElementById('cumulative-operating-days').textContent = new Set(recs.map(r=>getStatisticalDate(r.date, r.time))).size + '일';
    document.getElementById('cumulative-total-mileage').textContent = Math.round(td).toLocaleString()+'km';
    document.getElementById('cumulative-income').textContent = formatToManwon(inc)+'만';
    document.getElementById('cumulative-expense').textContent = formatToManwon(exp)+'만';
    document.getElementById('cumulative-net-income').textContent = formatToManwon(inc-exp)+'만';
}