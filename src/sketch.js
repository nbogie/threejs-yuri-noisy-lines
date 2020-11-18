//Following Yuri Artyukh's "Noisy lines" live stream episode:
//https://www.youtube.com/watch?v=2a2P8-PyNGA&list=PLswdBLT9llbheHhZdGNw9RehJP1kvpMHY&index=21
//Mistakes are my own.

//Notes: when we use the orthographic camera we know the exact dimensions we're looking at
//Notes: a background plane and nearer text have the same material shader,
// which uses vPosition as noise input.  
// The text geometry is adjusted so that its front face shares uv.z (i think) with that of the plane,
// so that the noise is identical on both surfaces.

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
    rotation: 0,
    repeat: 8,
    lineWidth: 0.4
  };

  const mouse = new THREE.Vector2(0, 0);
  const mouseTarget = new THREE.Vector2(0, 0);

  const gui = new dat.GUI();
  gui.add(options, "time", 0, 100, 0.1);
  gui.add(options, "rotation", 0, 2 * Math.PI, 0.1);
  gui.add(options, "repeat", 0, 100, 0.1);
  gui.add(options, "lineWidth", 0, 1, 0.01);

  function grabMouseEvents() {
    document.addEventListener("mousemove", e => {
      mouse.x = e.pageX / window.innerWidth - 0.5;
      mouse.y = e.pageY / window.innerHeight - 0.5;
    });
  }
  let textMesh;

  function addText(material) {
    const loader = new THREE.FontLoader();
    loader.load("https://threejs.org/examples/fonts/helvetiker_bold.typeface.json", function (font) {

      const geometry = new THREE.TextGeometry('Create!', {
        font: font,
        size: 1,
        height: 0.2,
        curveSegments: 12,
        bevelEnabled: false
      });
      geometry.translate(-2.3, -0.5, -0.2);
      textMesh = new THREE.Mesh(geometry, material);
      textMesh.position.z = 0.1;
      scene.add(textMesh);
    });
  }

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
        repeat: { type: "f", value: 0 },
        lineWidth: { type: "f", value: 0.1 },
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

    const boxGeometry = new THREE.BoxBufferGeometry(1, 1, 0.1).translate(0, 0, -0.05);
    // About this translation: we move the box so that the z (of the uvs(?)) of the box front surface is 
    // the same as that of the plane, for noise texture to match (driven by vPosition).
    //https://www.youtube.com/watch?v=2a2P8-PyNGA&list=PLswdBLT9llbheHhZdGNw9RehJP1kvpMHY&index=21&t=31m
    const box = new THREE.Mesh(boxGeometry, material);
    box.position.z = 0.15;// shift it back into position.
    //scene.add(box);



    addText(material);

    return { plane, box, material };
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


  const { box, material } = addObjects();
  grabMouseEvents();


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

      // box.rotation.x = mouseTarget.y;
      // box.rotation.y = mouseTarget.x;
      if (textMesh) {
        textMesh.rotation.x = mouseTarget.y;
        textMesh.rotation.y = mouseTarget.x;
      }
      mouseTarget.lerp(mouse, 0.07)

      controls.update();
      material.uniforms.time.value = time;
      material.uniforms.rotation.value = options.rotation;
      material.uniforms.repeat.value = options.repeat;
      material.uniforms.lineWidth.value = options.lineWidth;
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
