import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js";
import Box from "./clases/Box.js";
import Character from "./clases/Character.js";
import { boxCollision } from "./clases/BoxCollasion.js";


const form = document.querySelector("form");
const newName = document.querySelector("#m");
form.addEventListener("submit", (e) => {
    e.preventDefault();
    const Uname = newName.value;
    if (Uname == "" || Uname == null) {
        alert("Please enter a name");
        return;
    }
    socket.emit("setUniqueId", Uname);
});

// main
class ClassDasar {
    constructor() {
        this._Initialize();
    }

    _Initialize() {
        this._socket = socket;
        this._dataUser = [];
        this._newChat = true;
        this._camera = undefined;
        this._scene = undefined;
        this._renderer = undefined;
        this._mesh = undefined;
        this._orbotControl = undefined;
        this._enemies = [];
        this._frames = 0;
        this._spwanRate = 200;
        this._character = undefined;
        this._ground = undefined;
        // this._canva2d = document.createElement("canvas");
        // this._TextCanva = this._canva2d.getContext("2d");
        this._cube = new Box({
            width: 1,
            height: 1,
            depth: 1,
            position: {
                x: 0,
                y: 0,
                z: 0,
            },
            velocity: {
                x: 0,
                y: 0,
                z: 0,
            },
            color: "blue",
            zAcceleration: true,
        });

        this._renderer = new THREE.WebGLRenderer({
            antialias: true,
            canvas: document.getElementById("app"),
            alpha: true,
        });

        this._renderer.shadowMap.enabled = true;
        this._renderer.shadowMap.type = THREE.BasicShadowMap;
        this._renderer.setSize(window.innerWidth, window.innerHeight);

        this._scene = new THREE.Scene();

        this._camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.001,
            1000
        );
        this._camera.position.set(1.61, 10.74, 28);

        this._orbotControl = new OrbitControls(
            this._camera,
            this._renderer.domElement
        );
        this._orbotControl.dampingFactor = 0.05;
        this._orbotControl.screenSpacePanning = false;
        this._orbotControl.minDistance = 22;
        this._orbotControl.maxDistance = 50;

        const loader = new THREE.CubeTextureLoader();
        const texture = loader.load([
            "./img/meadow_bk.jpg",
            "./img/meadow_ft.jpg",
            "./img/meadow_up.jpg",
            "./img/meadow_dn.jpg",
            "./img/meadow_lf.jpg",
            "./img/meadow_rt.jpg",
        ]);
        this._scene.background = texture;

        this._character = new Character({
            position: {
                x: 0,
                y: -0.5,
                z: 0,
            },
            zAcceleration: true,
        });
        // this._character.scale.set(0.005, 0.005, 0.005);
        this._character.rotateY(Math.PI / 2);
        this._character.rotateY(Math.PI / 2);
        this._scene.add(this._character);

        this._ground = new Box({
            width: 100,
            height: 0.5,
            depth: 120,
            color: "#0369a1",
            position: {
                x: 0,
                y: -0.8,
                z: -40,
            },
        });

        this._ground.receiveShadow = true;
        this._scene.add(this._ground);

        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.y = 3;
        light.position.z = 1;
        light.castShadow = true;
        this._scene.add(light);

        this._scene.add(new THREE.AmbientLight(0xffffff, 0.5));

        this._camera.position.z = 15;

        this._socket.on("newChat", (data) => {
            this._dataUser = JSON.parse(data);
            this._newChat = true;
        });

        // this._addText("Hello World", 250 * 2, "white", 0, 0, 0);

