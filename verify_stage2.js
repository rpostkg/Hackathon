import { store } from './src/store/Store.js';
import { Order } from './src/models/Order.js';
import { Courier, TransportType } from './src/models/Courier.js';
import { DistributionService } from './src/services/DistributionService.js';

console.log('--- Starting Stage 2 Verification ---');

// 1. Setup Couriers
store.addCourier(new Courier('walker-1', { x: 10, y: 10 }, TransportType.WALKER)); // 5kg cap
store.addCourier(new Courier('bicycle-1', { x: 20, y: 20 }, TransportType.BICYCLE)); // 15kg cap
store.addCourier(new Courier('car-1', { x: 90, y: 90 }, TransportType.CAR)); // 50kg cap

console.log('Added Walker (5kg) at (10,10)');
console.log('Added Bicycle (15kg) at (20,20)');
console.log('Added Car (50kg) at (90,90)');

// 2. Test Heavy Order (20kg) - Only Car should be suitable
console.log('\nTest 1: Heavy Order (20kg) near Walker/Bicycle');
store.addOrder(new Order('heavy-1', { x: 15, y: 15 }, { x: 50, y: 50 }, 20));
const res1 = DistributionService.distribute();
console.log('Assignments:', JSON.stringify(res1));

// 3. Test Light Order (2kg) - Walker should be picked if closer
console.log('\nTest 2: Light Order (2kg) near Walker');
store.addOrder(new Order('light-1', { x: 12, y: 12 }, { x: 0, y: 0 }, 2));
const res2 = DistributionService.distribute();
console.log('Assignments:', JSON.stringify(res2));

// 4. Test "No couriers available" (60kg order)
console.log('\nTest 3: Impossible Order (60kg)');
store.addOrder(new Order('impossible', { x: 50, y: 50 }, { x: 0, y: 0 }, 60));
const res3 = DistributionService.distribute();
console.log('Result:', JSON.stringify(res3));

const heavyAssigned = res1.find(a => a.orderId === 'heavy-1');
const lightAssigned = res2.find(a => a.orderId === 'light-1');

if (heavyAssigned?.courierId === 'car-1' &&
    lightAssigned?.courierId === 'walker-1' &&
    res3.message === 'No couriers available') {
    console.log('\nSUCCESS: Stage 2 weight constraints verified.');
} else {
    console.log('\nFAILURE: Results did not match expectations.');
    process.exit(1);
}
