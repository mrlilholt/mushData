// functions/submit-data.js
const { Octokit } = require('@octokit/rest');
const Papa = require('papaparse');

exports.handler = async ({ httpMethod, body }) => {
  if (httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  let data;
  try {
    data = JSON.parse(body);
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON body' })
    };
  }

  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  const owner  = process.env.GITHUB_OWNER;
  const repo   = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || 'main';
  const pathFile = 'data/EnvironmentalDataSheet.csv';

  try {
    // 1. Fetch the existing CSV via GitHub
    const { data: fileData } = await octokit.repos.getContent({
      owner, repo, path: pathFile, ref: branch
    });

    // 2. Decode & parse it
    const csvRaw = Buffer.from(fileData.content, 'base64').toString('utf8');
    const rows   = Papa.parse(csvRaw, { header: false }).data;

    // 3. Append your new row (must match column order)
    rows.push([
      data.timestamp,
      data.species,
      data.treatment,
      data.replicate,
      data.temp_c,
      data.humidity_pct,
      data.co2_ppm,
      data.par,
      data.notes.replace(/\n/g,' ')
    ]);

    // 4. Re-stringify to CSV
    const newCsv = Papa.unparse(rows);

    // 5. Commit it back to GitHub
    await octokit.repos.createOrUpdateFileContents({
      owner, repo, path: pathFile,
      message: `Add measurement ${data.timestamp}`,
      content: Buffer.from(newCsv).toString('base64'),
      sha: fileData.sha,
      branch
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
