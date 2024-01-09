import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js";
import { FBXLoader } from "https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/FBXLoader.js";
import { boxCollision } from "./BoxCollasion.js";

class Character extends THREE.Group {
    constructor({
        width,
        height,
        depth,
        type,
        color,
        velocity = {
            x: 0,
            y: 0,
            z: 0,
        },
        position = {
            x: 0,
            y: 0,
            z: 0,
        },
        zAcceleration = false,
        text,
    }) {
        super();

        this.velocity = velocity;
        this.gravity = -0.002;
        this.zAcceleration = zAcceleration;

        this._canva2d = document.createElement("canvas");
        this._TextCanva = this._canva2d.getContext("2d");

        if (type === "enemy") {
            this._addText(text, 220 * 2, color, 0, 5, 0);
        }

        // Load FBX model
        const loader = new FBXLoader();
        loader.load("./player/boy.fbx", (model) => {
            model.traverse((child) => {
                if (child.isMesh) {
                    // child.castShadow = true;
                    // child.receiveShadow = true;
                    // if (child.isSkinnedMesh) {
                    //     // Nonaktifkan rendering bayangan untuk SkinnedMesh
                    //     child.castShadow = false;
                    // } else {
                    //     // Terapkan materi baru hanya untuk non-SkinnedMesh
                    //     child.material = new THREE.MeshStandardMaterial({
                    //         color,
                    //     });
                    // }
                }
            });

            model.scale.set(0.005, 0.005, 0.005);
            this.add(model);
        });

        this.width = width;
        this.height = height;
        this.depth = depth;

        this.position.set(position.x, position.y, position.z);

        this.right = this.position.x + this.width / 2;
        this.left = this.position.x - this.width / 2;

        this.bottom = this.position.y - this.height / 2;
        this.top = this.position.y + this.height / 2;

        this.front = this.position.z + this.depth / 2;
        this.back = this.position.z - this.depth / 2;

        this.velocity = velocity;
        this.gravity = -0.002;

        this.zAcceleration = zAcceleration;
    }

    _addText(text, fontSize, color, x, y, z) {
        function roundedUp(numToRound, multiple) {
            var value = multiple;
            while (value < numToRound) {
                value = value * multiple;
            }
            return value;
        }

        this._TextCanva.font = `${fontSize}px Courier New`;
        let mecur = this._TextCanva.measureText(text);

        let textWidth = roundedUp(mecur.width + 10.0, 2);
        let textHeight = roundedUp(fontSize + 10.0, 2);

        this._canva2d.width = textWidth;
        this._canva2d.height = textHeight;

        this._TextCanva.font = "bold " + fontSize + "px Courier New";
        this._TextCanva.textAlign = "center";
        this._TextCanva.textBaseline = "middle";
        this._TextCanva.fillStyle = color;
        // this._TextCanva.
        this._TextCanva.fillText(text, textWidth / 2, textHeight / 2);

        let texture = new THREE.Texture(this._canva2d);
        texture.needsUpdate = true;

        let spriteMaterial = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            side: THREE.DoubleSide,
            //color: 0xffffff,
            // useScreenCoordinates: true,
        });

        let sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(
            (0.007 * textWidth) / 2,
            (0.008 * textHeight) / 2,
            1.0
        );
        sprite.position.set(x, y + 1, z);
        this.add(sprite);
    }

    updateSides() {
        this.right = this.position.x + this.width / 2;
        this.left = this.position.x - this.width / 2;

        this.bottom = this.position.y - this.height / 2;
        this.top = this.position.y + this.height / 2;

        this.front = this.position.z + this.depth / 2;
        this.back = this.position.z - this.depth / 2;
    }

    update(ground) {
        this.updateSides();

        if (this.zAcceleration) this.velocity.z += 0.0007;

        this.position.x += this.velocity.x;
        this.position.z += this.velocity.z;

        this.applyGravity(ground);
    }

    remove() {
        this.geometry.dispose();
        this.material.dispose();
        this.parent.remove(this);
    }

    applyGravity(ground) {
        this.velocity.y += this.gravity;

        // this is where we hit the ground
        if (
            boxCollision({
                box1: this,
                box2: ground,
            })
        ) {
            const friction = 0.5;
            this.velocity.y *= friction;
            this.velocity.y = -this.velocity.y;
        } else this.position.y += this.velocity.y;
    }
}

export default Character;