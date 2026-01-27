
async function testHealth() {
    const apiBase = 'https://beta-api.portaleletricos.com.br';
    console.log(`Testing health check against: ${apiBase}/health`);

    try {
        const response = await fetch(`${apiBase}/health`);
        const status = response.status;
        const text = await response.text();

        console.log(`Response Status: ${status}`);
        console.log(`Response Body: ${text}`);
    } catch (err) {
        console.error("Network error:", err);
    }
}

testHealth();
