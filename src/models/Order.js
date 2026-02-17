export const OrderStatus = {
    PENDING: 'PENDING',
    ASSIGNED: 'ASSIGNED',
    IN_TRANSIT: 'IN_TRANSIT',
    DELIVERED: 'DELIVERED',
};

export class Order {
    constructor(id, restaurant, delivery, weight = 0) {
        this.id = id;
        this.restaurant = restaurant; // { x, y }
        this.delivery = delivery; // { x, y }
        this.weight = weight; // kg
        this.status = OrderStatus.PENDING;
        this.assignedCourierId = null;
        this.createdAt = new Date();
    }
}
