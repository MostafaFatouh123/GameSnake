class SnakeSegment extends SnakeHead {
    constructor(x, y) {
        super(x, y);
        this.maxSpeed = 8;
        this.maxForce = 0.6;
    }

    applyBehaviors(targetPos, obstacles) {
        let arriveForce = this.arrive(targetPos, 30);
        let avoidForce = this.avoid(obstacles);
        let boundForce = this.boundaries(0, 0, width, height, 100);

        avoidForce.mult(this.avoidWeight);
        boundForce.mult(2);

        this.applyForce(arriveForce);
        this.applyForce(avoidForce);
        this.applyForce(boundForce);
    }

    show() {
        // Drawn by plasma stream in sketch.js, but kept for compliance
    }
}