        window.addEventListener(
            "resize",
            () => {
                this._OnWindowResize();
            },
            false
        );
        this._REF();
    }

    _BOTAI() {}

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
            useScreenCoordinates: true,
        });

        let sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(
            (0.007 * textWidth) / 2,
            (0.008 * textHeight) / 2,
            1.0
        );
        sprite.position.set(x, y + 1, z);
        this._scene.add(sprite);
    }

    _Render() {}

    _OnWindowResize() {
        (this._camera.aspect = window.innerWidth / window.innerHeight),
            this._camera.updateProjectionMatrix(),
            this._renderer.setSize(window.innerWidth, window.innerHeight);
    }

    _REF() {
        requestAnimationFrame((animate) => {
            this._renderer.render(this._scene, this._camera);

            if (this._frames++ % this._spwanRate === 0) {
                if (this._spwanRate > 50) this._spwanRate -= 50;

                // Cek apakah ada pesan baru sebelum mencetak
                if (
                    this._newChat &&
                    this._dataUser.type === "incomingChat" &&
                    this._dataUser.value !== undefined
                ) {
                    function randomColorHSL() {
                        // Menghasilkan nilai acak untuk Hue (0-360)
                        const hue = Math.floor(Math.random() * 361);

                        // Menghasilkan nilai acak untuk Saturation (0-100)
                        const saturation = Math.floor(Math.random() * 101);

                        // Menghasilkan nilai acak untuk Lightness (0-100)
                        const lightness = Math.floor(Math.random() * 101);

                        // Mengembalikan warna dalam format HSL
                        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
                    }
                    const enemy = new Box({
                        width: 1.2,
                        height: 1.2,
                        depth: 1.2,
                        position: {
                            x: (Math.random() - 0.5) * 40,
                            y: 0,
                            z: -60,
                        },
                        velocity: {
                            x: 0,
                            y: 0,
                            z: 0.005,
                        },
                        color: randomColorHSL(),
                        zAcceleration: true,
                        type: "enemy",
                        text: this._dataUser.value,
                        img: this._dataUser.pfp,
                    });
                    enemy.castShadow = true;
                    this._scene.add(enemy);
                    this._enemies.push(enemy);
                    this._newChat = false; // Set flag kembali ke false setelah diproses
                }
            }
            if (this._frames++ % this._spwanRate === 0) {
                if (this._spwanRate > 50) this._spwanRate -= 50;
                this._socket.on("updateViewCount", (data) => {
                    this._dataUser = JSON.parse(data);
                    document.getElementById(
                        "view"
                    ).innerHTML = `Viewers: ${this._dataUser.value}`;
                });
            }

            // if (this._frames++ % this._spwanRate === 0) {
            //     if (this._spwanRate > 50) this._spwanRate -= 50;

            //     // Tambahkan logika untuk membuat objek musuh
            //     const shouldCreateEnemy = Math.random() > 0.5; // Sesuaikan dengan probabilitas yang Anda inginkan
            //     if (shouldCreateEnemy) {
            //         function randomColorHSL() {
            //             // Menghasilkan nilai acak untuk Hue (0-360)
            //             const hue = Math.floor(Math.random() * 361);

            //             // Menghasilkan nilai acak untuk Saturation (0-100)
            //             const saturation = Math.floor(Math.random() * 101);

            //             // Menghasilkan nilai acak untuk Lightness (0-100)
            //             const lightness = Math.floor(Math.random() * 101);

            //             // Mengembalikan warna dalam format HSL
            //             return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
            //         }
            //         const enemy = new Box({
            //             width: 1.2,
            //             height: 1.2,
            //             depth: 1.2,
            //             position: {
            //                 x: (Math.random() - 0.5) * 40,
            //                 y: 0,
            //                 z: -40,
            //             },
            //             velocity: {
            //                 x: 0,
            //                 y: 0,
            //                 z: 0.005,
            //             },
            //             color: randomColorHSL(),
            //             zAcceleration: true,
            //             type: "enemy",
            //             text: "ianwdiunaiwdniawndianwidnaidn iawndinai daiwndi",
            //             img: "https://p16-sign-useast2a.tiktokcdn.com/tos-useast2a-avt-0068-giso/1c6dd1de024235ffe36277d46bb8fdd7~c5_100x100.webp?lk3s=a5d48078&x-expires=1704960000&x-signature=Mg%2BRtG1icKd%2FbtcPEMSXM%2FW7SOY%3D",
            //         });
            //         // enemy.scale.set(0.005, 0.005, 0.005);
            //         enemy.castShadow = true;
            //         this._scene.add(enemy);
            //         this._enemies.push(enemy);
            //     }
            // }

            this._cube.update(this._ground);
            this._enemies.forEach((enemy, index) => {
                enemy.update(this._ground);

                // Logika penghapusan objek musuh jika sudah turun cukup jauh
                if (enemy.position.y < -10) {
                    this._scene.remove(enemy);
                    this._enemies.splice(index, 1);
                }

                if (
                    boxCollision({
                        box1: this._cube,
                        box2: enemy,
                    })
                ) {
                    // cancelAnimationFrame(animationId);
                }
            });

            this._frames++;
            this._REF();
        });
    }
}
let _APP = null;

window.addEventListener("DOMContentLoaded", () => {
    _APP = new ClassDasar();
});
