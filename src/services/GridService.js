export class GridService {
    static GRID_MIN = 0;
    static GRID_MAX = 100;

    static calculateDistance(p1, p2) {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    static isValidCoordinate(val) {
        return val >= this.GRID_MIN && val <= this.GRID_MAX;
    }

    static validatePoint(p) {
        return this.isValidCoordinate(p.x) && this.isValidCoordinate(p.y);
    }
}
