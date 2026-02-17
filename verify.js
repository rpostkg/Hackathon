import { store } from './src/store/Store.js';
import { Order } from './src/models/Order.js';
import { Courier } from './src/models/Courier.js';
import { DistributionService } from './src/services/DistributionService.js';

console.log('--- Starting Verification ---');

// 1. Add Couriers
store.addCourier(new Courier('c1', { x: 10, y: 10 }));
store.addCourier(new Courier('c2', { x: 90, y: 90 }));
console.log('Added Courier c1 at (10,10) and c2 at (90,90)');

// 2. Add Orders
store.addOrder(new Order('o1', { x: 15, y: 15 }, { x: 20, y: 20 }));
store.addOrder(new Order('o2', { x: 85, y: 85 }, { x: 80, y: 80 }));
console.log('Added Order o1 near c1 and o2 near c2');

// 3. Distribute
console.log('\nRunning distribution...');
const assignments = DistributionService.distribute();

// 4. Verify
console.log('Assignments made:', assignments.length);
assignments.forEach(a => {
    console.log(`- Order ${a.orderId} assigned to Courier ${a.courierId} (Distance: ${a.distance.toFixed(2)})`);
});

const o1 = store.getOrderById('o1');
const o2 = store.getOrderById('o2');
const c1 = store.getCourierById('c1');
const c2 = store.getCourierById('c2');

console.log('\nFinal Status:');
console.log(`o1 status: ${o1.status}, courier: ${o1.assignedCourierId}`);
console.log(`o2 status: ${o2.status}, courier: ${o2.assignedCourierId}`);
console.log(`c1 status: ${c1.status}`);
console.log(`c2 status: ${c2.status}`);

if (o1.assignedCourierId === 'c1' && o2.assignedCourierId === 'c2') {
    console.log('\nSUCCESS: Orders correctly assigned to closest couriers.');
} else {
    console.log('\nFAILURE: Assignments did not match expectations.');
    process.exit(1);
}
