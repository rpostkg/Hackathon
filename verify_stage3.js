import { store } from './src/store/Store.js';
import { Order } from './src/models/Order.js';
import { Courier, TransportType } from './src/models/Courier.js';
import { DistributionService } from './src/services/DistributionService.js';

console.log('--- Starting Stage 3 Verification ---');

// 1. Test Priority Logic (Distance difference < 1)
console.log('Test 1: Priority Logic');
const c1 = new Courier('c1', { x: 10, y: 10 }, TransportType.WALKER);
c1.completedOrdersToday = 5; // Busy courier with high count
const c2 = new Courier('c2', { x: 10.5, y: 10.5 }, TransportType.WALKER);
c2.completedOrdersToday = 0; // Slightly further but has fewer orders

store.addCourier(c1);
store.addCourier(c2);

// Order at (10, 10). Distance to c1 is 0, to c2 is ~0.707. Diff < 1.
store.addOrder(new Order('o-priority', { x: 10, y: 10 }, { x: 0, y: 0 }, 1));

const res1 = DistributionService.distribute();
console.log('Assignments:', JSON.stringify(res1));

if (res1[0].courierId === 'c2') {
    console.log('SUCCESS: Prioritized c2 (fewer orders) because distance diff < 1.');
} else {
    console.log('FAILURE: Priority logic failed.');
    process.exit(1);
}

// 2. Test Queuing Logic (No couriers available)
console.log('\nTest 2: Queuing Logic');
// Assign c1 manually to another order to make all couriers busy
store.addOrder(new Order('o-filler', { x: 0, y: 0 }, { x: 0, y: 0 }, 1));
DistributionService.distribute(); // This should assign o-filler to c1

store.addOrder(new Order('o-queued', { x: 50, y: 50 }, { x: 0, y: 0 }, 1));
const res2 = DistributionService.distribute();
console.log('Result:', JSON.stringify(res2));

if (res2.message && res2.message.includes('queue')) {
    console.log('SUCCESS: Order correctly remained in queue.');
} else {
    console.log('FAILURE: Queuing logic failed.');
    process.exit(1);
}

// 3. Test Auto-Assignment from Queue
console.log('\nTest 3: Auto-assignment from queue');
// Complete first order to free up a courier
const complRes = DistributionService.completeOrder('o-priority');
console.log('Order completed. New assignments:', JSON.stringify(complRes.newAssignments));

if (complRes.newAssignments[0]?.orderId === 'o-queued') {
    console.log('SUCCESS: Queued order automatically assigned when courier became free.');
} else {
    console.log('FAILURE: Auto-assignment failed.');
    process.exit(1);
}

console.log('\n--- Stage 3 Verification Complete ---');
