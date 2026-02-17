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
    .argument('<px>', 'pickup X')
    .argument('<py>', 'pickup Y')
    .argument('<dx>', 'delivery X')
    .argument('<dy>', 'delivery Y')
    .action((px, py, dx, dy) => {
        const p = { x: parseFloat(px), y: parseFloat(py) };
        const d = { x: parseFloat(dx), y: parseFloat(dy) };

        if (!GridService.validatePoint(p) || !GridService.validatePoint(d)) {
            console.error('Error: Coordinates must be between 0 and 100');
            return;
        }

        const id = `order-${store.orders.length + 1}`;
        const order = new Order(id, p, d);
        store.addOrder(order);
        console.log(`Order ${id} added successfully.`);
    });

program
    .command('add-courier')
    .description('Add a new courier')
    .argument('<x>', 'X coordinate')
    .argument('<y>', 'Y coordinate')
    .action((x, y) => {
        const loc = { x: parseFloat(x), y: parseFloat(y) };

        if (!GridService.validatePoint(loc)) {
            console.error('Error: Coordinates must be between 0 and 100');
            return;
        }

        const id = `courier-${store.couriers.length + 1}`;
        const courier = new Courier(id, loc);
        store.addCourier(courier);
        console.log(`Courier ${id} added successfully at (${loc.x}, ${loc.y}).`);
    });

program
    .command('distribute')
    .description('Run order distribution logic')
    .action(() => {
        const assignments = DistributionService.distribute();
        if (assignments.length === 0) {
            console.log('No assignments made.');
        } else {
            console.log('Assignments:');
            assignments.forEach(a => {
                console.log(`- Order ${a.orderId} assigned to Courier ${a.courierId} (Distance: ${a.distance.toFixed(2)})`);
            });
        }
    });

program
    .command('status')
    .description('Show current system status')
    .action(() => {
        console.log('\n--- Couriers ---');
        store.couriers.forEach(c => {
            console.log(`${c.id}: (${c.location.x}, ${c.location.y}) - ${c.status}`);
        });

        console.log('\n--- Orders ---');
        store.orders.forEach(o => {
            console.log(`${o.id}: Pickup(${o.pickup.x}, ${o.pickup.y}) -> Delivery(${o.delivery.x}, ${o.delivery.y}) - ${o.status}${o.assignedCourierId ? ' (assigned to ' + o.assignedCourierId + ')' : ''}`);
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
