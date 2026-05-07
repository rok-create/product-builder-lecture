// Mock Data for Korean Stocks
const stockData = [
    {
        name: "삼성전자",
        code: "005930",
        price: 78500,
        change: 1200,
        percent: 1.55,
        per: 35.21,
        pbr: 1.45,
        marketCap: "468.5조",
        eps: "2,230원",
        dividend: "2.1%",
        roe: "12.5%",
        history: [72000, 73500, 71000, 74000, 75500, 76000, 78500]
    },
    {
        name: "SK하이닉스",
        code: "000660",
        price: 185400,
        change: -2100,
        percent: -1.12,
        per: 15.4,
        pbr: 1.8,
        marketCap: "135.2조",
        eps: "12,040원",
        dividend: "0.8%",
        roe: "18.2%",
        history: [165000, 170000, 175000, 182000, 188000, 190000, 185400]
    },
    {
        name: "NAVER",
        code: "035420",
        price: 188500,
        change: 4500,
        percent: 2.45,
        per: 28.5,
        pbr: 1.2,
        marketCap: "30.8조",
        eps: "6,610원",
        dividend: "0.5%",
        roe: "10.1%",
        history: [180000, 178000, 182000, 185000, 184000, 186000, 188500]
    },
    {
        name: "현대차",
        code: "005380",
        price: 245000,
        change: 0,
        percent: 0.00,
        per: 5.8,
        pbr: 0.6,
        marketCap: "52.1조",
        eps: "42,200원",
        dividend: "4.5%",
        roe: "14.5%",
        history: [230000, 235000, 238000, 240000, 242000, 245000, 245000]
    },
    {
        name: "카카오",
        code: "035720",
        price: 48200,
        change: -800,
        percent: -1.63,
        per: 42.1,
        pbr: 2.1,
        marketCap: "21.4조",
        eps: "1,145원",
        dividend: "0.2%",
        roe: "5.4%",
        history: [52000, 51000, 50500, 49800, 49200, 49000, 48200]
    }
];

let currentChart = null;

// Initialize the app
function init() {
    renderTrendingList();
    updateDashboard(stockData[0]); // Default to Samsung
    setupSearch();
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
