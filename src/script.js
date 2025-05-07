let chartInstance = null;
let chartData = [];
let chartLabels = [];
let currentChartType = "bar";

function updateClock() {
    const clock = document.getElementById("clock");
    const now = new Date();
    const time = now.toLocaleTimeString();
    clock.textContent = time;
}
setInterval(updateClock, 1000);
updateClock(); // Initial call

// Upload and parse Excel file
function uploadFile() {
    const fileInput = document.getElementById('fileInput');
    const uploadStatus = document.getElementById('uploadStatus');

    if (!fileInput.files.length) {
        uploadStatus.textContent = "Please select a file.";
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length < 2) {
            uploadStatus.textContent = "Invalid or empty Excel sheet.";
            return;
        }

        chartLabels = jsonData[0].slice(1);
        chartData = jsonData.slice(1).map(row => ({
            label: row[0],
            data: row.slice(1)
        }));

        uploadStatus.textContent = "File uploaded successfully!";
        showChartTypeModal();
        generateAIInsights();
    };

    reader.readAsArrayBuffer(fileInput.files[0]);
}

// Show chart type selection modal
function showChartTypeModal() {
    const modal = document.getElementById("chartTypeModal");
    if (modal) modal.style.display = "block";
}

// Render chart based on selected type
function updateChart() {
    const chartType = document.getElementById('chartType').value;

    if (chartInstance) {
        chartInstance.destroy();
    }

    const ctx = document.getElementById('chartCanvas').getContext('2d');
    chartInstance = new Chart(ctx, {
        type: chartType,
        data: {
            labels: chartLabels,
            datasets: chartData.map((item, i) => ({
                label: item.label,
                data: item.data,
                backgroundColor: generateColor(i, 0.6),
                borderColor: generateColor(i, 1),
                borderWidth: 1
            }))
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                title: {
                    display: true,
                    text: 'Chart Preview'
                }
            }
        }
    });

    currentChartType = chartType;
    document.getElementById("chartTypeModal").style.display = "none";
}

// Generate color for datasets
function generateColor(index, opacity) {
    const colors = [
        `rgba(255, 99, 132, ${opacity})`,
        `rgba(54, 162, 235, ${opacity})`,
        `rgba(255, 206, 86, ${opacity})`,
        `rgba(75, 192, 192, ${opacity})`,
        `rgba(153, 102, 255, ${opacity})`,
        `rgba(255, 159, 64, ${opacity})`
    ];
    return colors[index % colors.length];
}

// Simulate AI trend analysis
function generateAIInsights() {
    const aiDiv = document.getElementById('aiInsights');
    const trendDiv = document.getElementById('trendPrediction');

    if (!chartData.length) {
        aiDiv.textContent = "No data available for insights.";
        return;
    }

    const trends = chartData.map(item => {
        const values = item.data;
        const trend = values[values.length - 1] > values[0] ? "increasing" : "decreasing";
        return `Trend for ${item.label}: ${trend}`;
    });

    aiDiv.textContent = "Insights Generated:";
    trendDiv.innerHTML = `<ul>${trends.map(t => `<li>${t}</li>`).join('')}</ul>`;
}

// Generate PDF Report
function generateReport() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("eSmart Dash - Data Report", 20, 20);

    doc.setFontSize(12);
    chartData.forEach((item, idx) => {
        doc.text(`${item.label}: ${item.data.join(', ')}`, 20, 40 + (idx * 10));
    });

    doc.text("AI Trend Insights:", 20, 60 + chartData.length * 10);
    const trends = chartData.map(item => {
        const values = item.data;
        return `${item.label}: ${values[values.length - 1] > values[0] ? "Increasing" : "Decreasing"}`;
    });

    trends.forEach((t, i) => {
        doc.text(t, 30, 70 + chartData.length * 10 + i * 10);
    });

    doc.save("eSmartDash_Report.pdf");
}
