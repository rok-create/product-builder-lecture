let currentChart = null;
let selectedStock = null;

const FINNHUB_API = 'https://finnhub.io/api/v1/quote';
const FINNHUB_KEY_STORAGE = 'stockdash_finnhub_api_key';

const stockData = [
    {
        name: "삼성전자", code: "005930", finnhub: "005930.KS",
        price: 275500, change: 4000, percent: 1.47,
        per: 12.8, pbr: 2.9, marketCap: "1,644.5조",
        eps: "21,720원", dividend: "1.2%", roe: "22.5%",
        history: [252000, 260000, 266000, 268000, 260000, 271500, 275500],
        news: {
            title: "삼성전자, 5월 8일 '어버이날' 맞아 임직원 가족 초청 행사 및 반도체 비전 공유",
            summary: [
                "2026년 하반기 HBM4 본격 양산 계획을 재확인하며 AI 반도체 시장 주도권 공고화",
                "글로벌 빅테크향 커스텀 HBM 설계 완료 및 샘플 출하 시작",
                "어제(7일)의 상승세를 이어가며 장 초반 275,000원 선 돌파"
            ]
        }
    },
    {
        name: "SK하이닉스", code: "000660", finnhub: "000660.KS",
        price: 1642000, change: 18000, percent: 1.11,
        per: 10.6, pbr: 3.6, marketCap: "1,195.2조",
        eps: "156,150원", dividend: "0.5%", roe: "34.2%",
        history: [1500000, 1550000, 1520000, 1580000, 1600000, 1624000, 1642000],
        news: {
            title: "SK하이닉스, 차세대 CXL 메모리 솔루션 고객사 인증 완료",
            summary: [
                "HBM에 이은 차세대 먹거리 CXL(Compute Express Link) 시장 선점 가시화",
                "서버용 고용량 모듈 공급 확대로 인한 2분기 사상 최대 실적 전망",
                "외국인과 기관의 동반 순매수세가 유입되며 연일 신고가 행진"
            ]
        }
    },
    {
        name: "LG에너지솔루션", code: "373220", finnhub: "373220.KS",
        price: 852000, change: 7000, percent: 0.83,
        per: 45.8, pbr: 5.3, marketCap: "199.3조",
        eps: "18,600원", dividend: "0.1%", roe: "12.8%",
        history: [870000, 865000, 868000, 862000, 857000, 845000, 852000],
        news: {
            title: "LG엔솔, 북미 LFP 배터리 전용 라인 가동.. 시장 다변화 성공",
            summary: [
                "보급형 전기차 시장 공략을 위한 LFP 배터리 양산 체제 조기 구축",
                "미국 IRA 세액 공제 혜택 극대화에 따른 하반기 영업이익 급증 기대",
                "전날 하락세를 멈추고 저가 매수세 유입되며 반등 성공"
            ]
        }
    },
    {
        name: "현대차", code: "005380", finnhub: "005380.KS",
        price: 588000, change: 6000, percent: 1.03,
        per: 6.3, pbr: 1.2, marketCap: "125.8조",
        eps: "93,800원", dividend: "3.5%", roe: "18.1%",
        history: [552000, 565000, 568000, 575000, 570000, 582000, 588000],
        news: {
            title: "현대차, 인도 현지 공장 생산 능력 100만 대 돌파 가시화",
            summary: [
                "글로벌 시장 중 가장 가파른 성장세를 보이는 인도 시장 점유율 1위 공고화",
                "SDV(소프트웨어 중심 자동차) 전환 가속화를 위한 소프트웨어 인력 대규모 채용",
                "배당 귀족주로서의 매력 부각되며 안정적인 주가 우상향 흐름 지속"
            ]
        }
    },
    {
        name: "NAVER", code: "035420", finnhub: "035420.KS",
        price: 415000, change: 3000, percent: 0.73,
        per: 25.1, pbr: 2.4, marketCap: "67.8조",
        eps: "16,610원", dividend: "0.5%", roe: "14.1%",
        history: [396000, 399000, 402000, 410000, 405000, 412000, 415000],
        news: {
            title: "네이버 뉴스, AI 요약 서비스 이용자 만족도 90% 상회",
            summary: [
                "핵심 정보를 빠르게 파악하고자 하는 사용자 트렌드에 맞춘 서비스 고도화",
                "AI 기반 타겟팅 광고 단가 상승에 따른 광고 부문 매출 성장 가속화",
                "플랫폼 규제 완화 기대감과 AI 실적 가시화가 주가 하방 지지"
            ]
        }
    }
];

// ── API ──────────────────────────────────────────────────────────────

