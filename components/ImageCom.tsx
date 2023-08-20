"use client";

import { useState } from "react";
import Image from "next/image";

type Props = {
  src: string;
  classname: string;
  width: number;
  height: number;
  alt: string;
};
const ImageCom = ({ src, classname, width, height, alt }: Props) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [imgWidth, setImgWidth] = useState(width);
  const [imgHeight, setImgHeight] = useState(height);

  const handleErrorImage = () => {
    setImgSrc("/sorryclose.svg")
    setImgWidth(107)
    setImgHeight(90)
  }
  return (
    <Image
      src={ imgSrc }
      width={ imgWidth }
      height={ imgHeight }
      alt={alt}
      className={ classname }
      onError={() => { handleErrorImage() }}
    />
  );
};

export default ImageCom;
