import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { X, MapPin, Menu } from "lucide-react";
import { useActiveSection } from "../../hooks/useActiveSection";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollPos, setLastScrollPos] = useState(0);
  const activeSection = useActiveSection();

  // Scroll visibility logic
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      
      if (currentScrollPos < lastScrollPos || currentScrollPos < 100) {
        setIsNavVisible(true);
      } else if (currentScrollPos > lastScrollPos && currentScrollPos > 100) {
        setIsNavVisible(false);
        setIsMenuOpen(false); 
      }
      
      setLastScrollPos(currentScrollPos);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollPos]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className={`fixed inset-x-0  top-0 z-50 transition-transform duration-300 ${
      isNavVisible ? "translate-y-0" : "-translate-y-full"
    }`}>
      <div className="bg-zinc-950 backdrop-blur-md border-b border-zinc-800">
        <div className="container mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
          <Link
            to="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            onClick={() => setIsMenuOpen(false)}
          >
            <MapPin size={24} className="text-orange-500" />
            <span className="text-xl font-bold uppercase tracking-tight text-white font-author">
              Locus
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-12 space-x-4">
            {[
              { label: 'Home', id: 'home' },
              { label: 'How it Works', id: 'how-it-works' },
              { label: 'Features', id: 'features' },
              { label: 'FAQs', id: 'faqs' },
            ].map((item) => {
              const href = `#${item.id}`;
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={href}
                  className={`text-md font-medium font-author-300 transition-colors relative group ${
                    isActive ? "text-orange-500" : "text-white hover:text-orange-500 duration-700"
                  }`}
                >
                  {item.label}
                  <span className={`absolute bottom-0 left-0 h-0.5 bg-orange-500 transition-all ${
                    isActive ? "w-full" : "w-0 group-hover:w-full"
                  }`} />
                </a>
              );
            })}
          </nav>

          <div className="flex items-center gap-4">
            <Link
              to="/signup"
              className="hidden md:inline-block px-8 py-3 border border-orange-600 text-white font-bold font-author rounded-sm hover:bg-orange-700 transition-colors text-sm uppercase tracking-wide"
            >
              Get Started
            </Link>

            {/* Mobile Menu Trigger */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 text-white hover:text-orange-500 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar - Drawer from right */}
      <div
        className={`fixed right-0 top-0 h-screen w-72 bg-zinc-900 border-l border-zinc-800 z-40 transform transition-transform duration-300 md:hidden ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-end p-5">
          <button
            onClick={() => setIsMenuOpen(false)}
            className="p-2 text-white hover:text-orange-500"
          >
            <X size={28} />
          </button>
        </div>

        <nav className="flex flex-col py-4 space-y-2 px-6">
          {[
            { label: 'Home', id: 'home' },
            { label: 'How it Works', id: 'how-it-works' },
            { label: 'Features', id: 'features' },
            { label: 'FAQs', id: 'faqs' },
          ].map((item) => {
            const href = `#${item.id}`;
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={href}
                className={`py-3 text-lg font-medium font-author transition-colors ${
                  isActive ? "text-orange-500" : "text-white hover:text-orange-500"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </a>
            );
          })}
          
          <div className="pt-6">
            <Link
              to="/signup"
              className="block w-full py-4 text-white bg-orange-600 hover:bg-orange-700 transition-colors font-bold font-author text-center rounded-sm"
              onClick={() => setIsMenuOpen(false)}
            >
              Get Started
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;