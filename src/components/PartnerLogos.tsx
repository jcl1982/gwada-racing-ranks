import asaArchipelLogo from '@/assets/asaarchipel.jpg';
import asaCaraibLogo from '@/assets/asacaraib.jpg';
import asagLogo from '@/assets/asag-logo.png';
import kartingLogo from '@/assets/karting.png';
import Logo from './Logo';

const PartnerLogos = () => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-8 px-4 md:px-8 max-w-6xl mx-auto">
      <Logo 
        src={asaArchipelLogo} 
        alt="ASA Archipel" 
        className="h-16 md:h-20 w-auto object-contain"
      />
      <Logo 
        src={asaCaraibLogo} 
        alt="ASA Caraïb" 
        className="h-16 md:h-20 w-auto object-contain"
      />
      <Logo 
        src={asagLogo} 
        alt="ASAG - Association Sportive Automobile Guadeloupe" 
        className="h-16 md:h-20 w-auto object-contain"
      />
      <Logo 
        src={kartingLogo} 
        alt="ASK - Guadeloup' Kart" 
        className="h-16 md:h-20 w-auto object-contain"
      />
    </div>
  );
};

export default PartnerLogos;
