//notes: when we use the orthographic camera we know the exact dimensions we're looking at

// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require("three");

// Include any additional ThreeJS examples below
require("three/examples/js/controls/OrbitControls");

import * as dat from 'dat.gui';

import fragment from './shaders/fragment.glsl';
import vertex from './shaders/vertex.glsl';

const canvasSketch = require("canvas-sketch");

const settings = {
  // Make the loop animated
  animate: true,
  // Get a WebGL canvas rather than 2D
  context: "webgl"
};


const sketch = ({ context }) => {
  // Create a renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: context.canvas
  });
  const options = {
    time: 0,
    rotation: 0
  };


  const gui = new dat.GUI();
  gui.add(options, "time", 0, 100, 0.1);
  gui.add(options, "rotation", 0, 6, 0.1);

  function addObjects() {
    const material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable"
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: { type: "f", value: 0 },
        resolution: { type: "v4", value: new THREE.Vector4() },
        rotation: { type: "f", value: 0 },
        uvRate1: {
          value: new THREE.Vector2(1, 1)
        }
      },
      vertexShader: vertex,
      fragmentShader: fragment
    });
    material.uniforms.resolution.value.z = 1;
    material.uniforms.resolution.value.w = 1;
    material.uniforms.resolution.value.x = window.innerWidth;
    material.uniforms.resolution.value.y = window.innerHeight;

    const geometry = new THREE.PlaneGeometry(2.6 * aspect, 2.6, 1, 1);
    const plane = new THREE.Mesh(geometry, material);
    scene.add(plane);



    const boxGeometry = new THREE.BoxBufferGeometry(1, 1, 1);
    const plane2 = new THREE.Mesh(boxGeometry, material);
    scene.add(plane2);

    return { plane, material };
  }
  // WebGL background color
  renderer.setClearColor("#000", 1);

  // Setup a camera
  const cameraP = new THREE.PerspectiveCamera(50, 1, 0.01, 100);
  cameraP.position.set(0, 0, 2);
  cameraP.lookAt(new THREE.Vector3());

  let frustumSize = 3;
  let aspect = window.innerWidth / window.innerHeight;
  const camera = new THREE.OrthographicCamera(
    frustumSize * aspect / -2,
    frustumSize * aspect / 2,
    frustumSize * aspect / 2,
    frustumSize * aspect / -2,
    -1000
  );
  camera.position.set(0, 0, 2);

  // Setup camera controller
  const controls = new THREE.OrbitControls(camera, context.canvas);

  // Setup your scene
  const scene = new THREE.Scene();


  const { material } = addObjects();




  // draw each frame
  return {
    // Handle resize events here
    resize({ pixelRatio, viewportWidth, viewportHeight }) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(viewportWidth, viewportHeight, false);
      // camera.aspect = viewportWidth / viewportHeight;
      camera.updateProjectionMatrix();
    },
    // Update & render your scene here
    render({ time }) {
      controls.update();
      material.uniforms.time.value = time;
      material.uniforms.rotation.value = options.rotation;
      renderer.render(scene, camera);
    },
    // Dispose of events & renderer for cleaner hot-reloading
    unload() {
      controls.dispose();
      renderer.dispose();
    }
  };
};

canvasSketch(sketch, settings);
