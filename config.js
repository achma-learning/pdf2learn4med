// config.js - Edit this with your output folder URL
const BASE_URL = '';  // e.g., 'https://yourusername.github.io/s-ecn-downloads/'

// Function to fetch and parse TSV data
async function loadData() {
    // For demo: Assume TSV is uploaded to /data/s-ecn-export.tsv
    // In production, fetch from BASE_URL + 'S-ECN_Export.txt' if hosted
    const response = await fetch('data/s-ecn-export.tsv');
    const text = await response.text();
    const lines = text.split('\n').slice(1);  // Skip header
    return lines.map(line => {
        const [module, title, nodeUrl, pdfUrl, date] = line.split('\t').map(s => s.trim());
        return {
            module,
            title,
            nodeUrl,
            pdfUrl: pdfUrl ? (BASE_URL + pdfUrl).replace(/\/+/g, '/') : pdfUrl,  // Prepend BASE_URL if relative
            date: date || 'N/A'
        };
    }).filter(item => item.title);  // Filter empty
}
