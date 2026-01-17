// Native fetch assumed (Node 18+)

const BASE_URL = 'http://localhost:3333';
const TEST_EMAIL = 'ai-test-user@example.com';
const TEST_PASS = 'Test@123456';
// Generator for valid CPF
function generateCPF() {
    const rnd = (n) => Math.round(Math.random() * n);
    const mod = (base, div) => Math.round(base - Math.floor(base / div) * div);
    const n = Array(9).fill(0).map(() => rnd(9));

    let d1 = n.reduce((a, v, i) => a + v * (10 - i), 0);
    d1 = 11 - mod(d1, 11);
    if (d1 >= 10) d1 = 0;

    let d2 = n.reduce((a, v, i) => a + v * (11 - i), 0) + d1 * 2;
    d2 = 11 - mod(d2, 11);
    if (d2 >= 10) d2 = 0;

    return [...n, d1, d2].join('');
}

const TEST_CPF = generateCPF(); // Generate valid CPF dynamically


async function main() {
    console.log('🚀 Starting AI Budget Backend Test...');

    let token = null;

    // 1. Try Login
    console.log('1️⃣  Attempting Login...');
    try {
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
                // If already exists but login failed, maybe password mismatch? 
                // We can't fix it easily without DB access or trying another user.
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
    } catch (e) {
        console.error('Connection error:', e);
        process.exit(1);
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
    try {
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
        } else {
            const err = await importRes.text();
            console.error(`❌ Request failed (${importRes.status}):`, err);
        }
    } catch (e) {
        console.error('Request error:', e);
    }
}

main().catch(console.error);
