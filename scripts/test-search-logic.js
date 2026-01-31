// using native fetch
// Using native fetch
const loginUrl = 'http://localhost:3333/auth/login';
const importUrl = 'http://localhost:3333/budgets/smart-import';

// User credentials (same as before)
const credentials = {
    email: 'ai-test-user@example.com',
    password: 'Test@123456'
};

async function main() {
    console.log('🚀 Starting Search Logic Test...');

    // 1. Login
    console.log('1️⃣  Attempting Login...');
    const loginRes = await fetch(loginUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
    });

    if (!loginRes.ok) {
        console.error('❌ Login failed:', await loginRes.text());
        return;
    }

    const loginData = await loginRes.json();
    const token = loginData.access_token;
    console.log('✅ Login successful!');

    // 2. Test Smart Import with confusing query
    console.log('2️⃣  Testing "1 disj 10a" ...');
    const res = await fetch(importUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: "1 disj 10a" })
    });

    if (!res.ok) {
        console.error(`❌ Request failed (${res.status}):`, await res.text());
        return;
    }

    const data = await res.json();
    console.log('✅ Response received. Items:', JSON.stringify(data, null, 2));

    // Validation
    if (data.length > 0) {
        const item = data[0];
        console.log(`\n🔎 Analysis:`);
        console.log(`   Source Text: "${item.parsed.raw_text}"`);
        console.log(`   AI Parsed: ${JSON.stringify(item.parsed)}`);
        if (item.product) {
            console.log(`   MATCHED Product: [${item.product.id}] ${item.product.name} (Score: ${item.match_score})`);
            if (item.product.name.includes("10A")) {
                console.log("   ✅ SUCCESS: Found 10A product!");
            } else {
                console.log("   ❌ FAILURE: Did NOT find 10A product (Found something else).");
            }
        } else {
            console.log("   ⚠️  No product matched.");
        }
    } else {
        console.log("⚠️  No items returned by AI.");
    }
}

main();
