"use client";

import { useRouter } from "next/navigation";
import React from "react";

import Button from "@/components/atoms/Button";
import { PageHeader } from "@/components/molecules/PageHeader";
import { Footer } from "@/components/organisms/Footer";

import {
  BackgroundImage,
  Container,
  Content,
  Description,
  ErrorText,
  Main,
  MainImage,
  MainSvg,
  SvgBackground,
} from "./styles";

const NotFound = () => {
  const router = useRouter();
  const handleBackHome = () => {
    router.push("/");
  };

  return (
    <Container>
      <PageHeader src="/assets/images/dc-logo.svg" />

      <Main>
        <SvgBackground>
          <BackgroundImage
            src="/assets/images/notfound/darkRose.svg"
            alt="Rose Background"
            fill
          />
        </SvgBackground>

        <Content>
          <ErrorText>Error 404</ErrorText>

          <MainSvg>
            <MainImage
              src="/assets/images/notfound/404-hero.webp"
              alt="Not Found"
              fill
            />
          </MainSvg>

          <Description>
            You&#39;re lost, baby. <br />
            But don&#39;t trip — I got you. <br />
            Let&#39;s head back and start fresh.
          </Description>

          <Button label="Back Home" onClick={handleBackHome} />
        </Content>
      </Main>

      <Footer showMuteButton={false} />
    </Container>
  );
};

export default NotFound;
