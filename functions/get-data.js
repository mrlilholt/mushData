// functions/submit-data.js
const { Octokit } = require('@octokit/rest');
const Papa        = require('papaparse');

exports.handler = async ({ httpMethod, body }) => {
  if (httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const payload = JSON.parse(body);
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  const owner   = process.env.GITHUB_OWNER;
  const repo    = process.env.GITHUB_REPO;
  const branch  = process.env.GITHUB_BRANCH || 'main';
  const pathFile = 'data/EnvironmentalDataSheet.csv';

  try {
    // try to fetch the existing CSV
    const { data: fileData } = await octokit.repos.getContent({
      owner, repo, path: pathFile, ref: branch
    });

    // decode, append, re-encode, commit (as before)…
    const csvRaw = Buffer.from(fileData.content, 'base64').toString('utf8');
    const rows   = Papa.parse(csvRaw, { header: false }).data;
    rows.push([
      payload.timestamp, payload.species, payload.treatment,
      payload.replicate, payload.temp_c, payload.humidity_pct,
      payload.co2_ppm,   payload.par,     payload.notes.replace(/\n/g,' ')
    ]);
    const newCsv = Papa.unparse(rows);

    await octokit.repos.createOrUpdateFileContents({
      owner, repo, path: pathFile,
      message: `Add measurement ${payload.timestamp}`,
      content: Buffer.from(newCsv).toString('base64'),
      sha: fileData.sha,
      branch
    });

    return { statusCode: 200, body: JSON.stringify({ success: true }) };

  } catch (err) {
    // if it's a 404 from GitHub, give a clear message
    if (err.status === 404) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: `CSV not found at "${pathFile}" in ${owner}/${repo}@${branch}`
        })
      };
    }
    // otherwise just bubble up the error
    return {
      statusCode: err.status || 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
