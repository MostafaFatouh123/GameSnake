# Project Guidelines

This repository follows a strict set of architectural and behavioral rules
to ensure clean, extensible, and physically consistent simulations using p5.js
and steering behaviors inspired by Craig Reynolds.

---

## Global Constraints

- You must follow **Craig Reynolds' steering behaviors principles**:
  - seek
  - flee
  - arrive
  - separation
  - alignment
  - cohesion
- All behaviors must be **force-based**.
- Behaviors must be **composable** (multiple behaviors can be combined).
- **No teleportation** or direct position assignment is allowed,  
  except during **initialization**.

---

## Architecture Rules

- **Do NOT modify `Vehicule.js`.**
- `Vehicule.js` is the **base class** for all agents in the project.
- To add or customize behaviors:
  - Create **subclasses** (e.g. `Boid`, `Predator`, `Wanderer`)
  - Override or specialize the following methods when needed:
    - `applyBehaviors()`
    - `show()`
    - `edges()`

---

## p5.js Rules

- Use **`p5.Vector`** for all movement and physics calculations.
- Always use **`applyForce()`** to influence motion.
- Never modify velocity or position directly.
