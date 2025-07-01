const form = document.getElementById('dataForm');
const dump = document.getElementById('dump');

async function fetchAll() {
  try {
    const res = await fetch('/api/data');
    const json = await res.json();
    dump.textContent = JSON.stringify(json, null, 2);
  } catch (err) {
    dump.textContent = `Error loading data: ${err}`;
  }
}

form.addEventListener('submit', async e => {
  e.preventDefault();

  const payload = {
    timestamp:       document.getElementById('timestamp').value,
    species:         document.getElementById('species').value,
    treatment:       document.getElementById('treatment').value,
    replicate:       parseInt(document.getElementById('replicate').value, 10),
    temp_c:          parseFloat(document.getElementById('temp_c').value),
    humidity_pct:    parseFloat(document.getElementById('humidity_pct').value),
    co2_ppm:         parseFloat(document.getElementById('co2_ppm').value),
    par:             parseFloat(document.getElementById('par').value),
    notes:           document.getElementById('notes').value
  };

  try {
    const res  = await fetch('/api/data', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload)
    });
    const json = await res.json();

    if (json.success) {
      alert('✔️ Saved!');
      form.reset();
      fetchAll();
    } else {
      alert(`❌ Error: ${json.error || 'Unknown error'}`);
    }
  } catch (err) {
    alert(`❌ Network error: ${err}`);
  }
});

// load everything on page load
fetchAll();
