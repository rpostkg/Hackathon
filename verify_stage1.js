import { store } from './src/store/Store.js';
import { Order } from './src/models/Order.js';
import { Courier } from './src/models/Courier.js';
import { DistributionService } from './src/services/DistributionService.js';

console.log('--- Starting Stage 1 Verification ---');

// 1. Check "No couriers available" case
console.log('Test 1: No couriers added yet.');
const res1 = DistributionService.distribute();
console.log('Result:', JSON.stringify(res1));

// 2. Add Courier and Order
console.log('\nTest 2: One Courier and One Order.');
store.addCourier(new Courier('c1', { x: 50, y: 50 }));
store.addOrder(new Order('o1', { x: 55, y: 55 }, { x: 60, y: 60 }));
const res2 = DistributionService.distribute();
console.log('Result:', JSON.stringify(res2));

// 3. Verify status changed to Busy
const c1 = store.getCourierById('c1');
console.log('Courier c1 status:', c1.status);

// 4. Test "No couriers available" when all are busy
console.log('\nTest 3: No free couriers left.');
store.addOrder(new Order('o2', { x: 10, y: 10 }, { x: 20, y: 20 }));
const res3 = DistributionService.distribute();
console.log('Result:', JSON.stringify(res3));

if (res1.message === 'No pending orders' && res2[0].courierId === 'c1' && res3.message === 'No couriers available') {
    console.log('\nSUCCESS: Stage 1 requirements met.');
} else {
    console.log('\nFAILURE: One or more tests failed.');
    process.exit(1);
}
