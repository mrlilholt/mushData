// functions/get-data.js
const { Octokit } = require('@octokit/rest');
const Papa        = require('papaparse');

exports.handler = async () => {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  const owner   = process.env.GITHUB_OWNER;
  const repo    = process.env.GITHUB_REPO;
  const branch  = process.env.GITHUB_BRANCH || 'main';

  // helper to fetch & parse a CSV on GitHub
  async function fetchCsv(pathFile) {
    const { data: fileData } = await octokit.repos.getContent({
      owner, repo, path: pathFile, ref: branch
    });
    const csvRaw = Buffer.from(fileData.content, 'base64').toString('utf8');
    return Papa.parse(csvRaw, { header: true, dynamicTyping: true }).data;
  }

  try {
    const environmental = await fetchCsv('data/EnvironmentalDataSheet.csv');
    const growth        = await fetchCsv('data/MushroomGrowthDataSheet.csv');

    return {
      statusCode: 200,
      body: JSON.stringify({ environmental, growth })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
