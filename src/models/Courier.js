export const TransportType = {
    WALKER: 'Walker',
    BICYCLE: 'Bicycle',
    CAR: 'Car',
};

export const TransportCapacity = {
    [TransportType.WALKER]: 5,
    [TransportType.BICYCLE]: 15,
    [TransportType.CAR]: 50,
};

export const CourierStatus = {
    FREE: 'Free',
    BUSY: 'Busy',
};

export class Courier {
    constructor(id, location, transportType = TransportType.WALKER) {
        this.id = id;
        this.location = location; // { x, y }
        this.transportType = transportType;
        this.status = CourierStatus.FREE;
        this.completedOrdersToday = 0;
    }

    get capacity() {
        return TransportCapacity[this.transportType] || 0;
    }
}
