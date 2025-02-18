// IMPORTS
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js";
import { vertexShader, fragmentShader } from "./shaders.js";

function letThereBelight() {
  //SCENE
  const scene = new THREE.Scene();

  //RENDERER
  const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById("canvas"),
    antialias: true,
  });
  renderer.setClearColor(0x131313);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth - 17, window.innerHeight);

  //CAMERA
  const camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    0.1,
    3000
  );
  camera.position.z = 90;

  // CONTROLS
  const controls = new OrbitControls(camera, renderer.domElement);

  //LIGHTS
  const spotLight = new THREE.SpotLight(0xffffff);
  spotLight.position.set(0, 20, 25);
  spotLight.castShadow = true;
  spotLight.shadow.mapSize.width = 1024;
  spotLight.shadow.mapSize.height = 1024;
  spotLight.shadow.camera.near = 500;
  spotLight.shadow.camera.far = 4000;
  spotLight.shadow.camera.fov = 70;
  scene.add(spotLight);
  const spotLight2 = new THREE.SpotLight(0xffffff);
  spotLight2.position.set(0, -10, -25);
  spotLight2.castShadow = true;
  spotLight2.shadow.mapSize.width = 1024;
  spotLight2.shadow.mapSize.height = 1024;
  spotLight2.shadow.camera.near = 500;
  spotLight2.shadow.camera.far = 4000;
  spotLight2.shadow.camera.fov = 70;
  scene.add(spotLight2);

  // SETUP ANALYZER
  let audioContext, audioElement, dataArray, analyser, source;
  const uniforms = {
    uTime: {
      type: "f",
      value: 1.0,
    },
    uFreqArray: {
      type: "float[64]",
      value: dataArray,
    },
    uAmp: {
      type: "f",
      value: 3.0,
    },
  };
  const geometry = new THREE.PlaneGeometry(64, 64, 64, 64);
  const material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    wireframe: true,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotateX(Math.PI / 1.5);
  scene.add(mesh);

  function setupAudioContext() {
    audioContext = new window.AudioContext();
    audioElement = document.getElementById("audio");
    source = audioContext.createMediaElementSource(audioElement);
    analyser = audioContext.createAnalyser();
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    analyser.fftSize = 1024 * 16;
    dataArray = new Uint8Array(analyser.frequencyBinCount);
  }

  function play() {
    if (audioContext === undefined) {
      setupAudioContext();
    }
    render();
  }
  play();

  //RENDER LOOP
  function render(time) {
    analyser.getByteFrequencyData(dataArray);
    uniforms.uFreqArray.value = dataArray;
    uniforms.uTime.value = time;
    mesh.rotation.z += 0.00125;
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  window.addEventListener(
    "resize",
    function () {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    },
    false
  );
}

function handleFile(e) {
  let files = e.target.files;
  document
    .getElementById("audio")
    .setAttribute("src", URL.createObjectURL(files[0]));
  document.getElementById("audio").load();
}

document.getElementsByClassName("playBtn")[0].addEventListener("click", () => {
  document.getElementById("audio").play();
  letThereBelight();
});

document
  .getElementById("fileUpload")
  .addEventListener("change", handleFile, false);
