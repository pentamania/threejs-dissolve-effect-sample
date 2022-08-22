import GUI from "lil-gui";
import {
  Color,
  DoubleSide,
  Fog,
  Group,
  HemisphereLight,
  Mesh,
  PointLight,
  Scene,
  TextureLoader,
} from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { degToRad } from "three/src/math/MathUtils";

import noiseTextureSrc from "../assets/noise.png";
import modelSrc from "../assets/suzanne.obj";
import { DissolvableMeshStandardMaterial } from "./DissolvableMaterial";

// Params
const sceneBackgroundColor = 0x000000;
const fogFarClip = 1000;
const params = {
  threshold: 0.6,
  edgeWidth: 0.024,
  edgeColor: "#00C9FF",
};
const rotateTick = degToRad(0.25);

const gui = new GUI();
const dissolveMap = new TextureLoader().load(noiseTextureSrc);

/**
 * @class MainScene
 */
export class MainScene extends Scene {
  modelObj?: Group;

  constructor() {
    super();

    // 背景＆フォグ設定
    this.background = new Color(sceneBackgroundColor);
    this.fog = new Fog(sceneBackgroundColor, 10, fogFarClip);

    // 光あれ
    {
      const hemiLight = new HemisphereLight(0xff22ff, 0x444444);
      hemiLight.position.set(0, 0, 0);
      this.add(hemiLight);

      const pointLight = new PointLight(0x3333aa, 4);
      pointLight.position.set(2, 12, 0);
      this.add(pointLight);
    }

    // OBJモデルロード
    new OBJLoader().load(modelSrc, (g) => {
      this.modelObj = g;
      this.add(g);

      // Materialセットアップ
      const mat = new DissolvableMeshStandardMaterial({
        transparent: true, // alpha値を有効にする
        side: DoubleSide, // 裏側も描画
      });
      mat.userData.uniforms.dissolveMap.value = dissolveMap;
      mat.userData.uniforms.uThreshold.value = params.threshold;
      mat.userData.uniforms.uEdgeWidth.value = params.edgeWidth;
      mat.userData.uniforms.uEdgeColor.value = new Color(params.edgeColor);
      (g.children[0] as Mesh).material = mat;

      // Guiセットアップ
      gui.add(params, "threshold", -0, 1).onChange((v: number) => {
        mat.userData.uniforms.uThreshold.value = v;
      });
      gui.add(params, "edgeWidth", 0, 0.1).onChange((v: number) => {
        mat.userData.uniforms.uEdgeWidth.value = v;
      });
      gui.addColor(params, "edgeColor").onChange((colorString: string) => {
        mat.userData.uniforms.uEdgeColor.value = new Color(colorString);
      });
    });
  }

  /** 毎フレーム更新処理 */
  onUpdate() {
    if (this.modelObj) this.modelObj.rotateY(rotateTick);
  }
}
