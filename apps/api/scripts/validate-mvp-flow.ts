
import axios from 'axios';
import { randomUUID } from 'crypto';

const API_URL = 'http://localhost:3333';
const WEB_URL = 'http://localhost:3001';

async function run() {
    try {
        console.log('--- Starting MVP Flow Validation ---');

        // 1. Register
        const cpf = `123123${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}00`; // Pseudo-valid
        const email = `test-${randomUUID()}@demo.com`;
        const password = 'password123';
        const name = 'Electrician Validador';

        console.log(`1. Registering user: ${name} (${cpf})...`);
        try {
            await axios.post(`${API_URL}/auth/register`, {
                name,
                cpf_cnpj: cpf,
                phone: '11999999999',
                password,
                email // Optional in simplified, but good for test
            });
            console.log('✅ Registration success');
        } catch (e: any) {
            console.error('❌ Registration failed:', e.response?.data || e.message);
            process.exit(1);
        }

        // 2. Login
        console.log(`2. Logging in...`);
        let token = '';
        let userId = '';
        try {
            const res = await axios.post(`${API_URL}/auth/login`, {
                username: cpf, // Testing login with CPF
                password
            });
            token = res.data.access_token;
            userId = res.data.user.sub || res.data.user.id;
            console.log('✅ Login success. Token acquired.');
        } catch (e: any) {
            console.error('❌ Login failed:', e.response?.data || e.message);
            process.exit(1);
        }

        // 3. Create Budget
        console.log(`3. Creating Budget...`);
        // Find a product first (optional, or just use hardcoded ID if we know one, but better to fetch)
        // Let's create a simplified budget item
        let budgetId = '';
        try {
            // Need a product. Let's try to search one
            const productsRes = await axios.get(`${API_URL}/products?query=TOMADA`);
            const product = productsRes.data.data[0];

            if (!product) {
                console.warn('⚠️ No products found for "TOMADA". Using dummy ID? No, might fail FK.');
                // throw new Error('No products in DB to budget');
            }

            const payload = {
                clientName: 'Cliente Teste Script',
                clientPhone: '11988887777',
                laborValue: 500,
                status: 'SHARED',
                items: product ? [{
                    productId: product.id,
                    quantity: 5,
                    price: 10.50
                }] : []
            };

            const budgetRes = await axios.post(`${API_URL}/budgets`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            budgetId = budgetRes.data.id;
            console.log(`✅ Budget Created. ID: ${budgetId}`);
        } catch (e: any) {
            console.error('❌ Budget creation failed:', e.response?.data || e.message);
            process.exit(1);
        }

        // 4. Validate Public View (Frontend Fetch)
        const publicUrl = `${WEB_URL}/o/${budgetId}`;
        console.log(`4. Fetching Public View: ${publicUrl}...`);
        try {
            const pageRes = await axios.get(publicUrl);
            const html = pageRes.data;

            console.log('✅ Public Page Loaded.');

            // ANALYZE HTML
            console.log('--- Analysis of Public View HTML ---');

            // Check for Client Name
            if (html.includes('Cliente Teste Script')) {
                console.log('✅ Found Client Name: "Cliente Teste Script"');
            } else {
                console.error('❌ Client Name NOT found in HTML (SSR issue?)');
            }

            // Check for Electrician Name
            if (html.includes(name)) {
                console.log(`✅ Found Electrician Name: "${name}"`);
            } else {
                console.error(`❌ Electrician Name "${name}" NOT found in HTML. (CONFIRMED ISSUE: "Missing Identity")`);
            }

            // Check for Budget Totals
            if (html.includes('500')) { // Labor value
                console.log('✅ Found Labor Value "500"');
            }

        } catch (e: any) {
            console.error('❌ Failed to fetch Public View:', e.message);
        }

        console.log('--- Validation Complete ---');

    } catch (e) {
        console.error('Unexpected error:', e);
    }
}

run();
