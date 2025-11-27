import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { styles } from "../../styles";
import { navLinks, services as defaultServices } from "./constants";
import { useSupabaseQuery } from "../../supabase/hooks";
import { logo, menu, close } from "../../assets";
import { basePath } from "../../utils/basePath";

const slugify = (value = "") =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const Navbar = () => {
  const [active, setActive] = useState("");
  const [toggle, setToggle] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [serviceOpen, setServiceOpen] = useState(false);
  const desktopServiceRef = useRef(null);
  const mobileServiceRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { data: navRows } = useSupabaseQuery("nav_link", { orderBy: "order" });
  const { data: serviceRows } = useSupabaseQuery("service", { orderBy: "order" });
  const menuItems =
    Array.isArray(navRows) && navRows.length > 0
      ? navRows.map((n) => ({
          id: n.id,
          title: n.title,
          path: n.path || n.href || null,
        }))
      : navLinks;

  const serviceLinks = useMemo(() => {
    const source =
      Array.isArray(serviceRows) && serviceRows.length > 0 ? serviceRows : defaultServices;
    return source.map((service) => ({
      title: service.title,
      slug: service.slug || slugify(service.title || ""),
    }));
  }, [serviceRows]);


  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      if (scrollTop > 100) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      const hashUrl = basePath === "/" ? `#${id}` : `${basePath}#${id}`;
      window.history.replaceState(null, "", hashUrl);
    }
  };

  const handleNavClick = (nav) => {
    if (nav.id === "service") {
      setServiceOpen((prev) => !prev);
      return;
    }

    setActive(nav.title);
    setToggle(false);

    if (nav.path || nav.id === "service") {
      navigate(nav.path || "/services/web-developer");
      return;
    }

    if (location.pathname !== "/") {
      navigate(`/#${nav.id}`);
      return;
    }

    scrollToSection(nav.id);
  };

  const handleServiceNavigate = (slug) => {
    setServiceOpen(false);
    setToggle(false);
    navigate(`/services/${slug}`);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        (desktopServiceRef.current && desktopServiceRef.current.contains(event.target)) ||
        (mobileServiceRef.current && mobileServiceRef.current.contains(event.target))
      ) {
        return;
      }
      setServiceOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setServiceOpen(false);
  }, [location.pathname, location.hash]);

  return (
    <nav
      className={`${
        styles.paddingX
      } w-full flex items-center py-5 fixed top-0 z-20 ${
        scrolled ? "bg-primary" :   "bg-transparent" 
      }`}
    >
      <div className='w-full flex justify-between items-center max-w-7xl mx-auto'>
        <Link
          to='/'
          className='flex items-center gap-2'
          onClick={() => {
            setActive("");
            window.scrollTo(0, 0);
          }}
        >
          <img src={logo} alt='logo' className='w-14 h-14 object-contain bg-primary rounded-xl border-2 border-secondary' />
          <p className='text-white text-[18px] font-bold cursor-pointer flex '>
            Edwin &nbsp;
            <span className='sm:block hidden'> | Web Developer</span>
          </p>
        </Link>

        <ul className='list-none hidden sm:flex flex-row gap-10'>
          {menuItems.map((nav) => (
            <li
              key={nav.id}
              className={`${
                active === nav.title ? "text-white" : "text-secondary"
              } hover:text-white text-[18px] font-medium cursor-pointer relative`}
              ref={nav.id === "service" ? desktopServiceRef : undefined}
            >
              <button
                type="button"
                className="bg-transparent border-0 outline-none text-current"
                onClick={() => handleNavClick(nav)}
              >
                {nav.title}
              </button>

              {nav.id === "service" && serviceOpen && (
                <div className="absolute top-full left-0 mt-3 bg-tertiary rounded-2xl shadow-lg border border-white/10 min-w-[200px] p-4 z-30">
                  <p className="text-secondary text-sm mb-3">Choose a service</p>
                  <ul className="space-y-2">
                    {serviceLinks.map((service) => (
                      <li key={service.slug}>
                        <button
                          type="button"
                          className="text-left w-full text-white hover:text-[#915EFF] transition-colors"
                          onClick={() => handleServiceNavigate(service.slug)}
                        >
                          {service.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
            
          ))}
          <Link
          to='/blog'
            className={`${
              active === true ? "text-white" : "text-secondary"
            } hover:text-white text-[18px] font-medium cursor-pointer`}
          >Blog</Link>
        </ul>

        <div className='sm:hidden flex flex-1 justify-end items-center'>
          <img
            src={toggle ? close : menu}
            alt='menu'
            className='w-[20px] h-[20px] object-contain cursor-pointer'
            onClick={() => setToggle(!toggle)}
          />

          <div
            className={`${
              !toggle ? "hidden" : "flex"
            } p-6 black-gradient absolute top-20 right-0 mx-4 my-2 min-w-[140px] z-10 rounded-xl`}
          >
            <ul className='list-none flex justify-end items-start flex-col gap-4'>
              {menuItems.map((nav) => (
                <li
                  key={nav.id}
                  className={`font-poppins font-medium cursor-pointer text-[16px] ${
                    active === nav.title ? "text-white" : "text-secondary"
                  }`}
                  ref={nav.id === "service" ? mobileServiceRef : undefined}
                >
                  {nav.id === "service" ? (
                    <div className="w-full">
                      <button
                        type="button"
                        className="bg-transparent border-0 outline-none text-left text-current"
                        onClick={() => handleNavClick(nav)}
                      >
                        {nav.title}
                      </button>

                      {serviceOpen && (
                        <ul className="mt-3 space-y-2 pl-3 border-l border-white/10">
                          {serviceLinks.map((service) => (
                            <li key={service.slug}>
                              <button
                                type="button"
                                className="text-left text-secondary hover:text-white"
                                onClick={() => handleServiceNavigate(service.slug)}
                              >
                                {service.title}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="bg-transparent border-0 outline-none text-left text-current"
                      onClick={() => handleNavClick(nav)}
                    >
                      {nav.title}
                    </button>
                  )}
                </li>
              ))}
              <li>
                <Link
                  to='/blog'
                  className={`font-poppins font-medium cursor-pointer text-[16px] ${
                    active === 'Blog' ? 'text-white' : 'text-secondary'
                  }`}
                  onClick={() => setToggle(false)}
                >
                  Blog
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
