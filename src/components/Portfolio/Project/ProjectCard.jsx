import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { Tilt } from "react-tilt";

import { fadeIn } from "../utils/motion";
import { github, webIcon } from "../../../assets";
import ModelPreview from "./ModelPreview";
import { styles } from "../../../styles";
import { withBase } from "../../../utils/basePath";

const openLink = (url) => {
  if (!url) return;
  const normalized = url.startsWith("/react/") ? url.replace("/react", "") : url;
  if (normalized.startsWith("/blog/")) {
    window.location.href = withBase(normalized);
  } else {
    window.open(url, "_blank", "noopener,noreferrer");
  }
};

export default function ProjectCard({
  index,
  name,
  description,
  tags = [],
  image,
  model_url: modelUrl,
  source_code_link: sourceCodeLink,
  source_link_web: sourceLinkWeb,
}) {
  return (
    <motion.div variants={fadeIn("up", "spring", index * 0.5, 0.75)}>
      <Tilt
        options={{ max: 45, scale: 1, speed: 450 }}
        className={`${styles.cardPadding} rounded-2xl sm:w-[360px] w-full`}
      >
        <div className="relative w-full h-full">
          {modelUrl ? (
            <div className={`w-full h-[260px] rounded-2xl overflow-hidden bg-tertiary ${styles.cardPadding}`}>
              <ModelPreview url={modelUrl} className="w-full h-full" />
            </div>
          ) : (
            <img
              src={image}
              alt={`${name} preview`}
              className={`w-full h-full object-cover rounded-2xl bg-tertiary ${styles.cardPadding}`}
            />
          )}

          <div className="absolute inset-0 flex gap-2 justify-end m-3 card-img_hover">
            {sourceCodeLink && sourceCodeLink !== sourceLinkWeb && (
              <button
                type="button"
                onClick={() => openLink(sourceCodeLink)}
                className="black-gradient w-10 h-10 rounded-full flex justify-center items-center cursor-pointer"
                aria-label="View source code"
              >
                <img src={github} alt="GitHub" className="w-1/2 h-1/2 object-contain" />
              </button>
            )}

            {sourceLinkWeb && (
              <button
                type="button"
                onClick={() => openLink(sourceLinkWeb)}
                className="black-gradient w-10 h-10 rounded-full flex justify-center items-center cursor-pointer text-white text-sm font-semibold"
                aria-label="Open project"
              >
                { (sourceLinkWeb.startsWith("/react/blog/") || sourceLinkWeb.startsWith("/blog/")) ? (
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a4 4 0 0 1 0-5.66l2.12-2.12a4 4 0 0 1 5.66 5.66l-1.2 1.2" />
                    <path d="M14 11a4 4 0 0 1 0 5.66l-2.12 2.12a4 4 0 0 1-5.66-5.66l1.2-1.2" />
                  </svg>
                ) : (
                  <img src={webIcon} alt="Open link" className="w-1/2 h-1/2 object-contain rounded-full" />
                )}
              </button>
            )}
          </div>

          <div className="mt-5">
            <h3 className="text-white font-bold text-[24px]">{name}</h3>
            <p className="mt-2 text-secondary text-[14px]">{description}</p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <p key={`${name}-${tag.name}`} className={`text-[14px] ${tag.color}`}>
                #{tag.name}
              </p>
            ))}
          </div>
        </div>
      </Tilt>
    </motion.div>
  );
}

ProjectCard.propTypes = {
  index: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  description: PropTypes.string,
  tags: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      color: PropTypes.string,
    })
  ),
  image: PropTypes.string,
  model_url: PropTypes.string,
  source_code_link: PropTypes.string,
  source_link_web: PropTypes.string,
};
