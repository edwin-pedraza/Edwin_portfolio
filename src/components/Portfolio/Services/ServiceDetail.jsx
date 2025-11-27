import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";

import { styles } from "../../../styles";
import { services as defaultServices } from "../constants";
import { useSupabaseQuery, parseList } from "../../../supabase/hooks";
import { fadeIn } from "../utils/motion";
import Navbar from "../Navbar";

const slugify = (value = "") =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const normalizeService = (service = {}) => {
  const title = service.title || "Service";
  return {
    title,
    slug: service.slug || slugify(title),
    icon: service.icon || service.icon_url || "",
    shortDescription:
      service.shortDescription ||
      service.short_description ||
      service.description ||
      "Detailed information coming soon.",
    focusAreas: parseList(service.focusAreas || service.focus_areas || service.highlights),
    toolset: parseList(service.toolset || service.tools || service.toolset_list),
    cta: service.cta || service.cta_text || "Let’s build something great together.",
  };
};

const ServiceDetail = () => {
  const { slug } = useParams();
  const { data: serviceRows, loading, error } = useSupabaseQuery("service", { orderBy: "order" });

  const serviceDictionary = useMemo(() => {
    const source = Array.isArray(serviceRows) && serviceRows.length > 0 ? serviceRows : defaultServices;
    return source.map(normalizeService).reduce((acc, service) => {
      if (!acc[service.slug]) acc[service.slug] = service;
      return acc;
    }, {});
  }, [serviceRows]);

  const service = slug ? serviceDictionary[slug] : null;

  const renderBody = () => {
    if (loading) return <p className="text-secondary mt-6">Loading service...</p>;
    if (error) return <p className="text-red-400 mt-6">Unable to load this service right now.</p>;
    if (!service)
      return (
        <div className="mt-10 space-y-6">
          <p className="text-secondary">We couldn’t find the service you’re looking for.</p>
          <Link to="/" className="text-sm text-white underline underline-offset-4">
            Return to the homepage
          </Link>
        </div>
      );

    return (
      <div className="mt-10 grid gap-12 lg:grid-cols-[2fr_1fr] items-start">
        <motion.div variants={fadeIn("", "", 0.1, 1)} initial="hidden" animate="show" className="space-y-8">
          <p className="text-secondary text-lg">{service.shortDescription}</p>

          {service.focusAreas.length > 0 && (
            <div>
              <h3 className="text-white text-xl font-semibold">What I focus on</h3>
              <ul className="mt-4 list-disc list-inside space-y-2 text-secondary">
                {service.focusAreas.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {service.toolset.length > 0 && (
            <div>
              <h3 className="text-white text-xl font-semibold">Primary toolset</h3>
              <div className="mt-4 flex flex-wrap gap-3">
                {service.toolset.map((tool) => (
                  <span
                    key={tool}
                    className="text-sm bg-black-200/60 text-white px-3 py-1 rounded-full border border-white/10"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="green-pink-gradient p-[1px] rounded-[20px] shadow-card">
            <div className="bg-tertiary rounded-[20px] p-6">
              <p className="text-white font-semibold text-lg mb-2">Ready when you are</p>
              <p className="text-secondary">{service.cta}</p>
            </div>
          </div>
        </motion.div>

        <motion.aside
          variants={fadeIn("left", "spring", 0.2, 0.75)}
          initial="hidden"
          animate="show"
          className="bg-tertiary rounded-2xl p-8 flex flex-col items-center gap-6 text-center"
        >
          {service.icon ? (
            <img src={service.icon} alt={service.title} className="h-24 w-24 object-contain" />
          ) : (
            <div className="h-24 w-24 rounded-full bg-black-200 flex items-center justify-center text-4xl font-bold">
              {service.title.charAt(0)}
            </div>
          )}
          <div>
            <h3 className="text-white text-2xl font-bold">{service.title}</h3>
            <p className="text-secondary mt-2">Service overview</p>
          </div>
          <Link
            to="/#contact"
            className="w-full text-center py-3 rounded-full bg-gradient-to-r from-[#915EFF] to-[#70FFAE] text-white font-semibold"
          >
            Talk to me
          </Link>
        </motion.aside>
      </div>
    );
  };

  return (
    <div className="relative z-0 bg-primary min-h-screen">
      <Navbar />
      <section className={`${styles.paddingX} ${styles.paddingY} pt-32 pb-20`}>
        <div className="max-w-6xl mx-auto">
          <div className="mt-6">
            <p className={styles.sectionSubText}>Services</p>
            <h1 className={styles.sectionHeadTextSm}>{service ? service.title : "Service Detail"}</h1>
          </div>

          {renderBody()}
        </div>
      </section>
    </div>
  );
};

export default ServiceDetail;
