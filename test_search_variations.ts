
import { getVariations } from './apps/api/src/products/search-engineering';

console.log('Testing S8 (Expect S8, S08):', getVariations('S8'));
console.log('Testing S08 (Expect S08, S8):', getVariations('S08'));
console.log('Testing S10 (Expect No Change):', getVariations('S10'));
console.log('Testing BUCHA (Expect No S-logic):', getVariations('BUCHA'));
