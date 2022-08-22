import { MeshStandardMaterial, Shader, WebGLRenderer } from "three";

/**
 * MeshStandardMaterialのシェーダーを拡張し、ディゾルブエフェクト機能を追加
 */
export class DissolvableMeshStandardMaterial extends MeshStandardMaterial {
  constructor(...params: ConstructorParameters<typeof MeshStandardMaterial>) {
    super(...params);

    // userDataにuniform追加
    Object.assign(this.userData, {
      uniforms: {
        dissolveMap: { value: null },
        uThreshold: { value: 1.0 },
        uEdgeWidth: { value: 0.01 },
        uEdgeColor: { value: [0, 0.89, 1.0] },
      },
    });
  }

  /**
   * @override
   */
  onBeforeCompile(shader: Shader, _renderer: WebGLRenderer): void {
    // uniform同期
    Object.assign(shader.uniforms, this.userData.uniforms);

    // vertexShader拡張
    // 独自のvDisUvというvaring変数を設定
    // "vUv"は条件によってdefineされないことがあるため
    shader.vertexShader = shader.vertexShader.replace(
      "void main() {",
      /* glsl */ `
      varying vec2 vDisUv;
      void main() {
        vDisUv = vec2( uv.x, uv.y );
      `
    );

    // fragmentShader拡張その１：uniform宣言
    shader.fragmentShader = shader.fragmentShader.replace(
      "void main() {",
      /* glsl */ `
      uniform sampler2D dissolveMap;
      uniform float uThreshold;
      uniform float uEdgeWidth;
      uniform vec3 uEdgeColor;
      varying vec2 vDisUv;
      void main() {
      `
    );

    // fragmentShader拡張その２：diffuseColor計算処理の追加
    shader.fragmentShader = shader.fragmentShader.replace(
      "vec4 diffuseColor = vec4( diffuse, opacity );",
      /* glsl */ `
      float alpha = opacity;
      float noise = texture2D(dissolveMap, vDisUv).g;

      if ( noise > uThreshold) {
        alpha = 0.0;
      }

      vec3 color = diffuse;
      if ( noise + uEdgeWidth > uThreshold ) {
        color *= uEdgeColor;
      }

      vec4 diffuseColor = vec4(color, alpha);
      `
    );
  }
}
