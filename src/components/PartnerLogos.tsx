import asaCaraibLogo from '@/assets/asacaraib.jpg';
import asagLogo from '@/assets/asag-logo.png';
import Logo from './Logo';

const PartnerLogos = () => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-8 mb-8 px-4 md:px-8 max-w-6xl mx-auto">
      <Logo 
        src={asagLogo} 
        alt="ASAG - Association Sportive Automobile Guadeloupe" 
        className="h-16 md:h-20 w-auto object-contain"
        removeBackground={false}
      />
      <Logo 
        src={asaCaraibLogo} 
        alt="ASA Caraïb" 
        className="h-16 md:h-20 w-auto object-contain"
        removeBackground={false}
      />
    </div>
  );
};

export default PartnerLogos;
