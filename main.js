// Global State
let currentChart = null;
let lastUpdateTime = new Date();

// Mock Data for Korean Stocks (Context: May 7, 2026 - AI & Memory Boom)
const stockData = [
    {
        name: "삼성전자",
        code: "005930",
        price: 271500,
        change: 5500,
        percent: 2.07,
        per: 12.5,
        pbr: 2.8,
        marketCap: "1,620.5조",
        eps: "21,720원",
        dividend: "1.2%",
        roe: "22.5%",
        history: [245000, 252000, 260000, 266000, 268000, 260000, 271500],
        news: {
            title: "삼성전자, HBM4 양산 계획 발표 및 글로벌 공급 확대",
            summary: [
                "2026년 하반기 HBM4 본격 양산 계획을 발표하며 AI 반도체 시장 주도권 강화",
                "엔비디아 외 추가 글로벌 빅테크 기업들과의 대규모 공급 계약 체결 소식",
                "분기 영업이익 20조 원 돌파 가능성에 따른 외국인 투자자 집중 매수"
            ]
        }
    },
    {
        name: "SK하이닉스",
        code: "000660",
        price: 1624000,
        change: 42000,
        percent: 2.65,
        per: 10.4,
        pbr: 3.5,
        marketCap: "1,180.2조",
        eps: "156,150원",
        dividend: "0.5%",
        roe: "34.2%",
        history: [1450000, 1500000, 1550000, 1520000, 1580000, 1600000, 1624000],
        news: {
            title: "SK하이닉스, 1b 나노 공정 수율 90% 달성.. 업계 최고 수준",
            summary: [
                "차세대 메모리 공정 수율을 조기에 확보하며 경쟁사 대비 압도적인 수익성 증명",
                "데이터센터용 초고성능 SSD 수요 폭증으로 인해 연간 수주 물량 이미 완판",
                "시가총액 1,200조 원 육박하며 글로벌 반도체 기업 5위권 진입 시도"
            ]
        }
    },
    {
        name: "LG에너지솔루션",
        code: "373220",
        price: 845000,
        change: -12000,
        percent: -1.40,
        per: 45.4,
        pbr: 5.2,
        marketCap: "197.9조",
        eps: "18,600원",
        dividend: "0.1%",
        roe: "12.8%",
        history: [880000, 870000, 865000, 868000, 862000, 857000, 845000],
        news: {
            title: "전고체 배터리 상용화 앞당긴다.. LG엔솔 연구 성과 발표",
            summary: [
                "꿈의 배터리로 불리는 전고체 배터리의 핵심 전해질 안정성 테스트 성공",
                "유럽 내 주요 완성차 업체와의 합작 공장(JV) 가동률 100% 근접",
                "단기적으로 원자재 가격 변동에 따른 수익성 소폭 하락 가능성 제기"
            ]
        }
    },
    {
        name: "현대차",
        code: "005380",
        price: 582000,
        change: 15000,
        percent: 2.64,
        per: 6.2,
        pbr: 1.1,
        marketCap: "124.2조",
        eps: "93,800원",
        dividend: "3.5%",
        roe: "18.1%",
        history: [540000, 552000, 565000, 568000, 575000, 570000, 582000],
        news: {
            title: "현대차, 자율주행 레벨 4 양산차 공개.. 모빌리티 시장 선점",
            summary: [
                "운전자의 개입이 거의 없는 자율주행 레벨 4 차량의 양산 준비 완료 및 공개",
                "미국 및 인도 시장에서의 점유율 확대가 지속되며 연간 순이익 최고치 경신",
                "배당 확대 및 자사주 소각 등 강력한 주주 환원 정책 지속 발표"
            ]
        }
    },
    {
        name: "NAVER",
        code: "035420",
        price: 412000,
        change: 8500,
        percent: 2.11,
        per: 24.8,
        pbr: 2.3,
        marketCap: "67.2조",
        eps: "16,610원",
        dividend: "0.5%",
        roe: "14.1%",
        history: [388000, 396000, 399000, 402000, 410000, 405000, 412000],
        news: {
            title: "네이버, 생성형 AI 하이퍼클로바X B2B 매출 본격화",
            summary: [
                "국내 주요 공공기관 및 대기업 대상 AI 솔루션 공급 계약이 실적으로 가시화",
                "광고 매출의 안정적 성장과 커머스 부문의 수익성 개선이 동반 진행 중",
                "글로벌 웹툰 사업의 미국 증시 상장 기대감에 따른 기업 가치 재평가"
            ]
        }
    }
];

