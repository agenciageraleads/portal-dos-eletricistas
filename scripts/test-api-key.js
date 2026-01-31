const fs = require('fs');
const path = require('path');

// Determine path to .env
const envPath = path.join(__dirname, '../apps/api/.env');

console.log('🔍 Reading .env from:', envPath);

try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/OPENAI_API_KEY=(sk-proj-[a-zA-Z0-9_\-]+)/);

    if (!match) {
        console.error('❌ Could not find OPENAI_API_KEY in .env file');
        // Try searching without the 'sk-proj' prefix just in case (older keys)
        const matchSimple = envContent.match(/OPENAI_API_KEY=(sk-[a-zA-Z0-9]+)/);
        if (matchSimple) {
            console.log('⚠️  Found legacy sk- format key.');
            testKey(matchSimple[1]);
        } else {
            // Fallback: simple split
            const lines = envContent.split('\n');
            const keyLine = lines.find(l => l.startsWith('OPENAI_API_KEY='));
            if (keyLine) {
                const key = keyLine.split('=')[1].trim().replace(/"/g, '');
                testKey(key);
            } else {
                process.exit(1);
            }
        }
    } else {
        console.log('✅ Found API Key format matches expectation (sk-proj-...)');
        testKey(match[1]);
    }

} catch (e) {
    console.error('❌ Error reading .env:', e.message);
}

async function testKey(apiKey) {
    console.log(`🔑 Testing Key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`);

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: 'Say hello' }],
                max_tokens: 5
            })
        });

        if (response.ok) {
            console.log('✅ KEY IS VALID for Chat/GPT-4o-mini! OpenAI returned 200 OK.');
        } else {
            console.error(`❌ KEY FAILURE: ${response.status} ${response.statusText}`);
            const body = await response.json();
            console.error('Response:', JSON.stringify(body, null, 2));
        }
    } catch (e) {
        console.error('❌ Network/Fetch Error:', e.message);
    }
}
