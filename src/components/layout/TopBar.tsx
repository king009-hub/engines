import { memo } from 'react';
import { Link } from 'react-router-dom';

const TopBar = memo(() => {
  return (
    <div className="bg-[#1b1b1b] text-white border-b border-[#2d2d2d]">
      <div className="container mx-auto px-4">
        {/* Desktop */}
        <div className="hidden md:flex items-center justify-between py-2 text-[11px] font-medium tracking-wide uppercase">
          <div className="flex items-center gap-4">
            <Link to="/account" className="hover:text-[#d4af37] transition-colors">My Account</Link>
            <span className="opacity-30">|</span>
            <Link to="/contact" className="hover:text-[#d4af37] transition-colors">Contact Us</Link>
            <span className="opacity-30">|</span>
            <div className="flex items-center gap-2">
              <span className="bg-[#d4af37] text-[#1b1b1b] px-2 py-0.5 rounded-sm font-black text-[10px] animate-pulse">
                30% OFF
              </span>
              <span className="text-white font-bold tracking-tight">Summer Sale Live</span>
            </div>
          </div>
          <div className="text-[#d4af37] text-[11px] font-semibold tracking-[0.24em]">
            USED AUTO PARTS, ENGINES AND GEARBOXES
          </div>
        </div>

        {/* Mobile */}
        <div className="md:hidden py-2 flex items-center justify-center gap-3">
          <span className="bg-[#d4af37] text-[#1b1b1b] px-1.5 py-0.5 rounded-sm font-black text-[9px]">
            30% OFF
          </span>
          <span className="font-medium tracking-[0.1em] uppercase text-[10px] text-[#d4af37]">
            Worldwide Shipping | Secure Checkout
          </span>
        </div>
      </div>
    </div>
  );
});

TopBar.displayName = 'TopBar';

export default TopBar;
