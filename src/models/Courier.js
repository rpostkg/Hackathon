export const CourierStatus = {
    IDLE: 'IDLE',
    BUSY: 'BUSY',
};

export class Courier {
    constructor(id, location) {
        this.id = id;
        this.location = location; // { x, y }
        this.status = CourierStatus.IDLE;
    }
}
