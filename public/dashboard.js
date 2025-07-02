// public/dashboard.js

// 1. Point at your raw GitHub URL
const CSV_URL = 
  'https://raw.githubusercontent.com/<GITHUB_OWNER>/<GITHUB_REPO>/main/data/EnvironmentalDataSheet.csv';

(async function(){
  try {
    // 2. Fetch the CSV directly
    const res     = await fetch(CSV_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const csvText = await res.text();

    // 3. Parse it with PapaParse
    const { data } = Papa.parse(csvText, { header: true, dynamicTyping: true });
    const measurements = data.filter(r => r.timestamp);

    // 4. Chart PAR vs Time and Temp vs Time
    const labels     = measurements.map(d => new Date(d.timestamp).toLocaleString());
    const parValues  = measurements.map(d => d.par);
    const tempValues = measurements.map(d => d.temp_c);

    new Chart(
      document.getElementById('parChart').getContext('2d'),
      {
        type: 'line',
        data: {
          labels,
          datasets: [
            { label: 'PAR (µmol·m⁻²·s⁻¹)', data: parValues, fill: false },
            { label: 'Temp (°C)',           data: tempValues, fill: false }
          ]
        },
        options: { responsive: true }
      }
    );
  } catch (err) {
    console.error(err);
    alert('Failed to load dashboard data:\n' + err);
  }
})();
