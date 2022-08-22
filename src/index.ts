import { PerspectiveCamera, Vector2, WebGLRenderer } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";

import { MainScene } from "./components/MainScene";

// Params
const enablePostProcessing = true;

// 初期化
const { renderer, camera, controls, composer, scene } = (function () {
  // 注：lil.GUIとのコンフリクトを避けるため、document.bodyには追加しないこと
  const containerDom = document.getElementById("container")!;

  // Camera
  const camera = new PerspectiveCamera(
    27,
    window.innerWidth / window.innerHeight,
    5,
    1000000
  );
  camera.position.z = 8;

  // OrbitControls
  const controls = new OrbitControls(camera, containerDom);

  // Scene
  const scene = new MainScene();

  // Renderer
  const renderer = new WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  containerDom.appendChild(renderer.domElement);

  // ポストプロセシング
  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);
  composer.addPass(
    new UnrealBloomPass(renderer.getSize(new Vector2()), 0.25, 0.1, 0.01)
  );

  // DOM utils
  window.addEventListener(
    "resize",
    () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    },
    false
  );

  return { renderer, scene, camera, controls, composer };
})();

// 更新処理
function update() {
  controls.update();
  scene.onUpdate && scene.onUpdate();
}

// 描画処理
function draw() {
  if (enablePostProcessing) {
    composer.render();
  } else {
    renderer.render(scene, camera);
  }
}

// Loop
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}
loop();
