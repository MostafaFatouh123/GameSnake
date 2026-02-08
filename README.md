# Cyber-Snake Ultimate Edition

Bienvenue dans la simulation **Cyber-Snake**, un projet basé sur les principes de **Craig Reynolds** concernant les comportements de pilotage (Steering Behaviors). Ce jeu met en scène une flotte de cyber-serpents évoluant dans un environnement hostile, gérés par des forces physiques plutôt que par des directions rigides.

## Présentation du Jeu
Le joueur contrôle une tête de serpent cybernétique qui doit collecter des fragments de données (**Food**) pour croître, tout en évitant des obstacles et en survivant à des vagues d'ennemis tactiques. La simulation se divise en 3 étapes, culminant avec un affrontement contre un Boss cybernétique.

---

## Comportements de Steering (Steering Behaviors)

Voici un détail des comportements de pilotage implémentés, inspirés par l'architecture **AntiGravity**.

### 1. Arrivée (Arrive)
*   **Où** : Implémenté dans `SnakeHead` ([snakeClass.js](snakeClass.js)) et `SnakeSegment` ([snakeSegment.js](snakeSegment.js)).
*   **Pourquoi** : Pour permettre un mouvement fluide vers une cible. Contrairement au simple "Seek", l'Arrive ralentit le véhicule à l'approche de sa cible pour éviter les dépassements brusques.
*   **Comment** : Calcule un vecteur `desired` vers la cible. Si la distance est inférieure à un rayon de freinage, la magnitude de la vitesse désirée est réduite proportionnellement. La force de steering est ensuite : `force = desired - velocity`.

### 2. Évitement d'Obstacles (Avoidance)
*   **Où** : Implémenté dans `SnakeHead` ([snakeClass.js](snakeClass.js)), `SnakeSegment` ([snakeSegment.js](snakeSegment.js)) et `Enemy` ([enemyClass.js](enemyClass.js)).
*   **Pourquoi** : Pour permettre aux entités de naviguer dans un champ d'obstacles sans collision frontale.
*   **Comment** : Projette des vecteurs "devant" le véhicule (`ahead` et `ahead2`). Si l'un de ces points de détection se trouve à l'intérieur du rayon d'un obstacle, une force de répulsion est générée : `force = ahead - obstacle.position`. Cette force est ensuite limitée et appliquée pour dévier la trajectoire.

### 3. Séparation (Separation)
*   **Où** : Implémenté pour la flotte dans `SnakeHead` ([snakeClass.js](snakeClass.js)) et pour les ennemis dans `Enemy` ([enemyClass.js](enemyClass.js)).
*   **Pourquoi** : Essentiel pour éviter que les membres d'un groupe ne se chevauchent, créant une formation de groupe plus naturelle et lisible.
*   **Comment** : Pour chaque voisin trop proche, on calcule un vecteur de fuite (la position actuelle moins la position du voisin), inversement proportionnel à la distance. On fait la moyenne de ces vecteurs pour obtenir une force de séparation unique qui maintient l'espace vital de l'entité.

### 4. Poursuite (Seek)
*   **Où** : Implémenté nativement dans `Vehicle` ([vehicle.js](vehicle.js)) et utilisé par `Enemy` ([enemyClass.js](enemyClass.js)).
*   **Pourquoi** : Pour diriger les ennemis de manière agressive vers le joueur.
*   **Comment** : `desired = target.pos - this.pos`, réglé à la vitesse maximale. La force est `desired - velocity`. Cela pousse l'ennemi à corriger constamment sa trajectoire vers sa proie.

