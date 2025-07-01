const fs   = require('fs');
const path = require('path');
const Papa = require('papaparse');

exports.handler = async () => {
  try {
    const envCsv = fs.readFileSync(path.join(__dirname, '..', 'data', 'EnvironmentalDataSheet.csv'), 'utf8');
    const growCsv = fs.readFileSync(path.join(__dirname, '..', 'data', 'MushroomGrowthDataSheet.csv'), 'utf8');
    const environmental = Papa.parse(envCsv, { header: true, dynamicTyping: true }).data;
    const growth        = Papa.parse(growCsv, { header: true, dynamicTyping: true }).data;
    return {
      statusCode: 200,
      body: JSON.stringify({ environmental, growth })
    };
  } catch (err) {
    return { statusCode: 500, body: err.message };
  }
};
