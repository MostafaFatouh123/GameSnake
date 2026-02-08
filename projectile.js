class Projectile extends Vehicle {
    constructor(x, y, angle) {
        super(x, y);
        this.vel = p5.Vector.fromAngle(angle).setMag(3);
        this.r = 12; // Increased size
        this.maxSpeed = 3;
    }

    update() {
        // Pure linear movement, goes through obstacles
        this.pos.add(this.vel);
    }

    show() {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.vel.heading());

        // Red plasma glow
        noStroke();
        fill(255, 50, 0, 150);
        ellipse(0, 0, 30, 15);

        fill(255, 200, 200);
        ellipse(0, 0, 15, 7);
        pop();

        if (Vehicle.debug) {
            drawVector(this.pos, this.vel.copy().mult(5), "cyan");
        }
    }

    isOffscreen() {
        return (this.pos.x < 0 || this.pos.x > width || this.pos.y < 0 || this.pos.y > height);
    }
}
