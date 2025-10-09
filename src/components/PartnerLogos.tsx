import asaArchipelLogo from '@/assets/asaarchipel.jpg';
import asaCaraibLogo from '@/assets/asacaraib.jpg';
import asagLogo from '@/assets/asag-logo.png';
import kartingLogo from '@/assets/karting.png';

const PartnerLogos = () => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 mb-8 px-4">
      <img 
        src={asaArchipelLogo} 
        alt="ASA Archipel" 
        className="h-16 md:h-20 w-auto object-contain"
      />
      <img 
        src={asaCaraibLogo} 
        alt="ASA Caraïb" 
        className="h-16 md:h-20 w-auto object-contain"
      />
      <img 
        src={asagLogo} 
        alt="ASAG - Association Sportive Automobile Guadeloupe" 
        className="h-16 md:h-20 w-auto object-contain"
      />
      <img 
        src={kartingLogo} 
        alt="ASK - Guadeloup' Kart" 
        className="h-16 md:h-20 w-auto object-contain"
      />
    </div>
  );
};

export default PartnerLogos;
