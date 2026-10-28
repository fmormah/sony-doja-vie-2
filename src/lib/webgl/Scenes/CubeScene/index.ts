import { BoxGeometry, Mesh, MeshNormalMaterial, Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";

import SceneBase from "@/lib/webgl/SceneBase";

const CONFIG = {
  cube: {
    rotation: new Vector3(0.1, 0.1, 0),
  },
  camera: {
    position: new Vector3(0, 0, 3),
  },
};

class CubeScene extends SceneBase {
  private controls: OrbitControls;
  private cube: Mesh;
  constructor() {
    super();

    this.cube = this.getCube();
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.scene.add(this.cube);
    this.camera.position.copy(CONFIG.camera.position);
  }

  override update() {
    super.update();
    this.controls.update();

    const { x, y, z } = CONFIG.cube.rotation;
    this.cube.rotateX(this.clock.deltaTime * x);
    this.cube.rotateY(this.clock.deltaTime * y);
    this.cube.rotateZ(this.clock.deltaTime * z);
  }

  private getCube() {
    const geometry = new BoxGeometry();
    const material = new MeshNormalMaterial();
    return new Mesh(geometry, material);
  }
}

export default CubeScene;
