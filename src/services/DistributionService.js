import { store } from '../store/Store.js';
import { GridService } from './GridService.js';
import { OrderStatus } from '../models/Order.js';
import { CourierStatus } from '../models/Courier.js';

export class DistributionService {
    static distribute() {
        const pendingOrders = store.getPendingOrders();
        const assignments = [];

        if (pendingOrders.length === 0) {
            return { message: 'No pending orders' };
        }

        for (const order of pendingOrders) {
            const freeCouriers = store.getIdleCouriers();

            // Filter suitable couriers based on weight capacity
            const suitableCouriers = freeCouriers.filter(c => c.capacity >= order.weight);

            if (suitableCouriers.length === 0) {
                // Order remains PENDING (effectively in queue)
                continue;
            }

            let bestCourier = null;
            let minDistance = Infinity;

            for (const courier of suitableCouriers) {
                const dist = GridService.calculateDistance(courier.location, order.restaurant);

                if (bestCourier === null) {
                    minDistance = dist;
                    bestCourier = courier;
                    continue;
                }

                const distDiff = Math.abs(dist - minDistance);

                if (distDiff < 1) {
                    // Priority to courier with fewer completed orders
                    if (courier.completedOrdersToday < bestCourier.completedOrdersToday) {
                        minDistance = dist;
                        bestCourier = courier;
                    } else if (courier.completedOrdersToday === bestCourier.completedOrdersToday && dist < minDistance) {
                        // Tie-break with distance if completed orders are equal
                        minDistance = dist;
                        bestCourier = courier;
                    }
                } else if (dist < minDistance) {
                    minDistance = dist;
                    bestCourier = courier;
                }
            }

            if (bestCourier) {
                this.assign(order, bestCourier);
                assignments.push({
                    orderId: order.id,
                    courierId: bestCourier.id,
                    distance: minDistance.toFixed(2)
                });
            }
        }

        if (assignments.length === 0) {
            return { message: 'No couriers available. Orders remain in queue.' };
        }

        return assignments;
    }

    static processQueue() {
        return this.distribute();
    }

    static assign(order, courier) {
        order.status = OrderStatus.ASSIGNED;
        order.assignedCourierId = courier.id;
        courier.status = CourierStatus.BUSY;
    }

    static completeOrder(orderId) {
        const order = store.getOrderById(orderId);
        if (!order || order.status !== OrderStatus.ASSIGNED) return null;

        const courier = store.getCourierById(order.assignedCourierId);
        order.status = OrderStatus.DELIVERED;

        if (courier) {
            courier.status = CourierStatus.FREE;
            courier.completedOrdersToday += 1;
            // Automatically process queue when courier becomes available
            const newAssignments = this.processQueue();
            return {
                order,
                courier,
                newAssignments: Array.isArray(newAssignments) ? newAssignments : []
            };
        }
        return { order };
    }
}
