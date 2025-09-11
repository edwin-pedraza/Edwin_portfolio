
import { motion } from "framer-motion";
import {Tilt} from "react-tilt";

import { fadeIn} from "../utils/motion";
import { github, webIcon } from "../../../assets";
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
            

              <div >
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

            <div>
              <div
                onClick={() => window.open(source_link_web, "_blank")}
                className='black-gradient w-10 h-10 rounded-full flex justify-center items-center cursor-pointer'
              >
                <img
                  src={webIcon}
                  alt='source code'
                  className='w-1/2 h-1/2 object-contain rounded-full'
                />
              </div>
            </div>

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
