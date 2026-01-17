// Native fetch assumed (Node 18+)

const BASE_URL = 'http://localhost:3333';
const TEST_EMAIL = 'ai-test-user@example.com';
const TEST_PASS = 'Test@123456';
const TEST_CPF = '06830500910'; // Valid CPF

async function main() {
    console.log('🚀 Starting AI Budget Backend Test...');

    let token = null;

    // 1. Try Login
    console.log('1️⃣  Attempting Login...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASS })
    });

    if (loginRes.ok) {
        const data = await loginRes.json();
        token = data.access_token;
        console.log('✅ Login successful!');
    } else {
        console.log('⚠️  Login failed, attempting Registration...');
        // 2. Register if login failed
        const regRes = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: TEST_EMAIL,
                password: TEST_PASS,
                name: 'AI Test User',
                phone: '11999999999',
                cpf_cnpj: TEST_CPF,
                role: 'ELETRICISTA'
            })
        });

        if (!regRes.ok) {
            const err = await regRes.text();
            console.error('❌ Registration failed:', err);
            process.exit(1);
        }
        console.log('✅ Registration successful! Logging in...');

        // Login again
        const loginRes2 = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASS })
        });

        if (!loginRes2.ok) {
            console.error('❌ Login after registration failed');
            process.exit(1);
        }
        const data = await loginRes2.json();
        token = data.access_token;
    }

    // 3. Test Smart Import
    console.log('2️⃣  Testing /budgets/smart-import...');
    const payload = {
        text: `
      100m Cabo Flexível 2.5mm sil
      20 Disjuntores DIN 20A Tramontina
      5 Tomadas Duplas Pial
    `
    };

    const start = Date.now();
    const importRes = await fetch(`${BASE_URL}/budgets/smart-import`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    });
    const duration = Date.now() - start;

    if (importRes.ok) {
        const data = await importRes.json();
        console.log(`✅ Success (${duration}ms)! Response:`);
        console.log(JSON.stringify(data, null, 2));

        if (data.length === 0) {
            console.warn('⚠️  Warning: Returned empty list.');
        } else {
            console.log(`🎉 Found ${data.length} items.`);
        }
    } else {
        const err = await importRes.text();
        console.error(`❌ Request failed (${importRes.status}):`, err);
    }
}

main().catch(console.error);
