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

(() => {
    let marketChart = null;
    let selectedAsset = null;
    let currentCategory = 'all';
    let lastProviderStatus = 'Yahoo Finance 자동 조회';

    const TWELVE_DATA_API = 'https://api.twelvedata.com';
    const TWELVE_DATA_KEY_STORAGE = 'stockdash_twelve_data_api_key';
    const YAHOO_CHART_API = 'https://query1.finance.yahoo.com/v8/finance/chart/';
    const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
    const twelveDataSymbols = {
        nasdaq: 'IXIC',
        sp500: 'SPX',
        kospi: 'KOSPI',
        wti: 'WTI/USD',
        brent: 'XBR/USD',
        gold: 'XAU/USD',
        silver: 'XAG/USD'
    };
    const yahooSymbols = {
        nasdaq: '^IXIC',
        sp500: '^GSPC',
        kospi: '^KS11',
        wti: 'CL=F',
        brent: 'BZ=F',
        gold: 'GC=F',
        silver: 'SI=F'
    };

    const categories = [
        { id: 'all', label: '전체' },
        { id: 'index', label: '지수' },
        { id: 'energy', label: '에너지' },
        { id: 'metal', label: '금속' }
    ];

    const marketAssets = [
        {
            id: 'nasdaq', name: 'NASDAQ Composite', short: 'IXIC', category: 'index', categoryLabel: '미국 지수',
            finnhub: '^IXIC', unit: 'pt', price: 18491.62, change: 142.18, percent: 0.78,
            note: '미국 성장주와 기술주 흐름을 보는 핵심 지수',
            history: [17930, 18012, 18144, 18065, 18228, 18349, 18491],
            metrics: [['거래소', 'NASDAQ'], ['주요 섹터', '기술, AI, 반도체'], ['변동성', '높음'], ['관찰 포인트', '금리와 빅테크 실적'], ['통화', 'USD'], ['세션', '미국 정규장']],
            insight: {
                title: '나스닥은 AI와 반도체 주도주가 강할 때 대시보드의 위험 선호 신호로 해석하기 좋습니다.',
                bullets: ['상승폭이 커질수록 성장주 비중이 큰 포트폴리오에는 우호적입니다.', '유가 상승과 금리 부담이 같이 나타나면 지수 상승의 질을 따로 확인해야 합니다.', '금값이 함께 오르면 단순 위험 선호보다 헤지 수요가 섞였을 가능성이 있습니다.']
            }
        },
        {
            id: 'sp500', name: 'S&P 500', short: 'SPX', category: 'index', categoryLabel: '미국 지수',
            finnhub: '^GSPC', unit: 'pt', price: 5638.41, change: 28.62, percent: 0.51,
            note: '미국 대형주 전반의 체력을 확인하는 기준 지수',
            history: [5534, 5561, 5588, 5572, 5601, 5609, 5638],
            metrics: [['거래소', 'NYSE/NASDAQ'], ['범위', '대형주 500개'], ['변동성', '중간'], ['관찰 포인트', '실적과 금리'], ['통화', 'USD'], ['세션', '미국 정규장']],
            insight: {
                title: 'S&P 500은 나스닥보다 넓은 시장 체력을 보여 주며, 상승 확산 여부를 판단하는 기준입니다.',
                bullets: ['나스닥만 강하고 S&P가 둔하면 일부 빅테크 쏠림으로 볼 수 있습니다.', '동반 상승은 글로벌 주식 위험 선호가 살아나는 흐름입니다.', '에너지 가격 급등 시 마진 압박 가능성을 같이 봐야 합니다.']
            }
        },
        {
            id: 'kospi', name: 'KOSPI', short: 'KOSPI', category: 'index', categoryLabel: '한국 지수',
            finnhub: 'KS11.KS', unit: 'pt', price: 2894.32, change: 18.4, percent: 0.64,
            note: '국내 대형주와 외국인 수급을 확인하는 한국 대표 지수',
            history: [2821, 2838, 2855, 2849, 2866, 2875, 2894],
            metrics: [['시장', '한국 유가증권시장'], ['주요 섹터', '반도체, 자동차, 금융'], ['변동성', '중간'], ['관찰 포인트', '환율과 외국인 수급'], ['통화', 'KRW'], ['세션', '한국 정규장']],
            insight: {
                title: 'KOSPI는 원화, 반도체 사이클, 외국인 수급에 민감하게 반응합니다.',
                bullets: ['나스닥 강세가 이어지면 반도체 대형주에 긍정적으로 연결될 수 있습니다.', '유가 상승은 항공, 화학, 운송 업종에는 부담입니다.', '달러 강세와 동반될 경우 외국인 수급 변화를 확인해야 합니다.']
            }
        },
        {
            id: 'wti', name: 'WTI Crude Oil', short: 'WTI', category: 'energy', categoryLabel: '원유',
            finnhub: 'OANDA:WTICO_USD', unit: 'USD/bbl', price: 78.42, change: -0.68, percent: -0.86,
            note: '미국 서부텍사스산 원유 가격으로 에너지 비용과 인플레이션 압력을 확인',
            history: [80.1, 79.7, 80.4, 79.2, 78.8, 79.1, 78.42],
            metrics: [['상품', 'Crude Oil'], ['벤치마크', 'WTI'], ['수요 민감도', '경기, 이동량'], ['공급 변수', 'OPEC+, 재고'], ['단위', '배럴당 달러'], ['리스크', '지정학']],
            insight: {
                title: 'WTI 하락은 비용 부담 완화 신호지만, 경기 수요 둔화가 원인인지 구분해야 합니다.',
                bullets: ['유가가 빠지면 항공, 운송, 소비재에는 비용 측면에서 우호적입니다.', '급락이 경기 침체 우려에서 나오면 주식시장에는 오히려 부담이 될 수 있습니다.', '브렌트와 방향이 갈리면 지역별 공급 이슈를 따로 확인해야 합니다.']
            }
        },
        {
            id: 'brent', name: 'Brent Crude Oil', short: 'BRENT', category: 'energy', categoryLabel: '원유',
            finnhub: 'OANDA:BCO_USD', unit: 'USD/bbl', price: 82.17, change: -0.44, percent: -0.53,
            note: '글로벌 원유 가격의 대표 벤치마크',
            history: [83.5, 83.1, 83.7, 82.9, 82.4, 82.6, 82.17],
            metrics: [['상품', 'Crude Oil'], ['벤치마크', 'Brent'], ['수요 민감도', '글로벌 경기'], ['공급 변수', '중동, 북해, OPEC+'], ['단위', '배럴당 달러'], ['리스크', '운송로']],
            insight: {
                title: '브렌트는 글로벌 공급 불안과 지정학 리스크를 더 직접적으로 반영하는 편입니다.',
                bullets: ['브렌트 프리미엄 확대는 해외 공급 차질 우려로 해석할 수 있습니다.', '정유, 에너지 기업에는 가격 상승이 실적 기대를 키울 수 있습니다.', '소비재와 제조업에는 원가 부담으로 이어질 수 있습니다.']
            }
        },
        {
            id: 'gold', name: 'Gold Spot', short: 'XAU', category: 'metal', categoryLabel: '귀금속',
            finnhub: 'OANDA:XAU_USD', unit: 'USD/oz', price: 2378.9, change: 19.7, percent: 0.84,
            note: '안전자산, 실질금리, 달러 흐름을 함께 보여 주는 금 현물 가격',
            history: [2318, 2336, 2341, 2352, 2349, 2359, 2378],
            metrics: [['상품', 'Gold'], ['성격', '안전자산'], ['민감 변수', '실질금리, 달러'], ['수요', '중앙은행, ETF'], ['단위', '트로이온스'], ['리스크', '금리 반등']],
            insight: {
                title: '금값 상승은 안전자산 수요 또는 금리 하락 기대가 강해졌다는 신호일 수 있습니다.',
                bullets: ['주식과 금이 같이 오르면 유동성 기대가 함께 작동하는 장세일 수 있습니다.', '달러 약세가 동반되면 금 상승의 지속성이 높아질 수 있습니다.', '유가 상승과 금 상승이 같이 나타나면 인플레이션 헤지 수요를 의심해야 합니다.']
            }
        },
        {
            id: 'silver', name: 'Silver Spot', short: 'XAG', category: 'metal', categoryLabel: '귀금속',
            finnhub: 'OANDA:XAG_USD', unit: 'USD/oz', price: 29.84, change: 0.21, percent: 0.71,
            note: '귀금속 성격과 산업재 수요를 동시에 반영하는 은 가격',
            history: [28.7, 28.9, 29.1, 28.95, 29.4, 29.63, 29.84],
            metrics: [['상품', 'Silver'], ['성격', '귀금속/산업재'], ['민감 변수', '태양광, 제조업'], ['변동성', '높음'], ['단위', '트로이온스'], ['리스크', '경기 둔화']],
            insight: {
                title: '은은 금보다 경기 민감도가 높아 위험 선호와 산업 수요를 같이 봐야 합니다.',
                bullets: ['금보다 강하면 산업재 수요 기대가 붙은 흐름일 수 있습니다.', '나스닥 강세와 동반되면 성장 테마와 원자재 수요가 함께 살아나는 그림입니다.', '변동성이 커서 단기 신호는 금보다 보수적으로 해석해야 합니다.']
            }
        }
    ];

    function getTwelveDataKey() {
        const params = new URLSearchParams(window.location.search);
        const urlKey = params.get('td_key');
        if (urlKey) {
            localStorage.setItem(TWELVE_DATA_KEY_STORAGE, urlKey.trim());
            return urlKey.trim();
        }

        return window.STOCKDASH_TWELVE_DATA_KEY || localStorage.getItem(TWELVE_DATA_KEY_STORAGE)?.trim() || '';
    }

    function valueText(asset) {
        const value = asset.price.toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return asset.unit === 'pt' ? `${value} pt` : `$${value}`;
    }

    function changeText(asset) {
        const sign = asset.change >= 0 ? '+' : '-';
        return `${sign}${Math.abs(asset.change).toLocaleString('ko-KR', { maximumFractionDigits: 2 })} (${sign}${Math.abs(asset.percent).toFixed(2)}%)`;
    }

    async function fetchQuote(asset) {
        const twelveDataQuote = await fetchTwelveDataQuote(asset);
        return twelveDataQuote || fetchYahooQuote(asset);
    }

    async function fetchTwelveDataQuote(asset) {
        const apikey = getTwelveDataKey();
        const symbol = twelveDataSymbols[asset.id];
        if (!apikey || !symbol) return null;

        try {
            const quoteUrl = `${TWELVE_DATA_API}/quote?symbol=${encodeURIComponent(symbol)}&apikey=${encodeURIComponent(apikey)}`;
            const seriesUrl = `${TWELVE_DATA_API}/time_series?symbol=${encodeURIComponent(symbol)}&interval=1min&outputsize=7&apikey=${encodeURIComponent(apikey)}`;
            const [quoteResponse, seriesResponse] = await Promise.all([
                fetch(quoteUrl, { signal: AbortSignal.timeout(7000) }),
                fetch(seriesUrl, { signal: AbortSignal.timeout(7000) })
            ]);
            if (!quoteResponse.ok) return null;

            const quote = await quoteResponse.json();
            if (quote.status === 'error') return null;

            const price = Number(quote.close || quote.price);
            const previous = Number(quote.previous_close);
            if (!Number.isFinite(price) || !Number.isFinite(previous) || price <= 0 || previous <= 0) return null;

            let history = [];
            if (seriesResponse.ok) {
                const series = await seriesResponse.json();
                history = (series.values || [])
                    .map(point => Number(point.close))
                    .filter(value => Number.isFinite(value) && value > 0)
                    .reverse();
            }

            return {
                asset,
                provider: 'Twelve Data',
                quote: {
                    price,
                    previous,
                    time: quote.timestamp,
                    history: history.length >= 2 ? history : asset.history
                }
            };
        } catch {
            return null;
        }
    }

    async function fetchYahooQuote(asset) {
        try {
            const symbol = yahooSymbols[asset.id];
            if (!symbol) return null;

            const sourceUrl = `${YAHOO_CHART_API}${encodeURIComponent(symbol)}?range=1d&interval=1m`;
            const url = `${CORS_PROXY}${encodeURIComponent(sourceUrl)}`;
            const response = await fetch(url, { signal: AbortSignal.timeout(6000) });
            if (!response.ok) return null;
            const payload = await response.json();
            const result = payload?.chart?.result?.[0];
            const meta = result?.meta;
            const closes = result?.indicators?.quote?.[0]?.close?.filter(value => typeof value === 'number' && value > 0) || [];
            const price = meta?.regularMarketPrice || closes.at(-1);
            const previous = meta?.previousClose || meta?.chartPreviousClose || closes[0];
            if (typeof price !== 'number' || typeof previous !== 'number' || price <= 0 || previous <= 0) return null;

            return {
                asset,
                provider: 'Yahoo Finance',
                quote: {
                    price,
                    previous,
                    time: meta?.regularMarketTime,
                    history: sampleHistory(closes)
                }
            };
        } catch {
            return null;
        }
    }

    function sampleHistory(values) {
        const clean = values.filter(value => typeof value === 'number' && value > 0);
        if (clean.length <= 7) return clean;
        const step = (clean.length - 1) / 6;
        return Array.from({ length: 7 }, (_, index) => clean[Math.round(index * step)]);
    }

    async function refreshMarkets() {
        const quotes = await Promise.all(marketAssets.map(fetchQuote));
        const valid = quotes.filter(Boolean);

        if (valid.length) {
            valid.forEach(({ asset, quote }) => {
                asset.price = quote.price;
                asset.change = quote.price - quote.previous;
                asset.percent = (asset.change / quote.previous) * 100;
                if (quote.history.length >= 2) asset.history = quote.history;
                asset.lastTradeTime = quote.time;
            });
        }

        const primaryProvider = valid.some(item => item.provider === 'Twelve Data') ? 'Twelve Data' : valid[0]?.provider;
        setMarketStatus(Boolean(valid.length), primaryProvider);
        renderMarketBoard();
        renderAssetList();
        updateDashboard(marketAssets.find(asset => asset.id === selectedAsset?.id) || marketAssets[0]);
    }

    function setMarketStatus(isLive, provider) {
        const time = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const hasTwelveKey = Boolean(getTwelveDataKey());
        if (isLive && provider === 'Twelve Data') {
            lastProviderStatus = 'Twelve Data 자동 조회';
        } else if (isLive) {
            lastProviderStatus = hasTwelveKey ? 'Twelve Data 실패 · Yahoo 대체' : 'Yahoo Finance 자동 조회';
        } else {
            lastProviderStatus = hasTwelveKey ? 'Twelve Data 조회 실패 · 마지막 값 유지' : 'Twelve Data 키 없음 · Yahoo 대체 실패';
        }
        document.getElementById('update-time').textContent = `${lastProviderStatus} · ${time}`;
        document.getElementById('market-session').textContent = isLive ? '자동 갱신 글로벌 시장' : '글로벌 시장 모니터링';
        document.getElementById('data-source').textContent = lastProviderStatus;
    }

    function visibleAssets() {
        const term = document.getElementById('asset-search')?.value.trim().toLowerCase() || '';
        return marketAssets.filter(asset => {
            const categoryMatch = currentCategory === 'all' || asset.category === currentCategory;
            const termMatch = !term || asset.name.toLowerCase().includes(term) || asset.short.toLowerCase().includes(term) || asset.categoryLabel.toLowerCase().includes(term);
            return categoryMatch && termMatch;
        });
    }

    function renderCategoryTabs() {
        const tabs = document.getElementById('category-tabs');
        tabs.innerHTML = categories.map(category => `
            <button type="button" class="tab-button ${category.id === currentCategory ? 'active' : ''}" data-category="${category.id}">${category.label}</button>
        `).join('');

        tabs.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', () => {
                currentCategory = button.dataset.category;
                renderCategoryTabs();
                renderAssetList();
            });
        });
    }

    function renderAssetList() {
        const list = document.getElementById('asset-list');
        list.innerHTML = visibleAssets().map(asset => {
            const up = asset.change >= 0;
            return `
                <li class="asset-item ${asset.category} ${selectedAsset?.id === asset.id ? 'active' : ''}" data-id="${asset.id}">
                    <div class="asset-symbol">${asset.short.slice(0, 3)}</div>
                    <div class="asset-info">
                        <div class="asset-title">${asset.name}</div>
                        <div class="asset-sub">${asset.categoryLabel} · ${asset.unit}</div>
                    </div>
                    <div class="asset-quote">
                        <strong>${valueText(asset)}</strong>
                        <span class="${up ? 'up' : 'down'}">${changeText(asset)}</span>
                    </div>
                </li>
            `;
        }).join('');

        list.querySelectorAll('.asset-item').forEach(item => {
            item.addEventListener('click', () => {
                const asset = marketAssets.find(entry => entry.id === item.dataset.id);
                if (asset) updateDashboard(asset);
                renderAssetList();
            });
        });
    }

    function renderMarketBoard() {
        const board = document.getElementById('market-board');
        const featured = ['nasdaq', 'kospi', 'wti', 'brent', 'gold'].map(id => marketAssets.find(asset => asset.id === id));
        board.innerHTML = featured.map(asset => {
            const up = asset.change >= 0;
            const min = Math.min(...asset.history);
            const max = Math.max(...asset.history);
            const spread = max - min || 1;
            const bars = asset.history.map(value => `<span style="height:${22 + ((value - min) / spread) * 58}%"></span>`).join('');
            return `
                <button type="button" class="market-tile" data-id="${asset.id}">
                    <div class="tile-label"><span>${asset.name}</span><span>${asset.short}</span></div>
                    <div class="tile-value">${valueText(asset)}</div>
                    <div class="tile-change ${up ? 'up' : 'down'}">${changeText(asset)}</div>
                    <div class="tile-spark">${bars}</div>
                </button>
            `;
        }).join('');

        board.querySelectorAll('.market-tile').forEach(tile => {
            tile.addEventListener('click', () => {
                const asset = marketAssets.find(entry => entry.id === tile.dataset.id);
                if (asset) updateDashboard(asset);
                renderAssetList();
            });
        });
    }

    function updateDashboard(asset) {
        selectedAsset = asset;
        const up = asset.change >= 0;
        document.getElementById('selected-asset-code').textContent = asset.short;
        document.getElementById('selected-asset-category').textContent = asset.categoryLabel;
        document.getElementById('selected-asset-name').textContent = asset.name;
        document.getElementById('selected-asset-note').textContent = asset.note;
        document.getElementById('current-price').textContent = valueText(asset);

        const changeEl = document.getElementById('price-change');
        changeEl.className = `price-delta ${up ? 'up' : 'down'}`;
        changeEl.textContent = changeText(asset);

        document.getElementById('metrics-list').innerHTML = asset.metrics.map(([label, value]) => `
            <div class="metric-row"><span class="metric-label">${label}</span><span class="metric-value">${value}</span></div>
        `).join('');

        renderMacroGrid();
        renderInsight(asset);
        renderChart(asset);
    }

    function renderMacroGrid() {
        const macroIds = ['nasdaq', 'wti', 'gold'];
        document.getElementById('macro-grid').innerHTML = macroIds.map(id => {
            const asset = marketAssets.find(entry => entry.id === id);
            const up = asset.change >= 0;
            return `
                <button type="button" class="macro-item" data-id="${asset.id}">
                    <div class="macro-name">${asset.name}</div>
                    <div class="macro-value">${valueText(asset)}</div>
                    <div class="macro-change ${up ? 'up' : 'down'}">${changeText(asset)}</div>
                </button>
            `;
        }).join('');

        document.querySelectorAll('.macro-item').forEach(item => {
            item.addEventListener('click', () => {
                const asset = marketAssets.find(entry => entry.id === item.dataset.id);
                if (asset) updateDashboard(asset);
                renderAssetList();
            });
        });
    }

    function renderInsight(asset) {
        document.getElementById('insight-content').innerHTML = `
            <div class="insight-headline">${asset.insight.title}</div>
            ${asset.insight.bullets.map((bullet, index) => `
                <div class="insight-bullet">
                    <span class="insight-num">${index + 1}</span>
                    <span class="insight-text">${bullet}</span>
                </div>
            `).join('')}
        `;
    }

    function renderChart(asset) {
        const canvas = document.getElementById('assetChart');
        if (!canvas || !window.Chart) return;
        const ctx = canvas.getContext('2d');
        if (marketChart) marketChart.destroy();

        const up = asset.history[asset.history.length - 1] >= asset.history[0];
        const color = up ? '#20c997' : '#ff6b6b';

        marketChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['6D', '5D', '4D', '3D', '2D', '1D', '오늘'],
                datasets: [{
                    data: asset.history,
                    borderColor: color,
                    backgroundColor: context => {
                        const gradient = context.chart.ctx.createLinearGradient(0, 0, 0, 260);
                        gradient.addColorStop(0, `${color}35`);
                        gradient.addColorStop(1, `${color}00`);
                        return gradient;
                    },
                    fill: true,
                    tension: 0.35,
                    borderWidth: 2,
                    pointRadius: 3,
                    pointBackgroundColor: color,
                    pointBorderColor: '#151a22',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: context => context.parsed.y.toLocaleString('ko-KR', { maximumFractionDigits: 2 })
                        }
                    }
                },
                interaction: { intersect: false, mode: 'index' },
                scales: {
                    x: { grid: { display: false }, border: { display: false }, ticks: { color: '#697687', font: { size: 11 } } },
                    y: {
                        grid: { color: '#1d2530' },
                        border: { display: false },
                        ticks: { color: '#697687', font: { size: 11 }, callback: value => value.toLocaleString('ko-KR', { maximumFractionDigits: 2 }) }
                    }
                }
            }
        });
    }

    function setupGlobalMarketApp() {
        selectedAsset = marketAssets[0];
        renderCategoryTabs();
        renderMarketBoard();
        renderAssetList();
        updateDashboard(selectedAsset);
        setMarketStatus(false);

        document.getElementById('asset-search').addEventListener('input', renderAssetList);

        refreshMarkets();
        setInterval(refreshMarkets, 30000);
    }

    window.onload = setupGlobalMarketApp;
})();
