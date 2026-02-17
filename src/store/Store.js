class Store {
    constructor() {
        this.orders = [];
        this.couriers = [];
    }

    addOrder(order) {
        this.orders.push(order);
    }

    addCourier(courier) {
        this.couriers.push(courier);
    }

    getPendingOrders() {
        return this.orders.filter(o => o.status === 'PENDING');
    }

    getIdleCouriers() {
        return this.couriers.filter(c => c.status === 'Free');
    }

    getOrderById(id) {
        return this.orders.find(o => o.id === id);
    }

    getCourierById(id) {
        return this.couriers.find(c => c.id === id);
    }
}

export const store = new Store();
