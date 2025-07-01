const { Octokit } = require("@octokit/rest");
const fs          = require("fs");
const path        = require("path");
const Papa        = require("papaparse");

exports.handler = async ({ httpMethod, body }) => {
  if (httpMethod !== 'POST') return { statusCode: 405, body: "Method Not Allowed" };

  const data = JSON.parse(body);
  // load & parse existing CSV
  const csvPath = path.join(__dirname, '..', 'data', 'EnvironmentalDataSheet.csv');
  const raw     = fs.readFileSync(csvPath, 'utf8');
  const arr     = Papa.parse(raw, { header: false }).data;

  // append new row (match column order)
  const row = [
    data.timestamp,
    data.species,
    data.treatment,
    data.replicate,
    data.temp_c,
    data.humidity_pct,
    data.co2_ppm,
    data.par,
    data.notes.replace(/\n/g,' ')
  ];
  arr.push(row);
  const newCsv = Papa.unparse(arr);

  // commit via GitHub API
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  const owner   = process.env.GITHUB_OWNER;
  const repo    = process.env.GITHUB_REPO;
  const branch  = process.env.GITHUB_BRANCH || 'main';

  // get current file SHA
  const { data: fileData } = await octokit.repos.getContent({ owner, repo, path: 'data/EnvironmentalDataSheet.csv', ref: branch });
  const sha = fileData.sha;

  // update file
  await octokit.repos.createOrUpdateFileContents({
    owner, repo, path: 'data/EnvironmentalDataSheet.csv', message: `Add measurement ${data.timestamp}`,
    content: Buffer.from(newCsv).toString('base64'),
    sha, branch
  });

  return { statusCode: 200, body: JSON.stringify({ success: true }) };
};
