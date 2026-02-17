import { Command } from 'commander';
import { store } from '../store/Store.js';
import { Order } from '../models/Order.js';
import { Courier } from '../models/Courier.js';
import { DistributionService } from '../services/DistributionService.js';
import { GridService } from '../services/GridService.js';

const program = new Command();

program
    .name('delivery-system')
    .description('Delivery Service Order Distribution System')
    .version('1.0.0');

program
    .command('add-order')
    .description('Add a new order')
    .argument('<rx>', 'restaurant X')
    .argument('<ry>', 'restaurant Y')
    .argument('<dx>', 'delivery X')
    .argument('<dy>', 'delivery Y')
    .argument('<weight>', 'order weight (kg)')
    .action((rx, ry, dx, dy, weight) => {
        const r = { x: parseFloat(rx), y: parseFloat(ry) };
        const d = { x: parseFloat(dx), y: parseFloat(dy) };
        const w = parseFloat(weight);

        if (!GridService.validatePoint(r) || !GridService.validatePoint(d)) {
            console.error('Error: Coordinates must be between 0 and 100');
            return;
        }

        const id = `order-${store.orders.length + 1}`;
        const order = new Order(id, r, d, w);
        store.addOrder(order);
        console.log(`Order ${id} added successfully (Weight: ${w}kg).`);
    });

program
    .command('add-courier')
    .description('Add a new courier')
    .argument('<x>', 'X coordinate')
    .argument('<y>', 'Y coordinate')
    .argument('[type]', 'Transport type (Walker, Bicycle, Car)', 'Walker')
    .action((x, y, type) => {
        const loc = { x: parseFloat(x), y: parseFloat(y) };

        if (!GridService.validatePoint(loc)) {
            console.error('Error: Coordinates must be between 0 and 100');
            return;
        }

        const id = `courier-${store.couriers.length + 1}`;
        const courier = new Courier(id, loc, type);
        store.addCourier(courier);
        console.log(`Courier ${id} added successfully at (${loc.x}, ${loc.y}) with transport: ${type}.`);
    });

program
    .command('distribute')
    .description('Run order distribution logic')
    .action(() => {
        const result = DistributionService.distribute();
        if (result.message) {
            console.log(result.message);
        } else {
            console.log('Assignments (JSON):');
            console.log(JSON.stringify(result, null, 2));
        }
    });

program
    .command('complete-order')
    .description('Mark an order as completed/delivered')
    .argument('<id>', 'Order ID')
    .action((id) => {
        const result = DistributionService.completeOrder(id);
        if (!result) {
            console.error('Error: Order not found or not in ASSIGNED status.');
            return;
        }
        console.log(`Order ${id} completed by ${result.courier?.id}.`);
        if (result.newAssignments && result.newAssignments.length > 0) {
            console.log('New assignments from queue:');
            console.log(JSON.stringify(result.newAssignments, null, 2));
        }
    });

program
    .command('status')
    .description('Show current system status')
    .action(() => {
        console.log('\n--- Couriers ---');
        store.couriers.forEach(c => {
            console.log(`${c.id}: (${c.location.x}, ${c.location.y}) [${c.transportType}] - ${c.status} (Completed: ${c.completedOrdersToday})`);
        });

        console.log('\n--- Orders ---');
        store.orders.forEach(o => {
            console.log(`${o.id}: Restaurant(${o.restaurant.x}, ${o.restaurant.y}) -> Delivery(${o.delivery.x}, ${o.delivery.y}) [${o.weight}kg] - ${o.status}${o.assignedCourierId ? ' (assigned to ' + o.assignedCourierId + ')' : ''}`);
        });
    });

// Since we are in Stage 0 and data is in memory, a CLI that exits immediately loses data.
// However, the requirements say "All data can be stored in memory". 
// To make it usable as a CLI for "ease of implementation", I'll add a simple interactive repl-like mode
// or just allow batching if needed. But for now, I'll implement a simple "shell" if no arguments are provided.

program
    .command('shell')
    .description('Start interactive shell')
    .action(async () => {
        const readline = await import('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: 'delivery> '
        });

        rl.prompt();

        rl.on('line', (line) => {
            const args = line.trim().split(/\s+/);
            if (args[0]) {
                program.parse(args, { from: 'user' });
            }
            rl.prompt();
        }).on('close', () => {
            console.log('Exiting...');
            process.exit(0);
        });
    });

// Default to help if no arguments
if (!process.argv.slice(2).length) {
    program.outputHelp();
} else {
    program.parse(process.argv);
}
