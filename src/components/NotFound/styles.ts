import { styled } from "@phantomstudios/css-components";
import Image from "next/image";

import css from "./NotFound.module.scss";

export const Container = styled("div", {
  css: css.container,
});

export const Main = styled("main", {
  css: css.main,
});

export const SvgBackground = styled("div", {
  css: css.svgBackground,
});

export const BackgroundImage = styled(Image, {
  css: [],
});

export const Content = styled("div", {
  css: css.content,
});

export const ErrorText = styled("div", {
  css: css.errorText,
});

export const MainSvg = styled("div", {
  css: css.mainSvg,
});

export const MainImage = styled(Image, {
  css: [],
});

export const Description = styled("div", {
  css: css.description,
});
