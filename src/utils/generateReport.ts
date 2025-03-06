export const generateHTML = (scanData: any, aiAnalysis: string) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Security Scan Analysis Report</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/chart.js/3.7.0/chart.min.js"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" rel="stylesheet">
    <style>
        /* General Styles */
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f9;
            color: #333;
            transition: background-color 0.3s, color 0.3s;
        }

        h1 {
            text-align: center;
            color: #2c3e50;
            margin-top: 20px;
        }

        .container {
            max-width: 1200px;
            margin: 20px auto;
            padding: 20px;
            background: #fff;
            border-radius: 10px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
            transition: background-color 0.3s, box-shadow 0.3s;
        }

        /* Summary Cards */
        .summary-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .card {
            background: linear-gradient(135deg, #6a11cb, #2575fc);
            color: #fff;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }

        .card h2 {
            margin: 0;
            font-size: 18px;
        }

        .card p {
            margin: 10px 0 0;
            font-size: 24px;
            font-weight: bold;
        }

        /* Status Code Display */
        .status-codes {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }

        .status-code {
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            color: white;
            font-weight: bold;
        }

        .status-200 { background-color: #27ae60; }
        .status-301 { background-color: #3498db; }
        .status-403 { background-color: #f39c12; }
        .status-404 { background-color: #e74c3c; }
        .status-other { background-color: #95a5a6; }

        /* Charts */
        .chart-container {
            background: #fff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
            margin-bottom: 30px;
            transition: background-color 0.3s;
        }

        canvas {
            width: 100% !important;
            height: auto !important;
            min-height: 300px;
        }

        /* Findings Table */
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }

        th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }

        th {
            background-color: #f8f9fa;
            color: #2c3e50;
        }

        .high-risk { background-color: #ffcccc; }
        .medium-risk { background-color: #ffecb3; }
        .low-risk { background-color: #d9f7be; }

        /* Dropdowns */
        .dropdown {
            margin-bottom: 20px;
        }

        .dropdown-header {
            background: #3498db;
            color: #fff;
            padding: 12px 15px;
            border-radius: 6px;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: background-color 0.3s;
        }

        .dropdown-header:hover {
            background: #2980b9;
        }

        .dropdown-header h2 {
            margin: 0;
            font-size: 16px;
        }

        .dropdown-content {
            display: none;
            background: #fff;
            padding: 15px;
            border-radius: 0 0 6px 6px;
            margin-top: 1px;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
            transition: background-color 0.3s;
        }

        .dropdown.show .dropdown-content {
            display: block;
        }

        /* Key Findings Section */
        .key-findings {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            border-left: 4px solid #3498db;
            transition: background-color 0.3s;
        }

        /* Recommendations Section */
        .recommendations-list {
            padding-left: 20px;
        }

        .recommendations-list li {
            margin-bottom: 10px;
            padding-left: 10px;
        }

        /* Dark Mode Toggle */
        .dark-mode-toggle {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #3498db;
            color: #fff;
            border: none;
            padding: 10px 15px;
            border-radius: 5px;
            cursor: pointer;
            transition: background-color 0.3s;
            z-index: 1000;
        }

        .dark-mode-toggle:hover {
            background: #2980b9;
        }

        /* Dark Mode Styles */
        body.dark-mode {
            background-color: #1e1e2f;
            color: #fff;
        }

        body.dark-mode .container {
            background: #2c3e50;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
        }

        body.dark-mode .chart-container {
            background: #34495e;
        }

        body.dark-mode th {
            background-color: #2c3e50;
            color: #ecf0f1;
        }

        body.dark-mode td, body.dark-mode th {
            border-color: #4a6785;
        }

        body.dark-mode .dropdown-content {
            background: #34495e;
        }

        body.dark-mode .key-findings {
            background-color: #2c3e50;
        }

        body.dark-mode .high-risk { background-color: #5a2828; }
        body.dark-mode .medium-risk { background-color: #5a4828; }
        body.dark-mode .low-risk { background-color: #285a32; }

        @media (max-width: 768px) {
            .summary-cards, .status-codes {
                grid-template-columns: 1fr 1fr;
            }
        }

        @media (max-width: 480px) {
            .summary-cards, .status-codes {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <!-- Dark Mode Toggle -->
    <button class="dark-mode-toggle" onclick="toggleDarkMode()">
        <i class="fas fa-moon"></i> Toggle Dark Mode
    </button>

    <h1>Security Scan Analysis Report</h1>

    <div class="container">
        <!-- Scan Summary Section -->
        <div class="summary-cards">
            <div class="card">
                <h2>Total Requests</h2>
                <p>${scanData.totalRequests}</p>
            </div>
            <div class="card">
                <h2>Security Findings</h2>
                <p>${scanData.securityFindings}</p>
            </div>
            <div class="card">
                <h2>High Risk Issues</h2>
                <p>${scanData.highRiskIssues}</p>
            </div>
            <div class="card">
                <h2>Scan Duration</h2>
                <p>${scanData.scanDuration}</p>
            </div>
        </div>

        <h2>HTTP Status Codes</h2>
        <div class="status-codes">
            ${Object.entries(scanData.statusCodes).map(([code, count]) => `
                <div class="status-code status-${code}">
                    <h3>${code}</h3>
                    <p>${count}</p>
                </div>
            `).join('')}
        </div>

        <!-- Status Code Chart -->
        <div class="chart-container">
            <h2>Status Code Distribution</h2>
            <canvas id="statusChart"></canvas>
        </div>

        <!-- Key Findings Section -->
        <div class="dropdown">
            <div class="dropdown-header" onclick="toggleDropdown(this)">
                <h2>Key Findings</h2>
                <span>▼</span>
            </div>
            <div class="dropdown-content">
                <div class="key-findings">
                    <h3>Security Risk Assessment</h3>
                    <p>${aiAnalysis}</p>
                </div>
            </div>
        </div>

        <!-- Detailed Findings Table -->
        <div class="dropdown">
            <div class="dropdown-header" onclick="toggleDropdown(this)">
                <h2>Detailed Findings</h2>
                <span>▼</span>
            </div>
            <div class="dropdown-content">
                <table>
                    <thead>
                        <tr>
                            <th>Finding Type</th>
                            <th>Risk Level</th>
                            <th>Affected URL</th>
                            <th>Recommendation</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${scanData.findings.map((finding: any) => {
        let riskClass = "low-risk";
        let riskLevel = "Low";
        if (finding.status === 403) { riskClass = "medium-risk"; riskLevel = "Medium"; }
        if (finding.status === 200 && finding.url.includes("admin")) { riskClass = "high-risk"; riskLevel = "High"; }
        return `
                                <tr class="${riskClass}">
                                    <td>Exposed Endpoint</td>
                                    <td>${riskLevel}</td>
                                    <td>${finding.url}</td>
                                    <td>${finding.recommendation || 'Restrict access, implement authentication'}</td>
                                </tr>`;
    }).join("")}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Risk Distribution Chart -->
        <div class="chart-container">
            <h2>Risk Distribution</h2>
            <canvas id="riskChart"></canvas>
        </div>

        <!-- Recommendations Section -->
        <div class="dropdown">
            <div class="dropdown-header" onclick="toggleDropdown(this)">
                <h2>Recommendations</h2>
                <span>▼</span>
            </div>
            <div class="dropdown-content">
                <ul class="recommendations-list">
                    ${scanData.recommendations.map((rec: string) => `<li>${rec}</li>`).join('')}
                </ul>
            </div>
        </div>
    </div>

    <script>
        // Toggle dropdown function
        function toggleDropdown(element) {
            const dropdown = element.parentElement;
            dropdown.classList.toggle("show");
        }

        // Toggle dark mode
        function toggleDarkMode() {
            document.body.classList.toggle('dark-mode');
            localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
            
            // Redraw charts with appropriate colors
            createCharts();
        }

        // Check for saved dark mode preference
        if (localStorage.getItem('darkMode') === 'true') {
            document.body.classList.add('dark-mode');
        }

        // Create charts function
        function createCharts() {
            const isDarkMode = document.body.classList.contains('dark-mode');
            const textColor = isDarkMode ? '#fff' : '#2c3e50';
            
            // Status code chart
            const statusCtx = document.getElementById('statusChart').getContext('2d');
            
            // Destroy existing chart if exists
            if (window.statusChart) {
                window.statusChart.destroy();
            }
            
            window.statusChart = new Chart(statusCtx, {
                type: 'bar',
                data: {
                    labels: ${JSON.stringify(Object.keys(scanData.statusCodes))},
                    datasets: [{
                        label: 'Count',
                        data: ${JSON.stringify(Object.values(scanData.statusCodes))},
                        backgroundColor: ${JSON.stringify(
        Object.keys(scanData.statusCodes).map(code => {
            switch (code) {
                case '200': return '#27ae60';
                case '301': return '#3498db';
                case '403': return '#f39c12';
                case '404': return '#e74c3c';
                default: return '#95a5a6';
            }
        })
    )},

                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: false
                        },
                        title: {
                            display: true,
                            text: 'HTTP Status Code Distribution',
                            color: textColor
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                color: textColor
                            },
                            grid: {
                                color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                            }
                        },
                        x: {
                            ticks: {
                                color: textColor
                            },
                            grid: {
                                color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                            }
                        }
                    }
                }
            });
            
            // Risk distribution chart
            const riskCtx = document.getElementById('riskChart').getContext('2d');
            
            // Destroy existing chart if exists
            if (window.riskChart) {
                window.riskChart.destroy();
            }
            
            window.riskChart = new Chart(riskCtx, {
                type: 'pie',
                data: {
                    labels: ['High Risk', 'Medium Risk', 'Low Risk'],
                    datasets: [{
                        data: [${scanData.highRiskIssues}, ${scanData.mediumRiskIssues || 0}, ${scanData.lowRiskIssues || 0}],
                        backgroundColor: [
                            '#e74c3c',
                            '#f39c12',
                            '#27ae60'
                        ],
                        borderWidth: 1,
                        borderColor: isDarkMode ? '#2c3e50' : '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: {
                                color: textColor
                            }
                        },
                        title: {
                            display: true,
                            text: 'Security Issue Risk Distribution',
                            color: textColor
                        }
                    }
                }
            });
        }
        
        // Initialize charts on page load
        document.addEventListener('DOMContentLoaded', createCharts);
        
        // Initially show the first dropdown
        document.addEventListener('DOMContentLoaded', function() {
            const firstDropdown = document.querySelector('.dropdown');
            if (firstDropdown) {
                firstDropdown.classList.add('show');
            }
        });
    </script>
</body>
</html>`;
};