class Boss extends Vehicle {
    constructor(x, y) {
        super(x, y);
        this.r = 60;
        this.maxSpeed = 0; // Stationary
        this.lastShotTime = 0;
        this.shootInterval = 3000; // Fire every 3 seconds
    }

    show() {
        push();
        translate(this.pos.x, this.pos.y);

        // Pulsing glow
        let pulse = sin(frameCount * 0.05) * 20;
        noStroke();
        fill(255, 50, 0, 100);
        circle(0, 0, (this.r * 2) + pulse);

        // Massive Core
        fill(100, 0, 0);
        stroke(255, 100, 0);
        strokeWeight(4);
        circle(0, 0, this.r * 1.5);

        // Inner detail
        rotate(frameCount * 0.02);
        noFill();
        stroke(255);
        rect(-this.r / 2, -this.r / 2, this.r, this.r);
        pop();

        if (Vehicle.debug) {
            push();
            stroke(255, 150);
            noFill();
            circle(this.pos.x, this.pos.y, this.r * 2);
            pop();
        }
    }

    fireVolley(targetSnakeHead) {
        let numProjectiles = floor(random(1, 8)); // 1 to 7
        let baseDir = p5.Vector.sub(targetSnakeHead.pos, this.pos).heading();
        let spread = PI / 3; // 60 degree cone

        let projectiles = [];
        for (let i = 0; i < numProjectiles; i++) {
            let angle = baseDir + map(i, 0, numProjectiles - 1, -spread / 2, spread / 2);
            if (numProjectiles === 1) angle = baseDir; // Center shot if only one

            projectiles.push(new Projectile(this.pos.x, this.pos.y, angle));
        }
        return projectiles;
    }
}
