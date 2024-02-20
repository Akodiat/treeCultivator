import * as THREE from 'three';
import {OrbitControls} from './libs/OrbitControls.js';
import {Genome} from './src/Genome.js';

let canvas, renderer;

const scenes = [];
const meshes = [];
const popSize = 9;

init();
animate();


function init() {

    canvas = document.getElementById('c');

    const content = document.getElementById('content');

    for (let i=0; i < popSize; i++) {
        const scene = new THREE.Scene();

        // make a list item
        const element = document.createElement('div');
        element.className = 'list-item';

        const sceneElement = document.createElement('div');
        element.appendChild(sceneElement);

        // the element that represents the area we want to render the scene
        scene.userData.element = sceneElement;
        content.appendChild(element);

        const camera = new THREE.PerspectiveCamera(50, 1, 1, 100);
        camera.position.z = 10;
        scene.userData.camera = camera;

        const controls = new OrbitControls(scene.userData.camera, scene.userData.element);
        controls.minDistance = 2;
        controls.maxDistance = 20;
        controls.enablePan = false;
        controls.enableZoom = false;
        scene.userData.controls = controls;

        // add a tree to each scene
        const genome = new Genome({
            seed: 262,
            segments: 6,
            levels: 5,
            vMultiplier: 2.36,
            twigScale: 0.8,
            initalBranchLength: 0.49,
            lengthFalloffFactor: 0.85,
            lengthFalloffPower: 0.99,
            clumpMax: 0.454,
            clumpMin: 0.404,
            branchFactor: 2.45,
            dropAmount: -0.1,
            growAmount: 0.235,
            sweepAmount: 0.01,
            maxRadius: 0.139,
            climbRate: 0.371,
            trunkKink: 0.093,
            treeSteps: 5,
            taperRate: 0.947,
            radiusFalloffRate: 0.73,
            twistRate: 3.02,
            trunkLength: 2.4
        });
        genome.mutate();
        const mesh = genome.getMesh();
        meshes.push(mesh);
        scene.add(mesh);

        scene.add(new THREE.HemisphereLight(0xaaaaaa, 0x444444, 1));

        const light = new THREE.DirectionalLight(0xffffff, 1.5);
        light.position.set(1, 1, 1);
        scene.add(light);
        scenes.push(scene);

        element.onmouseup = () => {
            console.log(genome.properties);

            for (let j=0; j<popSize; j++) {
                scenes[j].remove(meshes[j]);
                const child = genome.clone();
                if (j !== i) {
                    child.mutate();
                }
                const childMesh = child.getMesh();
                meshes[j] = childMesh;
                scenes[j].add(childMesh);
            }
        }
    }

    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true
    });
    renderer.setClearColor(0xffffff, 1);
    renderer.setPixelRatio(window.devicePixelRatio);

}

function updateSize() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (canvas.width !== width || canvas.height !== height) {
        renderer.setSize(width, height, false);
    }
}

function animate() {
    render();
    requestAnimationFrame(animate);
}

function render() {

    updateSize();

    canvas.style.transform = `translateY(${window.scrollY}px)`;

    renderer.setClearColor(0xffffff);
    renderer.setScissorTest(false);
    renderer.clear();

    renderer.setClearColor(0xe0e0e0);
    renderer.setScissorTest(true);

    scenes.forEach(function(scene, i) {

        // so something moves
        meshes[i].rotation.y = Date.now() * 0.0005;

        // get the element that is a place holder for where we want to
        // draw the scene
        const element = scene.userData.element;

        // get its position relative to the page's viewport
        const rect = element.getBoundingClientRect();

        // check if it's offscreen. If so skip it
        if (rect.bottom < 0 || rect.top > renderer.domElement.clientHeight ||
            rect.right < 0 || rect.left > renderer.domElement.clientWidth) {
            return; // it's off screen
        }

        // set the viewport
        const width = rect.right - rect.left;
        const height = rect.bottom - rect.top;
        const left = rect.left;
        const bottom = renderer.domElement.clientHeight - rect.bottom;

        renderer.setViewport(left, bottom, width, height);
        renderer.setScissor(left, bottom, width, height);

        const camera = scene.userData.camera;

        //camera.aspect = width / height; // not changing in this example
        //camera.updateProjectionMatrix();
        //scene.userData.controls.update();

        renderer.render(scene, camera);
    });

}