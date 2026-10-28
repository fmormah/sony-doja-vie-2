import { ShaderMaterial } from "three";

import { fragmentShader } from "./Shaders/fragment";
import { vertexShader } from "./Shaders/vertex";

export enum ColorAdjustShaderUniforms {
  T_DIFFUSE = "tDiffuse",
  CONTRAST = "contrast",
  BRIGHTNESS = "brightness",
  SATURATION = "saturation",
  EXPOSURE = "exposure",
}

class ColorAdjustMaterial extends ShaderMaterial {
  constructor() {
    super({
      name: "ColorAdjustShader",
      uniforms: {
        [ColorAdjustShaderUniforms.T_DIFFUSE]: { value: null },
        [ColorAdjustShaderUniforms.CONTRAST]: { value: 1.0 },
        [ColorAdjustShaderUniforms.BRIGHTNESS]: { value: 0.0 },
        [ColorAdjustShaderUniforms.SATURATION]: { value: 1.0 },
        [ColorAdjustShaderUniforms.EXPOSURE]: { value: 0.0 },
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    });
  }

  setContrast(value: number) {
    this.uniforms[ColorAdjustShaderUniforms.CONTRAST].value = value;
  }

  setBrightness(value: number) {
    this.uniforms[ColorAdjustShaderUniforms.BRIGHTNESS].value = value;
  }

  setSaturation(value: number) {
    this.uniforms[ColorAdjustShaderUniforms.SATURATION].value = value;
  }

  setExposure(value: number) {
    this.uniforms[ColorAdjustShaderUniforms.EXPOSURE].value = value;
  }
}

export default ColorAdjustMaterial;
