const { Octokit } = require('@octokit/rest');

exports.handler = async () => {
  try {
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    const owner   = process.env.GITHUB_OWNER;
    const repo    = process.env.GITHUB_REPO;
    const branch  = process.env.GITHUB_BRANCH || 'main';
    const path    = 'data/EnvironmentalDataSheet.csv';

    const { data: fileData } = await octokit.repos.getContent({
      owner, repo, path, ref: branch
    });

    const content = Buffer.from(fileData.content, 'base64').toString('utf8');
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/csv' },
      body: content
    };
  } catch (err) {
    return {
      statusCode: err.status || 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message })
    };
  }
};
