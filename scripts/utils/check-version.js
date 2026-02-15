async function checkVersion() {
    const apiBase = 'https://beta-api.portaleletricos.com.br';

    console.log(`Checking API version...`);

    try {
        const response = await fetch(`${apiBase}/health`);
        const data = await response.json();
        
        console.log(`API Version: ${data.checks?.system?.version || 'unknown'}`);
        console.log(`Uptime: ${data.checks?.system?.uptime || 'unknown'} seconds`);
        console.log(`Timestamp: ${data.checks?.system?.timestamp || 'unknown'}`);
        
        return data.checks?.system?.version;
    } catch (err) {
        console.error("Error:", err);
    }
}

checkVersion();
