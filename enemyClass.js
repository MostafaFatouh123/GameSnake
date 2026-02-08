class Enemy extends Vehicle {
    constructor(x, y) {
        super(x, y);
        this.maxSpeed = 2.5;
        this.maxForce = 0.15;
        this.r = 15;
        this.avoidWeight = 3;
        this.separateWeight = 2.0;
        this.target = null;
    }

    separate(enemies) {
        let desiredseparation = this.r * 2.5;
        let steer = createVector(0, 0);
        let count = 0;
        for (let other of enemies) {
            let d = p5.Vector.dist(this.pos, other.pos);
            if (d > 0 && d < desiredseparation) {
                let diff = p5.Vector.sub(this.pos, other.pos);
                diff.normalize();
                diff.div(d);
                steer.add(diff);
                count++;
            }
        }
        if (count > 0) {
            steer.div(count);
        }
        if (steer.mag() > 0) {
            steer.setMag(this.maxSpeed);
            steer.sub(this.vel);
            steer.limit(this.maxForce);
        }
        return steer;
    }

    applyBehaviors(targetSnakeHead, obstacles, otherEnemies) {
        if (!targetSnakeHead) return;

        // Seek the target
        let seekForce = this.seek(targetSnakeHead.pos);

        // Separate from other enemies
        let separateForce = this.separate(otherEnemies || []);

        // Avoid obstacles
        let ahead = this.vel.copy().setMag(40);
        let pAhead = p5.Vector.add(this.pos, ahead);

        let closest = null;
        let minDist = Infinity;
        for (let o of obstacles) {
            let d = p5.Vector.dist(this.pos, o.pos);
            if (d < minDist) {
                minDist = d;
                closest = o;
            }
        }

        let avoidForce = createVector(0, 0);
        if (closest) {
            let d = pAhead.dist(closest.pos);
            if (d < closest.r + this.r) {
                avoidForce = p5.Vector.sub(pAhead, closest.pos);
                avoidForce.setMag(this.maxSpeed);
                avoidForce.sub(this.vel);
                avoidForce.limit(this.maxForce);
            }
        }

        if (Vehicle.debug) {
            drawVector(this.pos, ahead, "yellow");
            fill("red");
            circle(pAhead.x, pAhead.y, 8);

            push();
            stroke(100, 100);
            strokeWeight(this.r / 2);
            line(this.pos.x, this.pos.y, pAhead.x, pAhead.y);
            pop();

            // Draw separation force in debug
            if (separateForce.mag() > 0) {
                drawVector(this.pos, separateForce.copy().mult(50), "green");
            }
        }

        this.applyForce(seekForce);
        this.applyForce(separateForce.mult(this.separateWeight));
        this.applyForce(avoidForce.mult(this.avoidWeight));
    }

    show() {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.vel.heading());

        // Danger Glow
        noStroke();
        fill(255, 0, 0, 50);
        circle(0, 0, this.r * 3);

        // Core
        fill(200, 0, 0);
        stroke(255, 50, 50);
        strokeWeight(2);
        // Diamond shape for enemies
        beginShape();
        vertex(this.r, 0);
        vertex(0, this.r / 2);
        vertex(-this.r, 0);
        vertex(0, -this.r / 2);
        endShape(CLOSE);

        // Eye
        fill(255, 255, 0);
        noStroke();
        circle(this.r / 2, 0, 4);
        pop();

        if (Vehicle.debug) {
            push();
            stroke(255);
            noFill();
            circle(this.pos.x, this.pos.y, this.r * 2);
            pop();
            drawVector(this.pos, this.vel.copy().mult(10), "yellow");
        }
    }
}
