export const CourierStatus = {
    FREE: 'Free',
    BUSY: 'Busy',
};

export class Courier {
    constructor(id, location) {
        this.id = id;
        this.location = location; // { x, y }
        this.status = CourierStatus.FREE;
    }
}
