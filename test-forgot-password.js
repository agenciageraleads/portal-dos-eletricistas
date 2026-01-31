async function testForgotPassword() {
    const apiBase = 'https://beta-api.portaleletricos.com.br';
    const identifier = 'lucasborgessb@gmail.com';

    console.log(`Testing forgot-password against: ${apiBase}`);
    console.log(`Identifier: ${identifier}`);

    try {
        const response = await fetch(`${apiBase}/auth/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ identifier })
        });

        const status = response.status;
        const text = await response.text();

        console.log(`Response Status: ${status}`);
        console.log(`Response Body: ${text}`);

        if (status === 200 || status === 201) {
            console.log("SUCCESS: Forgot password request passed.");
        } else {
            console.log("FAILURE: Forgot password request failed.");
        }

    } catch (err) {
        console.error("Network or script error:", err);
    }
}

testForgotPassword();