// Initialize the app
function init() {
    renderTrendingList();
    updateDashboard(stockData[0]); // Default to Samsung
    setupSearch();
    updateMarketStatus();
    
    // Set up auto-refresh every hour (3600000 ms)
    setInterval(() => {
        console.log("자동 1시간 업데이트 실행 중...");
        lastUpdateTime = new Date();
        updateMarketStatus();
    }, 3600000);
}

// Update KOSPI status (2026 Reality: 7,000+)
function updateMarketStatus() {
    const marketStatusEl = document.querySelector('.market-status');
    const timeStr = lastUpdateTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    marketStatusEl.innerHTML = `
        <span class="status-indicator live"></span> 
        KOSPI <span class="value" style="color: var(--up-color); font-weight: bold;">7,252.14</span> 
        <span class="up">▲ 124.32 (1.74%)</span>
        <span style="margin-left: 10px; font-size: 0.75rem; color: var(--text-secondary);">최종 업데이트: 2026.05.07 ${timeStr}</span>
    `;
}

// Render the sidebar trending list
function renderTrendingList() {
    const listElement = document.getElementById('trending-list');
    listElement.innerHTML = '';

    stockData.forEach(stock => {
        const li = document.createElement('li');
        li.className = 'stock-item';
        if (stock.name === document.getElementById('selected-stock-name').innerText) {
            li.classList.add('active');
        }

        const isUp = stock.change >= 0;
        const colorClass = isUp ? 'up' : 'down';
        const sign = isUp ? '▲' : '▼';

        li.innerHTML = `
            <div>
                <span class="name">${stock.name}</span>
                <span class="code">${stock.code}</span>
            </div>
            <div class="trend-price">
                <div class="${colorClass}">${stock.price.toLocaleString()}원</div>
                <div class="${colorClass}" style="font-size: 0.75rem;">${sign} ${Math.abs(stock.percent)}%</div>
            </div>
        `;

        li.addEventListener('click', () => {
            document.querySelectorAll('.stock-item').forEach(el => el.classList.remove('active'));
            li.classList.add('active');
            updateDashboard(stock);
        });

        listElement.appendChild(li);
    });
}

// Update the main dashboard with selected stock data
function updateDashboard(stock) {
    document.getElementById('selected-stock-name').innerText = stock.name;
    document.getElementById('selected-stock-code').innerText = stock.code;
    
    const priceEl = document.getElementById('current-price');
    priceEl.innerText = `${stock.price.toLocaleString()}원`;
    
    const changeEl = document.getElementById('price-change');
    const isUp = stock.change >= 0;
    changeEl.className = `price-change ${isUp ? 'up' : 'down'}`;
    const sign = isUp ? '▲' : '▼';
    changeEl.innerText = `${sign} ${Math.abs(stock.change).toLocaleString()} (${stock.percent}%)`;

    // Update Metrics
    document.getElementById('metric-per').innerText = stock.per;
    document.getElementById('metric-pbr').innerText = stock.pbr;
    document.getElementById('metric-marketcap').innerText = stock.marketCap;
    document.getElementById('metric-eps').innerText = stock.eps;
    document.getElementById('metric-dividend').innerText = stock.dividend;
    document.getElementById('metric-roe').innerText = stock.roe;

    // Update News
    updateNews(stock.news);

    renderChart(stock.history);
}

function updateNews(news) {
    const newsContent = document.getElementById('news-content');
    newsContent.innerHTML = `
        <div class="news-item">
            <h4>${news.title}</h4>
            <ul>
                ${news.summary.map(item => `<li>${item}</li>`).join('')}
            </ul>
        </div>
    `;
}

// Render Price Chart using Chart.js
function renderChart(historyData) {
    const ctx = document.getElementById('stockChart').getContext('2d');
    
    if (currentChart) {
        currentChart.destroy();
    }

    const isUp = historyData[historyData.length - 1] >= historyData[0];
    const chartColor = isUp ? '#ef4444' : '#3b82f6';

    currentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['6일 전', '5일 전', '4일 전', '3일 전', '2일 전', '1일 전', '오늘'],
            datasets: [{
                label: '주가',
                data: historyData,
                borderColor: chartColor,
                backgroundColor: chartColor + '20',
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 4,
                pointBackgroundColor: chartColor
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: '#94a3b8' }
                },
                y: {
                    grid: { color: '#334155' },
                    ticks: { color: '#94a3b8' }
                }
            }
        }
    });
}

// Setup search functionality
function setupSearch() {
    const searchInput = document.getElementById('stock-search');
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const items = document.querySelectorAll('.stock-item');
        
        items.forEach((item, index) => {
            const stock = stockData[index];
            if (stock.name.toLowerCase().includes(term) || stock.code.includes(term)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    });
}

// Run init on load
window.onload = init;
