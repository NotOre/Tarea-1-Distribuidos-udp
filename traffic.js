import csv from 'csv-parser';
import fs from 'fs';
import axios from 'axios';


const csvFilePath = '/home/ore/Desktop/Codigos/Trabajo-actual/Tarea-1-distribuidos/archivo_limitado_1.csv';


const domains = [];
fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on('data', (row) => {
    domains.push(row.domain);
  })
  .on('end', () => {
    console.log('Dataset leído completamente. Iniciando simulación de tráfico...');
    simulateTraffic();
  });

async function simulateTraffic() {
  for (let i = 0; i < domains.length; i++) {
    const domain = domains[i];
    
    try {
      const response = await axios.get(`http://localhost:3000/resolve/${domain}`);
      console.log(`Solicitud a ${domain}: ${response.data.ip} (source: ${response.data.source})`);
    } catch (error) {
      console.error(`Error al resolver ${domain}:`, error.response ? error.response.data : error.message);
    }
    await delay(100);
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}