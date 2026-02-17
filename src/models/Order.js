export const OrderStatus = {
    PENDING: 'PENDING',
    ASSIGNED: 'ASSIGNED',
    IN_TRANSIT: 'IN_TRANSIT',
    DELIVERED: 'DELIVERED',
};

export class Order {
    constructor(id, pickup, delivery) {
        this.id = id;
        this.pickup = pickup; // { x, y }
        this.delivery = delivery; // { x, y }
        this.status = OrderStatus.PENDING;
        this.assignedCourierId = null;
        this.createdAt = new Date();
    }
}
