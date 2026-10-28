import { styled } from "@phantomstudios/css-components";

import { FONT_VARIABLES } from "@/theme/fonts";

import css from "./styles.module.scss";

export const CanvasElement = styled("div", {
  css: [css.CanvasElement, FONT_VARIABLES],
});
