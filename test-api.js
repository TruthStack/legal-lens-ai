const API_KEY = 'AIzaSyAJb9H2WB-wZtaaZ6wgIUQp7JNJVzlg4Uw';

async function testDirectAPI() {
    console.log('🔍 Testing direct REST API...\n');

    try {
        // Test 1: List models
        console.log('📋 Fetching available models...');
        const listResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${API_KEY}`);
        const data = await listResponse.json();

        if (data.models) {
            console.log(`✅ Found ${data.models.length} models:\n`);
            data.models.forEach(model => {
                console.log(`  - ${model.name}`);
            });

            // Test 2: Try generating content with first model that supports generateContent
            const genModel = data.models.find(m =>
                m.supportedGenerationMethods?.includes('generateContent')
            );

            if (genModel) {
                console.log(`\n🧪 Testing generation with ${genModel.name}...`);
                const genResponse = await fetch(
                    `https://generativelanguage.googleapis.com/v1/${genModel.name}:generateContent?key=${API_KEY}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: 'Say hello in 3 words' }] }]
                        })
                    }
                );

                const genData = await genResponse.json();
                if (genData.candidates) {
                    console.log(`✅ SUCCESS!`);
                    console.log(`Response: ${genData.candidates[0].content.parts[0].text}`);
                } else {
                    console.log(`❌ Error:`, genData);
                }
            }
        } else {
            console.log('❌ Error:', data);
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testDirectAPI();
