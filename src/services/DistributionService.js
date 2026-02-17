import { store } from '../store/Store.js';
import { GridService } from './GridService.js';
import { OrderStatus } from '../models/Order.js';
import { CourierStatus } from '../models/Courier.js';

export class DistributionService {
    static distribute() {
        const pendingOrders = store.getPendingOrders();
        const idleCouriers = store.getIdleCouriers();

        if (pendingOrders.length === 0 || idleCouriers.length === 0) {
            return [];
        }

        const assignments = [];

        // Simple greedy approach for Stage 0: 
        // For each order, find the closest idle courier.
        // In a real system we might want to optimize globally, but greedily is fine for initial requirements.
        for (const order of pendingOrders) {
            const availableCouriers = idleCouriers.filter(c => c.status === CourierStatus.IDLE);
            if (availableCouriers.length === 0) break;

            let closestCourier = null;
            let minDistance = Infinity;

            for (const courier of availableCouriers) {
                const dist = GridService.calculateDistance(courier.location, order.pickup);
                if (dist < minDistance) {
                    minDistance = dist;
                    closestCourier = courier;
                }
            }

            if (closestCourier) {
                this.assign(order, closestCourier);
                assignments.push({
                    orderId: order.id,
                    courierId: closestCourier.id,
                    distance: minDistance
                });
            }
        }

        return assignments;
    }

    static assign(order, courier) {
        order.status = OrderStatus.ASSIGNED;
        order.assignedCourierId = courier.id;
        courier.status = CourierStatus.BUSY;
    }
}
