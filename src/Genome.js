import * as THREE from 'three';
import {TreeMesh} from './TreeMesh.js';

class Genome {
    constructor(properties) {
        this.properties = properties;
        for (const property in ranges) {
            if (!properties.hasOwnProperty(property)) {
                this.properties[property] = THREE.MathUtils.randFloat(
                    ranges[property].min,
                    ranges[property].max
                );
            }
        }
    }
    mutate() {
        for (const property in ranges) {
            this.properties[property] += gaussianRandom(0, 0.02);
            this.properties[property] = THREE.MathUtils.clamp(
                this.properties[property],
                ranges[property].min,
                ranges[property].max
            );
        }
    }

    getMesh() {
        return new TreeMesh(this.properties, true);
    }

    clone() {
        const newProps = {};
        for (const property in this.properties) {
            newProps[property] = this.properties[property];
        }
        return new Genome(newProps);
    }
}

// Standard Normal variate using Box-Muller transform. https://stackoverflow.com/a/36481059
function gaussianRandom(mean=0, stdev=1) {
    const u = 1 - Math.random(); // Converting [0,1) to (0,1]
    const v = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    // Transform to the desired mean and standard deviation:
    return z * stdev + mean;
}

const ranges = {
    levels: {min: 0.1, max: 5},
    vMultiplier: {min: 0, max:1},
    twigScale: {min: 0, max:1},
    initalBranchLength: {min: 0.1, max: 1},
    lengthFalloffFactor: {min: 0.5, max: 1},
    lengthFalloffPower: {min: 0.1, max: 1.5},
    clumpMax: {min: 0, max:1},
    clumpMin: {min: 0, max:1},
    branchFactor: {min: 2, max:4},
    dropAmount: {min: -1, max:1},
    growAmount: {min: -0.5, max: 1},
    sweepAmount: {min: -1, max:1},
    maxRadius: {min: 0.05, max: 1},
    climbRate: {min: 0.05, max: 1},
    trunkKink: {min: 0, max:0.5},
    treeSteps: {min: 0, max:5},
    taperRate: {min: 0.7, max: 1},
    radiusFalloffRate: {min: 0.5, max: 0.8},
    twistRate: {min: 0, max:10},
    trunkLength: {min: 0.1, max: 5}
}

export {Genome}