import { store } from '../store/Store.js';
import { GridService } from './GridService.js';
import { OrderStatus } from '../models/Order.js';
import { CourierStatus } from '../models/Courier.js';

export class DistributionService {
    static distribute() {
        const pendingOrders = store.getPendingOrders();
        const freeCouriers = store.getIdleCouriers();

        if (pendingOrders.length === 0) {
            return { message: 'No pending orders' };
        }

        if (freeCouriers.length === 0) {
            return { message: 'No couriers available' };
        }

        const assignments = [];

        for (const order of pendingOrders) {
            const currentFreeCouriers = store.getIdleCouriers();

            // Filter suitable couriers based on weight capacity
            const suitableCouriers = currentFreeCouriers.filter(c => c.capacity >= order.weight);

            if (suitableCouriers.length === 0) continue;

            let closestCourier = null;
            let minDistance = Infinity;

            for (const courier of suitableCouriers) {
                const dist = GridService.calculateDistance(courier.location, order.restaurant);
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
                    distance: minDistance.toFixed(2)
                });
            }
        }

        return assignments.length > 0 ? assignments : { message: 'No couriers available' };
    }

    static assign(order, courier) {
        order.status = OrderStatus.ASSIGNED;
        order.assignedCourierId = courier.id;
        courier.status = CourierStatus.BUSY;
    }
}
