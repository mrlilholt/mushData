async function loadData() {
    const res  = await fetch('/api/data');
    const json = await res.json();
    return json.environmental; // array of measurements
  }
  
  function renderChart(data) {
    const labels     = data.map(d => new Date(d.timestamp).toLocaleString());
    const parValues  = data.map(d => d.par);
    const tempValues = data.map(d => d.temp_c);
  
    const ctx = document.getElementById('parChart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'PAR',
            data: parValues,
            fill: false,
          },
          {
            label: 'Temp (°C)',
            data: tempValues,
            fill: false,
          }
        ]
      },
      options: {
        responsive: true,
        scales: { x: { display: true }, y: { display: true } }
      }
    });
  }
  
  loadData().then(renderChart).catch(err => {
    console.error(err);
    alert('Failed to load dashboard data');
  });
  