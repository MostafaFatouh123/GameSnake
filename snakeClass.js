
class SnakeHead extends Vehicle {
    constructor(x, y) {
        super(x, y);
        this.maxSpeed = 6;
        this.maxForce = 0.4;
        this.wanderAngle = random(TWO_PI);

        // Weights
        this.avoidWeight = 4;
        this.separateWeight = 2;
        this.boundWeight = 5;
    }

    applyBehaviors(target, obstacles, heads, separationDist) {
        let forces = [];

        forces.push(this.arrive(target).mult(1));

        forces.push(this.avoid(obstacles).mult(this.avoidWeight));
        forces.push(this.separate(heads, separationDist).mult(this.separateWeight));
        forces.push(this.boundaries(0, 0, width, height, 100).mult(this.boundWeight));

        forces.forEach(f => this.applyForce(f));
    }

    arrive(target, d = 0) {
        let desired = p5.Vector.sub(target, this.pos);
        let distance = desired.mag();
        let speed = this.maxSpeed;
        let slowRadius = 100;

        if (distance < slowRadius) {
            speed = map(distance, d, slowRadius, 0, this.maxSpeed);
        }
        desired.setMag(speed);
        let steer = p5.Vector.sub(desired, this.vel);
        steer.limit(this.maxForce);
        return steer;
    }

    avoid(obstacles) {
        let ahead = this.vel.copy().setMag(40);
        let ahead2 = ahead.copy().mult(0.5);
        let pAhead = p5.Vector.add(this.pos, ahead);
        let pAhead2 = p5.Vector.add(this.pos, ahead2);

        let closest = null;
        let minDist = Infinity;

        for (let o of obstacles) {
            let d = p5.Vector.dist(this.pos, o.pos);
            if (d < minDist) {
                minDist = d;
                closest = o;
            }
        }

        if (!closest) return createVector(0, 0);

        let d1 = pAhead.dist(closest.pos);
        let d2 = pAhead2.dist(closest.pos);
        let d = min(d1, d2);

        if (Vehicle.debug) {
            drawVector(this.pos, ahead, "yellow");

            fill("red");
            circle(pAhead.x, pAhead.y, 10);
            fill("blue");
            circle(pAhead2.x, pAhead2.y, 10);

            push();
            stroke(100, 100);
            strokeWeight(this.r / 2);
            line(this.pos.x, this.pos.y, pAhead.x, pAhead.y);
            pop();
        }

        if (d < closest.r + this.r) {
            let target = d1 < d2 ? pAhead : pAhead2;
            let force = p5.Vector.sub(target, closest.pos);
            force.setMag(this.maxSpeed);
            force.sub(this.vel);
            force.limit(this.maxForce);
            return force;
        }
        return createVector(0, 0);
    }

    separate(others, distance) {
        let desiredSeparation = distance || this.r * 2;
        let sum = createVector();
        let count = 0;
        for (let other of others) {
            let d = p5.Vector.dist(this.pos, other.pos);
            if (d > 0 && d < desiredSeparation) {
                let diff = p5.Vector.sub(this.pos, other.pos);
                diff.normalize();
                diff.div(d);
                sum.add(diff);
                count++;
            }
        }
        if (count > 0) {
            sum.div(count);
            sum.setMag(this.maxSpeed);
            let steer = p5.Vector.sub(sum, this.vel);
            steer.limit(this.maxForce);
            return steer;
        }
        return createVector(0, 0);
    }

    boundaries(bx, by, bw, bh, d) {
        let desired = null;
        if (this.pos.x < bx + d) desired = createVector(this.maxSpeed, this.vel.y);
        else if (this.pos.x > bx + bw - d) desired = createVector(-this.maxSpeed, this.vel.y);
        if (this.pos.y < by + d) desired = createVector(this.vel.x, this.maxSpeed);
        else if (this.pos.y > by + bh - d) desired = createVector(this.vel.x, -this.maxSpeed);

        if (desired) {
            desired.setMag(this.maxSpeed);
            let steer = p5.Vector.sub(desired, this.vel);
            steer.limit(this.maxForce);
            return steer;
        }
        return createVector(0, 0);
    }

    show() {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.vel.heading());

        noStroke();
        fill(COLORS.snakeGlow);
        circle(0, 0, 40);

        fill(COLORS.snake);
        stroke(255);
        strokeWeight(2);
        let hr = this.r;
        triangle(-hr, -hr / 2, -hr, hr / 2, hr, 0);

        fill(255);
        noStroke();
        circle(hr / 3, -hr / 4, 4);
        circle(hr / 3, hr / 4, 4);
        pop();

        if (Vehicle.debug) {
            // Circle for debug (white circle of radius this.r)
            push();
            stroke(255);
            noFill();
            circle(this.pos.x, this.pos.y, this.r * 2);
            pop();

            // Velocity arrow
            drawVector(this.pos, this.vel.copy().mult(10), "yellow");
        }
    }
}
