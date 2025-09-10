import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import { motion } from "framer-motion";

import "react-vertical-timeline-component/style.min.css";

import { styles } from "../../../styles";
import { experiences } from "../constants";
import { SectionWrapper } from "../hoc";
import { useSupabaseQuery, parseList } from "../../../supabase/hooks";

const ExperienceCard = ({ experience }) => {
  return (
    <VerticalTimelineElement
      contentStyle={{
        background: "#1d1836",
        color: "#fff",
      }}
      contentArrowStyle={{ borderRight: "7px solid  #232631" }}
      date={experience.date}
      iconStyle={{ background: experience.iconBg }}
      icon={
        <div className='flex justify-center items-center w-full h-full '>
          <img
            src={experience.icon}
            alt={experience.company_name}
            className='w-[90%] h-[90%] object-contain '
          />
        </div>
      }
    >
      <div>
        <h3 className='text-white text-[24px] font-bold'>{experience.title}</h3>
        <p
          className='text-secondary text-[16px] font-semibold'
          style={{ margin: 0 }}
        >
          {experience.company_name}
        </p>
        <p
          className='text-secondary text-[16px] font-semibold my-2'
          
        >
          {experience.Achievement.subtitle}
        </p>
      </div>

      <ul className='mt-5 list-disc ml-5 space-y-2'>
        {experience.Achievement.point.map((point, index) => (
          <li
            key={`experience-point-${index}`}
            className='text-white-100 text-[14px] pl-1 tracking-wider'
          >
            {point}
          </li>
        ))}
      </ul>

      <div>
        <p
          className='text-secondary text-[16px] font-semibold my-2'
          
        >
          {experience.respon.subtitle}
        </p>

        <ul className='mt-5 list-disc ml-5 space-y-2'>
        {experience.respon.point.map((point, index) => (
          <li
            key={`experience-point-${index}`}
            className='text-white-100 text-[14px] pl-1 tracking-wider'
          >
            {point}
          </li>
          ))}
        </ul>
      </div>

      
    </VerticalTimelineElement>
  );
};

const Experience = () => {
  const { data: expData } = useSupabaseQuery('experience', { orderBy: 'order' })
  const list = Array.isArray(expData) && expData.length > 0
    ? expData.map((row) => ({
        title: row.title,
        company_name: row.company_name,
        icon: row.icon_url || row.icon || undefined,
        iconBg: row.icon_bg || '#383E56',
        date: row.date,
        Achievement: {
          subtitle: row.achievement_subtitle || 'Achievements',
          point: parseList(row.achievement_points),
        },
        respon: {
          subtitle: row.respon_subtitle || 'Responsibilities',
          point: parseList(row.respon_points),
        },
      }))
    : experiences

  return (
    <>
      <motion.div>
        <p className={`${styles.resumeSubText} text-center`}>
          What I have done so far
        </p>
        <h2 className={`${styles.resumeText} text-center`}>
          Work Experience.
        </h2>
      </motion.div>

      <div className='mt-20 flex flex-col'>

        <VerticalTimeline>
          {list.map((experience, index) => (
            <ExperienceCard
              key={`experience-${index}`}
              experience={experience}
            />
          ))}
        </VerticalTimeline>
      </div>
    </>
  );
};

export default SectionWrapper(Experience, "work");
