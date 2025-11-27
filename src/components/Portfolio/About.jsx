import PropTypes from "prop-types";
import { Tilt } from "react-tilt";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import { styles } from "../../styles";
import { services } from "./constants";
import { useSupabaseQuery, parseList } from "../../supabase/hooks";
import { SectionWrapper } from "./hoc";
import { fadeIn, textVariant } from "./utils/motion";

import foto from "../../assets/foto_edwin.png";

const slugify = (value = "") =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const ServiceCard = ({ index, title, icon, slug }) => {
  const targetSlug = slug || slugify(title || "");

  return (
    <Tilt className="sm:w-[250px] w-full flex-wrap justify-center">
      <motion.div
        variants={fadeIn("right", "spring", 0.5 * index, 0.75)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.45 }}
        className="w-full green-pink-gradient p-[1px] rounded-[20px] shadow-card"
      >
        <Link
          to={`/services/${targetSlug}`}
          className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#915EFF] rounded-[20px]"
        >
          <div className="bg-tertiary rounded-[20px] py-5 px-12 min-h-[280px] flex justify-evenly items-center flex-col">
            {icon ? (
              <img src={icon} alt="service-icon" className="w-20 h-20 object-contain rounded-full" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-black-200 flex items-center justify-center text-white text-xl">
                {title?.charAt(0) || "?"}
              </div>
            )}
            <h3 className="text-white text-[20px] font-bold text-center mt-4">{title}</h3>
            <p className="text-secondary text-center text-sm mt-2">Tap to explore the full service</p>
          </div>
        </Link>
      </motion.div>
    </Tilt>
  );
};

const About = () => {
  const { data: serviceRows } = useSupabaseQuery("service", { orderBy: "order" });
  const { data: profiles } = useSupabaseQuery("profile", { select: "*", orderBy: "id" });

  const serviceList =
    Array.isArray(serviceRows) && serviceRows.length > 0
      ? serviceRows.map((s) => ({
          title: s.title,
          icon: s.icon_url || undefined,
          slug: s.slug || slugify(s.title || ""),
        }))
      : services.map((service) => ({ ...service, slug: service.slug || slugify(service.title) }));

  const profile = Array.isArray(profiles) && profiles.length > 0 ? profiles[0] : null;

  const aboutParagraphs = (parseList(profile?.about_text) || []).length
    ? parseList(profile?.about_text)
    : [
        "I'm a Colombian System Engineer with a strong software testing and IT support background. Transitioning seamlessly into a skilled Frontend Developer, I'm passionate about crafting user-friendly web applications with CSS, HTML, and React.js.",
        "My standout feature is merging frontend finesse with backend proficiency. Python and Node.js fortify my server-side work, ensuring smooth user experiences by bridging the gap between front and backend.",
        "I excel in API management and thorough testing through tools like Postman, guaranteeing seamless integration of frontend and backend functionalities. Versatility defines me – SQL, MySQL, SQLite, MongoDB – I architect data-driven apps with scalable solutions for diverse project needs.",
        "Driven by meticulousness and problem-solving, I deliver uncompromising quality, exceeding expectations in dynamic environments. With my frontend prowess and robust backend/database foundation, I'm poised to elevate innovative projects in growth-focused organizations.",
      ];

  const photoUrl = profile?.photo_url || foto;

  return (
    <>
      <div className="flex sm:flex-row gap-10 flex-col-reverse">
        <div>
          <motion.div variants={textVariant()}>
            <p className={styles.sectionSubText}>Introduction</p>
            <h2 className={styles.sectionHeadTextSm}>Overview.</h2>
          </motion.div>

          <motion.div
            variants={fadeIn("", "", 0.1, 1)}
            className="mt-4 text-secondary text-[17px] max-w-lg leading-[30px] space-y-4"
          >
            {aboutParagraphs.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </motion.div>
        </div>

        <div className="m-auto w-full sm:w-[360px]">
          <Tilt className="w-full">
            <motion.div
              variants={fadeIn("left", "spring", 0.5, 0.75)}
              className="w-full green-pink-gradient p-[1px] rounded-[20px] shadow-card"
            >
              <div className="bg-tertiary rounded-[20px] m-2 py-5 px-8  flex flex-wrap justify-center flex-col">
                <img src={photoUrl} alt="foto" className="w-full h-full object-contain" />
              </div>
            </motion.div>
          </Tilt>
        </div>
      </div>

      <div className="mt-28 sm:mt-32 lg:mt-40 mx-10 flex flex-wrap gap-14 justify-center ">
        {serviceList.map((service, index) => (
          <ServiceCard key={service.title} index={index} {...service} />
        ))}
      </div>
    </>
  );
};

export default SectionWrapper(About, "about");

ServiceCard.propTypes = {
  index: PropTypes.number.isRequired,
  title: PropTypes.string,
  icon: PropTypes.string,
  slug: PropTypes.string,
};
