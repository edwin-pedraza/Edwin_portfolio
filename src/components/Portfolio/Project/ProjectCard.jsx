
import { motion } from "framer-motion";
import {Tilt} from "react-tilt";

import { fadeIn} from "../utils/motion";
import { github, webIcon } from "../../../assets";
import { Link } from "react-router-dom";
import ModelPreview from "./ModelPreview";
import { styles } from "../../../styles";


const ProjectCard =({
  index,
  name,
  description,
  tags,
  image,
  model_url,
  source_code_link,
  source_link_web,
}
) => {
  

  return (
    <div>
    <motion.div variants={fadeIn("up", "spring", index * 0.5, 0.75)}>
    <Tilt options={{
          max: 45,
          scale: 1,
          speed: 450}}
          className={`${styles.cardPadding} rounded-2xl sm:w-[360px] w-full sm:h-full`}
      >
          <div className=' relative w-full h-full'>
            {model_url ? (
              <div className={`w-full h-[260px] rounded-2xl overflow-hidden bg-tertiary ${styles.cardPadding}`}>
                <ModelPreview url={model_url} className='w-full h-full' />
              </div>
            ) : (
              <img
                src={image}
                alt='project_image'
                className={`w-full h-full object-cover rounded-2xl bg-tertiary ${styles.cardPadding}`}
              />
            )}
          

          <div className=' absolute inset-0 flex gap-2 justify-end m-3 card-img_hover'>

            {source_code_link && source_code_link !== source_link_web && (
              <div>
                <div
                  onClick={() => window.open(source_code_link, "_blank")}
                  className='black-gradient w-10 h-10 rounded-full flex justify-center items-center cursor-pointer'
                >
                  <img
                    src={github}
                    alt='source code'
                    className='w-1/2 h-1/2 object-contain'
                  />
                </div>
              </div>
            )}

            {source_link_web && (
              <div>
                <div
                  onClick={() => {
                    if (source_link_web.startsWith('/react/blog/')) {
                      window.location.href = source_link_web
                    } else {
                      window.open(source_link_web, "_blank")
                    }
                  }}
                  className='black-gradient w-10 h-10 rounded-full flex justify-center items-center cursor-pointer text-white text-sm font-semibold'
                >
                  {source_link_web.startsWith('/react/blog/') ? (
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 13a4 4 0 0 1 0-5.66l2.12-2.12a4 4 0 0 1 5.66 5.66l-1.2 1.2" />
                      <path d="M14 11a4 4 0 0 1 0 5.66l-2.12 2.12a4 4 0 0 1-5.66-5.66l1.2-1.2" />
                    </svg>
                  ) : (
                    <img
                      src={webIcon}
                      alt='source link'
                      className='w-1/2 h-1/2 object-contain rounded-full'
                    />
                  )}
                </div>
              </div>
            )}

          </div>

          
          

          
          <div className='mt-5'>
            <h3 className='text-white font-bold text-[24px]'>{name}</h3>
            <p className='mt-2 text-secondary text-[14px]'>{description}</p>
          </div>

          <div className='mt-4 flex flex-wrap gap-2'>
            {tags.map((tag) => (
              <p
                key={`${name}-${tag.name}`}
                className={`text-[14px] ${tag.color}`}
              >
                #{tag.name}
              </p>
            ))}
          </div>
        </div>
      
      
    
    
    </Tilt>
    </motion.div>
    </div>
    
  )
}

export default ProjectCard
