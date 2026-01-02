import { getVariations } from '../apps/api/src/products/search-engineering';

function test(token: string) {
    console.log(`Token: "${token}"`);
    const variations = getVariations(token);
    console.log(`Variations: ${JSON.stringify(variations)}`);
}

console.log('--- Testing Search Logic ---');
test('2.5MM');
test('2,5MM');
test('CABO');
test('DISJUNTOR');
