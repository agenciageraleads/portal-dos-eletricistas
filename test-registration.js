
const crypto = require('crypto');

function generateCPF() {
    const rnd = (n) => Math.round(Math.random() * n);
    const mod = (dividend, divisor) => Math.round(dividend - (Math.floor(dividend / divisor) * divisor));

    const n1 = rnd(9);
    const n2 = rnd(9);
    const n3 = rnd(9);
    const n4 = rnd(9);
    const n5 = rnd(9);
    const n6 = rnd(9);
    const n7 = rnd(9);
    const n8 = rnd(9);
    const n9 = rnd(9);

    let d1 = n9 * 2 + n8 * 3 + n7 * 4 + n6 * 5 + n5 * 6 + n4 * 7 + n3 * 8 + n2 * 9 + n1 * 10;
    d1 = 11 - (mod(d1, 11));
    if (d1 >= 10) d1 = 0;

    let d2 = d1 * 2 + n9 * 3 + n8 * 4 + n7 * 5 + n6 * 6 + n5 * 7 + n4 * 8 + n3 * 9 + n2 * 10 + n1 * 11;
    d2 = 11 - (mod(d2, 11));
    if (d2 >= 10) d2 = 0;

    return `${n1}${n2}${n3}.${n4}${n5}${n6}.${n7}${n8}${n9}-${d1}${d2}`;
}

async function testRegistration() {
    const apiBase = 'https://beta-api.portaleletricos.com.br';
    const cpf = generateCPF();
    const email = `test_entry_${Date.now()}@example.com`;
    const password = 'Password123!';

    console.log(`Testing registration against: ${apiBase}`);
    console.log(`Generated CPF: ${cpf}`);
    console.log(`Generated Email: ${email}`);

    try {
        const payload = {
            name: "Test User Agent",
            email: email,
            cpf_cnpj: cpf,
            phone: "11999999999",
            password: password,
            termsAccepted: true
        };

        const response = await fetch(`${apiBase}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const status = response.status;
        const text = await response.text();

        console.log(`Response Status: ${status}`);
        console.log(`Response Body: ${text}`);

        if (status === 201 || status === 200) {
            console.log("SUCCESS: Registration passed.");
        } else {
            console.log("FAILURE: Registration failed.");
        }

    } catch (err) {
        console.error("Network or script error:", err);
    }
}

testRegistration();
