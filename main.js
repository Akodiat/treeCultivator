import * as THREE from 'three';
import {OrbitControls} from './libs/OrbitControls.js';
import {Genome} from './src/Genome.js';

let canvas, renderer;

const scenes = [];
const meshes = [];
const genomes = [];
const popSize = 9;

init();
animate();


function init() {

    canvas = document.getElementById('c');

    const content = document.getElementById('grid');

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
            levels: 2,
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
        genomes.push(genome);
        const mesh = genome.getMesh();
        meshes.push(mesh);
        scene.add(mesh);

        scene.add(new THREE.HemisphereLight(0xaaaaaa, 0x444444, 1));

        const light = new THREE.DirectionalLight(0xffffff, 1.5);
        light.position.set(1, 1, 1);
        scene.add(light);
        scenes.push(scene);

        element.onmouseup = () => {
            newGeneration(i);
        }
    }

    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true
    });
    renderer.setClearColor(0xffffff, 1);
    renderer.setPixelRatio(window.devicePixelRatio);

}

function newGeneration(index) {
    const genome = genomes[index];
    console.log(index);
    console.log(genome.properties);
    const propertyDisplay = document.getElementById("propertyDisplay");
    propertyDisplay.innerHTML = hljs.highlight(
        JSON.stringify(genome.properties, undefined, 2).replaceAll('"', ''),
        {language: 'c'}
    ).value

    for (let i=0; i<popSize; i++) {
        // Remove old tree from scene
        scenes[i].remove(meshes[i]);

        // Create a child
        const child = genome.clone();
        genomes[i] = child;

        // Don't change the selected tile
        // Just make the other tiles this
        // one's children
        if (i !== index) {
            child.mutate();
        }
        const childMesh = child.getMesh();
        meshes[i] = childMesh;
        scenes[i].add(childMesh);
    }
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