function getApiKey() {
    return localStorage.getItem(FINNHUB_KEY_STORAGE)?.trim() || '';
}

async function fetchFinnhubQuote(symbol) {
    const token = getApiKey();
    if (!token) return null;

    const url = `${FINNHUB_API}?symbol=${encodeURIComponent(symbol)}&token=${encodeURIComponent(token)}`;
    try {
        const r = await fetch(url, { signal: AbortSignal.timeout(6000) });
        if (!r.ok) return null;
        const quote = await r.json();
        if (typeof quote.c !== 'number' || quote.c <= 0) return null;
        return { symbol, ...quote };
    } catch {
        return null;
    }
}

async function fetchQuotes(symbols) {
    const quotes = await Promise.all(symbols.map(fetchFinnhubQuote));
    const validQuotes = quotes.filter(Boolean);
    return validQuotes.length ? validQuotes : null;
}

async function refreshAll() {
    const quotes = await fetchQuotes(stockData.map(s => s.finnhub));
    let isLive = false;

    if (quotes) {
        isLive = true;
        quotes.forEach(q => {
            const s = stockData.find(s => s.finnhub === q.symbol);
            if (!s) return;
            const newPrice = Math.round(q.c);
            s.price = newPrice;
            s.change = Math.round(q.d ?? newPrice - (q.pc || newPrice));
            s.percent = +(q.dp ?? ((s.change / (q.pc || newPrice)) * 100)).toFixed(2);
            s.history = [...s.history.slice(1), newPrice];
        });
    } else {
        // Simulate minor fluctuations when API is unreachable
        stockData.forEach(s => {
            const delta = Math.round(s.price * (Math.random() - 0.5) * 0.002);
            s.price = Math.max(1, s.price + delta);
            s.change += delta;
            s.percent = +((s.change / (s.price - s.change || 1)) * 100).toFixed(2);
            s.history = [...s.history.slice(1), s.price];
        });
    }

    // Finnhub Korean index coverage can vary by plan. Keep demo value if unavailable.
    const kospi = await fetchQuotes(['KS11.KS']);
    if (kospi?.[0]) {
        const k = kospi[0];
        document.getElementById('kospi-value').textContent =
            k.c.toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const up = (k.d ?? 0) >= 0;
        const el = document.getElementById('kospi-change');
        el.textContent = `${up ? '▲' : '▼'} ${Math.abs(k.dp ?? 0).toFixed(2)}%`;
        el.className = `market-change ${up ? 'up' : 'down'}`;
    }

    setStatus(isLive);
    updateSidebarPrices();

    if (selectedStock) {
        const updated = stockData.find(s => s.code === selectedStock.code);
        if (updated) refreshCurrentStock(updated);
    }
}

// ── Status indicator ──────────────────────────────────────────────────

function setStatus(isLive) {
    const t = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const hasKey = Boolean(getApiKey());
    document.getElementById('update-time').innerHTML = isLive
        ? `<span style="color:#00c896">● FINNHUB</span>&ensp;${t}`
        : `<span style="color:#3a5470">● ${hasKey ? '대기' : '키 필요'}</span>&ensp;${t}`;
}

// ── Sidebar ───────────────────────────────────────────────────────────

function renderTrendingList() {
    const list = document.getElementById('trending-list');
    list.innerHTML = '';

    stockData.forEach((stock, i) => {
        const li = document.createElement('li');
        li.className = 'stock-item';
        li.dataset.code = stock.code;

        const isUp = stock.change >= 0;
        li.innerHTML = `
            <span class="item-rank">${i + 1}</span>
            <div class="item-info">
                <div class="item-name">${stock.name}</div>
                <div class="item-code">${stock.code}</div>
            </div>
            <div class="item-price">
                <div class="item-price-val ${isUp ? 'up' : 'down'}">${stock.price.toLocaleString()}</div>
                <div class="item-price-pct ${isUp ? 'up' : 'down'}">${isUp ? '▲' : '▼'} ${Math.abs(stock.percent)}%</div>
            </div>
        `;

        li.addEventListener('click', () => {
            document.querySelectorAll('.stock-item').forEach(el => el.classList.remove('active'));
            li.classList.add('active');
            updateDashboard(stock);
        });

        list.appendChild(li);
    });

    list.firstChild?.classList.add('active');
}

