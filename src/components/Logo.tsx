
import { useState, useEffect } from 'react';
import { useBackgroundRemoval } from '@/hooks/useBackgroundRemoval';

interface LogoProps {
  src: string;
  alt: string;
  className?: string;
  removeBackground?: boolean;
}

const Logo = ({ src, alt, className, removeBackground = true }: LogoProps) => {
  const { processImageUrl, isProcessing } = useBackgroundRemoval();
  const [imageSrc, setImageSrc] = useState(src);

  useEffect(() => {
    if (removeBackground) {
      const processImage = async () => {
        const processedUrl = await processImageUrl(src, src);
        setImageSrc(processedUrl);
      };
      processImage();
    }
  }, [src, removeBackground, processImageUrl]);

  return (
    <img 
      src={imageSrc}
      alt={alt}
      className={`${className} ${isProcessing ? 'opacity-50' : ''} rounded-lg`}
    />
  );
};

export default Logo;
