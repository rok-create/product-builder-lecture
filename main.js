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
        history: [245000, 252000, 260000, 266000, 268000, 260000, 271500]
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
        history: [1450000, 1500000, 1550000, 1520000, 1580000, 1600000, 1624000]
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
        history: [880000, 870000, 865000, 868000, 862000, 857000, 845000]
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
        history: [540000, 552000, 565000, 568000, 575000, 570000, 582000]
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
        history: [388000, 396000, 399000, 402000, 410000, 405000, 412000]
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
