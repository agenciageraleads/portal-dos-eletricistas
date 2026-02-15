async function testProducts() {
    const apiBase = 'https://beta-api.portaleletricos.com.br';

    console.log(`Testing products endpoint against: ${apiBase}`);

    try {
        const response = await fetch(`${apiBase}/products`);
        const status = response.status;
        const text = await response.text();

        console.log(`Response Status: ${status}`);
        console.log(`Response Body (first 500 chars): ${text.substring(0, 500)}`);

        if (status === 200) {
            console.log("SUCCESS: Products endpoint working.");
        } else {
            console.log("FAILURE: Products endpoint failed.");
        }

    } catch (err) {
        console.error("Network or script error:", err);
    }
}

testProducts();
