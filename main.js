// Global State
let currentChart = null;
let lastUpdateTime = new Date();

// Mock Data for Korean Stocks (Updated for May 2024 Context)
const stockData = [
    {
        name: "삼성전자",
        code: "005930",
        price: 79200,
        change: 1400,
        percent: 1.80,
        per: 36.5,
        pbr: 1.5,
        marketCap: "472.8조",
        eps: "2,230원",
        dividend: "2.1%",
        roe: "12.5%",
        history: [75000, 76200, 74800, 77000, 78500, 77800, 79200]
    },
    {
        name: "SK하이닉스",
        code: "000660",
        price: 192300,
        change: 6900,
        percent: 3.72,
        per: 16.2,
        pbr: 2.1,
        marketCap: "140.0조",
        eps: "12,040원",
        dividend: "0.8%",
        roe: "18.2%",
        history: [172000, 178000, 185000, 182000, 190000, 188000, 192300]
    },
    {
        name: "LG에너지솔루션",
        code: "373220",
        price: 388500,
        change: -4500,
        percent: -1.15,
        per: 65.4,
        pbr: 4.2,
        marketCap: "90.9조",
        eps: "5,940원",
        dividend: "0.0%",
        roe: "6.8%",
        history: [405000, 400000, 395000, 398000, 392000, 390000, 388500]
    },
    {
        name: "현대차",
        code: "005380",
        price: 251500,
        change: 3500,
        percent: 1.41,
        per: 5.2,
        pbr: 0.7,
        marketCap: "53.2조",
        eps: "48,200원",
        dividend: "4.8%",
        roe: "15.1%",
        history: [240000, 242000, 245000, 248000, 250000, 248000, 251500]
    },
    {
        name: "NAVER",
        code: "035420",
        price: 191200,
        change: 1200,
        percent: 0.63,
        per: 29.8,
        pbr: 1.3,
        marketCap: "31.2조",
        eps: "6,610원",
        dividend: "0.5%",
        roe: "10.1%",
        history: [188000, 186000, 189000, 192000, 190000, 189000, 191200]
    },
    {
        name: "기아",
        code: "000270",
        price: 118400,
        change: 2100,
        percent: 1.81,
        per: 4.8,
        pbr: 1.1,
        marketCap: "47.8조",
        eps: "24,500원",
        dividend: "5.1%",
        roe: "23.4%",
        history: [110000, 112000, 115000, 114000, 116000, 117000, 118400]
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
        // 실제 운영 시 이곳에서 API를 호출하여 stockData를 갱신합니다.
    }, 3600000);
}

// Update KOSPI status (2750+ as requested)
function updateMarketStatus() {
    const marketStatusEl = document.querySelector('.market-status');
    const timeStr = lastUpdateTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    marketStatusEl.innerHTML = `
        <span class="status-indicator live"></span> 
        KOSPI <span class="value" style="color: var(--up-color); font-weight: bold;">2,752.14</span> 
        <span class="up">▲ 24.32 (0.89%)</span>
        <span style="margin-left: 10px; font-size: 0.75rem; color: var(--text-secondary);">최종 업데이트: ${timeStr}</span>
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

    renderChart(stock.history);
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
            labels: ['1일 전', '2일 전', '3일 전', '4일 전', '5일 전', '6일 전', '오늘'],
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