function updateSidebarPrices() {
    stockData.forEach(stock => {
        const item = document.querySelector(`[data-code="${stock.code}"]`);
        if (!item) return;
        const isUp = stock.change >= 0;
        const colorClass = isUp ? 'up' : 'down';
        const sign = isUp ? '▲' : '▼';

        const valEl = item.querySelector('.item-price-val');
        valEl.className = `item-price-val ${colorClass}`;
        valEl.textContent = stock.price.toLocaleString();

        const pctEl = item.querySelector('.item-price-pct');
        pctEl.className = `item-price-pct ${colorClass}`;
        pctEl.textContent = `${sign} ${Math.abs(stock.percent)}%`;
    });
}

// ── Dashboard ─────────────────────────────────────────────────────────

function updateDashboard(stock) {
    selectedStock = stock;
    document.getElementById('selected-stock-name').textContent = stock.name;
    document.getElementById('selected-stock-code').textContent = stock.code;
    document.getElementById('metric-per').textContent = stock.per;
    document.getElementById('metric-pbr').textContent = stock.pbr;
    document.getElementById('metric-marketcap').textContent = stock.marketCap;
    document.getElementById('metric-eps').textContent = stock.eps;
    document.getElementById('metric-dividend').textContent = stock.dividend;
    document.getElementById('metric-roe').textContent = stock.roe;
    updateNews(stock.news);
    refreshCurrentStock(stock);
}

function refreshCurrentStock(stock) {
    document.getElementById('current-price').textContent = `${stock.price.toLocaleString()}원`;
    const isUp = stock.change >= 0;
    const changeEl = document.getElementById('price-change');
    changeEl.className = `price-delta ${isUp ? 'up' : 'down'}`;
    changeEl.textContent = `${isUp ? '▲' : '▼'} ${Math.abs(stock.change).toLocaleString()} (${stock.percent}%)`;
    renderChart(stock.history);
}

function updateNews(news) {
    document.getElementById('news-content').innerHTML = `
        <div class="news-headline">${news.title}</div>
        ${news.summary.map((item, i) => `
            <div class="news-bullet">
                <span class="news-num">0${i + 1}</span>
                <span class="news-text">${item}</span>
            </div>
        `).join('')}
    `;
}

function renderChart(historyData) {
    const ctx = document.getElementById('stockChart').getContext('2d');
    if (currentChart) currentChart.destroy();

    const isUp = historyData[historyData.length - 1] >= historyData[0];
    const color = isUp ? '#f0516a' : '#3d9eff';

    currentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['6일 전', '5일 전', '4일 전', '3일 전', '2일 전', '1일 전', '오늘'],
            datasets: [{
                data: historyData,
                borderColor: color,
                backgroundColor: (ctx) => {
                    const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 200);
                    g.addColorStop(0, color + '30');
                    g.addColorStop(1, color + '00');
                    return g;
                },
                fill: true,
                tension: 0.35,
                borderWidth: 2,
                pointRadius: 3,
                pointBackgroundColor: color,
                pointBorderColor: '#0f1e35',
                pointBorderWidth: 2,
                pointHoverRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            interaction: { intersect: false, mode: 'index' },
            scales: {
                x: {
                    grid: { display: false },
                    border: { display: false },
                    ticks: { color: '#3a5470', font: { size: 10 } }
                },
                y: {
                    grid: { color: '#101f33' },
                    border: { display: false },
                    ticks: { color: '#3a5470', font: { size: 10 }, callback: v => v.toLocaleString() }
                }
            }
        }
    });
}

// ── Search ────────────────────────────────────────────────────────────

function setupSearch() {
    document.getElementById('stock-search').addEventListener('input', e => {
        const term = e.target.value.toLowerCase();
        document.querySelectorAll('.stock-item').forEach((item, i) => {
            const s = stockData[i];
            item.style.display =
                s.name.toLowerCase().includes(term) || s.code.includes(term) ? 'flex' : 'none';
        });
    });
}

function setupApiKey() {
    const input = document.getElementById('api-key');
    const button = document.getElementById('save-api-key');
    const savedKey = getApiKey();

    if (savedKey) input.value = savedKey;

    button.addEventListener('click', async () => {
        const key = input.value.trim();
        if (key) {
            localStorage.setItem(FINNHUB_KEY_STORAGE, key);
        } else {
            localStorage.removeItem(FINNHUB_KEY_STORAGE);
        }
        button.textContent = '저장됨';
        await refreshAll();
        setTimeout(() => { button.textContent = '저장'; }, 1200);
    });
}

// ── Init ──────────────────────────────────────────────────────────────

async function init() {
    renderTrendingList();
    updateDashboard(stockData[0]);
    setupSearch();
    setupApiKey();

    await refreshAll();           // 즉시 첫 fetch
    setInterval(refreshAll, 60000); // 이후 1분마다
}

window.onload = init;
