async function loadData() {
    const res     = await fetch('/api/data.csv');
    const csvText = await res.text();
    const result  = Papa.parse(csvText, { header: true, dynamicTyping: true });
    return result.data.filter(r => r.timestamp); // drop any blank rows
  }
  
  function renderChart(data) {
    const labels     = data.map(d => new Date(d.timestamp).toLocaleString());
    const parValues  = data.map(d => d.par);
    const tempValues = data.map(d => d.temp_c);
  
    new Chart(document.getElementById('parChart').getContext('2d'), {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: 'PAR',   data: parValues,  fill: false },
          { label: 'Temp (°C)', data: tempValues, fill: false }
        ]
      },
      options: { responsive: true }
    });
  }
  
  loadData()
    .then(renderChart)
    .catch(err => {
      console.error(err);
      alert('Failed to load dashboard data');
    });
  