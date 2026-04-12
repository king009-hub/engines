import { Link } from 'react-router-dom';

const TopBar = () => {
  return (
    <div className="bg-[#b38a2e] text-white">
      <div className="container mx-auto px-4">
        {/* Desktop */}
        <div className="hidden md:flex items-center justify-between py-1.5 text-[11px] font-medium tracking-tight">
          <div className="flex items-center gap-0">
            <Link to="/" className="hover:text-white/80 px-3">Welcome</Link>
            <span className="opacity-40">|</span>
            <Link to="/account" className="hover:text-white/80 px-3">My account</Link>
            <span className="opacity-40">|</span>
            <Link to="/contact" className="hover:text-white/80 px-3">Contact us</Link>
          </div>
          <div className="font-medium uppercase text-[12px] tracking-wide">
            USED AUTO PARTS
          </div>
        </div>
        {/* Mobile - visible on screens smaller than 1024px */}
        <div className="lg:hidden py-2 text-center">
          <span className="font-medium tracking-widest uppercase text-xs">USED AUTO PARTS</span>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