### 5. Limites de l'Écran (Boundaries)
*   **Où** : Implémenté dans `SnakeHead` ([snakeClass.js](snakeClass.js)) et `SnakeSegment` ([snakeSegment.js](snakeSegment.js)).
*   **Pourquoi** : Contrairement au mode "Wrap Around" (réapparition de l'autre côté), ce comportement force le serpent à rester dans la zone de jeu en tournant doucement lorsqu'il s'approche des bords.
*   **Comment** : Vérifie si la position X ou Y est à moins de 100 pixels du bord. Si c'est le cas, génère une force désirée pointant vers l'intérieur à vitesse maximale.

---

## Architecture Technique

*   **[vehicle.js](vehicle.js)** : Classe de base de Craig Reynolds. Aucun comportement spécifique n'y est ajouté conformément aux règles du projet.
*   **[snakeClass.js](snakeClass.js)** : Classe `SnakeHead` qui gère la tête du serpent avec les comportements arrive, avoid, separate et boundaries.
*   **[snakeSegment.js](snakeSegment.js)** : Classe `SnakeSegment` qui gère les segments du corps du serpent.
*   **[enemyClass.js](enemyClass.js)** : Classe `Enemy` qui gère l'IA ennemie avec seek, separate et avoid.
*   **[boss.js](boss.js)** : Classe `Boss` qui gère le boss stationnaire du niveau 3.
*   **[projectile.js](projectile.js)** : Classe `Projectile` pour les tirs du boss.
*   **[sketch.js](sketch.js)** : Orchestrateur principal gérant les états de jeu (MENU, PLAYING, SUCCESS, LOST) et le rendu global.

---

## Difficultés Rencontrées

### 1. Équilibrage des Forces de Steering
La composition de multiples comportements (arrive, avoid, separate, boundaries) a nécessité un ajustement minutieux des poids (`avoidWeight`, `separateWeight`, `boundWeight`). Un déséquilibre provoquait soit des collisions avec les obstacles, soit des mouvements erratiques.

### 2. Gestion du Corps du Serpent
Faire suivre les segments de manière fluide sans chevauchement ni "téléportation" était complexe. La solution a été d'utiliser le comportement `arrive` avec un rayon de freinage adapté pour chaque segment.

### 3. Spawn Sécurisé des Entités
Éviter que les obstacles et la nourriture n'apparaissent les uns sur les autres ou sur le serpent a nécessité l'implémentation de fonctions de validation (`isPositionInObstacleRange`, `spawnFoodAtSafeLocation`).

---

## Point de Fierté

### Système de Comportements Composables
L'architecture force-based où chaque comportement retourne un vecteur de force qui est ensuite combiné via `applyForce()` :

```javascript
applyBehaviors(target, obstacles, heads, separationDist) {
    let forces = [];
    forces.push(this.arrive(target).mult(1));
    forces.push(this.avoid(obstacles).mult(this.avoidWeight));
    forces.push(this.separate(heads, separationDist).mult(this.separateWeight));
    forces.push(this.boundaries(0, 0, width, height, 100).mult(this.boundWeight));
    forces.forEach(f => this.applyForce(f));
}
```

Cette approche permet d'ajouter ou modifier des comportements sans toucher au reste du code, respectant parfaitement les principes de Craig Reynolds.

---

## Outils IA Utilisés

### Spécifications
| Outil | Version | Utilisation |
|-------|---------|-------------|
| **Claude** | Opus 4.5 | Génération et refactoring de code |
| **Antigravity** | Extension VS Code | Assistance au développement |

### Exemples de Prompts Utilisés

**1. Spawn sécurisé de nourriture :**
```
Crée une fonction spawnFoodAtSafeLocation() qui génère une position aléatoire 
pour la nourriture en vérifiant qu'elle n'apparaît pas sur un obstacle existant. 
Utilise une marge de 120 pixels des bords et une fonction isPositionInObstacleRange() 
pour valider la position.
```

**2. Système de projectiles du Boss :**
```
Crée une classe Projectile qui hérite de Vehicle. Le projectile doit avoir un 
mouvement linéaire (this.pos.add(this.vel)) sans steering behaviors, une méthode 
isOffscreen() pour détecter s'il sort de l'écran, et un affichage avec effet 
plasma rouge (ellipse avec glow).
```

**3. Boss avec tir en éventail :**
```
Implémente une méthode fireVolley(targetSnakeHead) dans la classe Boss qui tire 
entre 1 et 7 projectiles en cône de 60 degrés vers la tête du serpent. 
Utilise p5.Vector.fromAngle() pour calculer la direction de chaque projectile.
```

**4. Évitement d'obstacles avec double détection :**
```
Crée une méthode avoid(obstacles) qui projette deux vecteurs ahead et ahead2 
(à 100% et 50% de la distance) devant le véhicule. Si un point entre en collision 
avec un obstacle, génère une force de répulsion: force = ahead - obstacle.pos.
```

**5. Comportement de séparation pondéré :**
```
Implémente separate(others, distance) qui calcule une force de séparation 
inversement proportionnelle à la distance des voisins. La force doit être 
normalisée puis divisée par la distance pour que les voisins proches 
repoussent plus fort.
```

---

## Commandes
*   **SOURIS** : Contrôler la direction du serpent.
*   **[D]** : Activer le mode Debug (affiche les vecteurs sous-jacents, les rayons de séparation et les zones de détection).
*   **[R]** : Redémarrer le niveau actuel.