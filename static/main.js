document.getElementById('search-form').addEventListener('submit', function (event) {
    event.preventDefault();

    let query = document.getElementById('query').value;
    let resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    fetch('/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            'query': query
        })
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            displayResults(data);
            displayChart(data);
        });
});

function displayResults(data) {
    let resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '<h2>Results</h2>';
    for (let i = 0; i < data.documents.length; i++) {
        let docDiv = document.createElement('div');
        docDiv.innerHTML = `<strong>Document ${data.indices[i]}</strong><p>${data.documents[i]}</p><br><strong>Similarity: ${data.similarities[i]}</strong>`;
        resultsDiv.appendChild(docDiv);
    }
}

let chartInstance;

function displayChart(data) {
    // Input: data (object) - contains the following keys:
    //        - documents (list) - list of documents
    //        - indices (list) - list of indices   
    //        - similarities (list) - list of similarities

    // Get the context of the canvas element where the chart will be rendered

    const ctx = document.getElementById('similarity-chart').getContext('2d');

    if (chartInstance) {
        chartInstance.destroy();
    }

    // Prepare the chart data
    const chartData = {
        labels: data.indices.map(i => `Doc ${i}`),  // Label each bar as "Doc <index>"
        datasets: [{
            label: 'Similarity Score',
            data: data.similarities,                // Use similarity scores as the data
            backgroundColor: 'rgba(75, 192, 192, 0.2)',  // Bar color
            borderColor: 'rgba(75, 192, 192, 1)',       // Border color for the bars
            borderWidth: 1
        }]
    };

    // Configure the chart options
    const chartOptions = {
        scales: {
            y: {
                beginAtZero: true,  // Ensure the y-axis starts at 0
                max: 1
            }
        },
        plugins: {
            tooltip: {
                callbacks: {
                    // Custom tooltip to show the document text in the tooltip
                    afterLabel: function (context) {
                        const docIndex = context.dataIndex;
                        const documentSnippet = data.documents[docIndex].substring(0, 100) + '...'; // Display first 100 characters
                        return `Document Snippet: ${documentSnippet}`;
                    }
                }
            }
        }
    };

    // Create a new chart instance
    chartInstance = new Chart(ctx, {
        type: 'bar',    // Bar chart type
        data: chartData,
        options: chartOptions
    });
}