// Global State
let currentChart = null;
let lastUpdateTime = new Date("2026-05-08T09:00:00"); // Set to May 8, 2026

// Mock Data for Korean Stocks (Context: May 8, 2026 - AI & Memory Boom)
const stockData = [
    {
        name: "삼성전자",
        code: "005930",
        price: 275500,
        change: 4000,
        percent: 1.47,
        per: 12.8,
        pbr: 2.9,
        marketCap: "1,644.5조",
        eps: "21,720원",
        dividend: "1.2%",
        roe: "22.5%",
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
        name: "SK하이닉스",
        code: "000660",
        price: 1642000,
        change: 18000,
        percent: 1.11,
        per: 10.6,
        pbr: 3.6,
        marketCap: "1,195.2조",
        eps: "156,150원",
        dividend: "0.5%",
        roe: "34.2%",
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
        name: "LG에너지솔루션",
        code: "373220",
        price: 852000,
        change: 7000,
        percent: 0.83,
        per: 45.8,
        pbr: 5.3,
        marketCap: "199.3조",
        eps: "18,600원",
        dividend: "0.1%",
        roe: "12.8%",
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
        name: "현대차",
        code: "005380",
        price: 588000,
        change: 6000,
        percent: 1.03,
        per: 6.3,
        pbr: 1.2,
        marketCap: "125.8조",
        eps: "93,800원",
        dividend: "3.5%",
        roe: "18.1%",
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
        name: "NAVER",
        code: "035420",
        price: 415000,
        change: 3000,
        percent: 0.73,
        per: 25.1,
        pbr: 2.4,
        marketCap: "67.8조",
        eps: "16,610원",
        dividend: "0.5%",
        roe: "14.1%",
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

// Initialize the app
function init() {
    renderTrendingList();
    updateDashboard(stockData[0]); // Default to Samsung
    setupSearch();
    updateMarketStatus();
    
    // Set up auto-refresh every hour (3600000 ms)
    setInterval(() => {
        console.log("자동 1시간 업데이트 실행 중...");
        // 1시간마다 현재 시간(5월 8일 기준)을 유지하며 업데이트
        lastUpdateTime = new Date(lastUpdateTime.getTime() + 3600000);
        updateMarketStatus();
    }, 3600000);
}

// Update KOSPI status (2026 Reality: 7,000+)
function updateMarketStatus() {
    const marketStatusEl = document.querySelector('.market-status');
    const timeStr = lastUpdateTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    marketStatusEl.innerHTML = `
        <span class="status-indicator live"></span> 
        KOSPI <span class="value" style="color: var(--up-color); font-weight: bold;">7,285.42</span> 
        <span class="up">▲ 33.28 (0.46%)</span>
        <span style="margin-left: 10px; font-size: 0.75rem; color: var(--text-secondary);">최종 업데이트: 2026.05.08 ${timeStr}</span>
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
