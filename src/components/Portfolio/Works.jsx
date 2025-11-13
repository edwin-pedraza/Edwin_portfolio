import { motion } from "framer-motion";

import { styles } from "../../styles";

import { SectionWrapper } from "./hoc";
import { projects } from "../Portfolio/constants";
import { useSupabaseQuery } from "../../supabase/hooks";
import { fadeIn, textVariant } from "./utils/motion";
import ProjectCard from "./Project/ProjectCard";
import { combineTagSources } from "../blog/page/tagUtils";

const Works = () => {
  // Load projects and tags from Supabase with graceful fallback
  const { data: projectRows } = useSupabaseQuery('project', { orderBy: 'order' })
  const { data: tagRows } = useSupabaseQuery('project_tag', { select: 'project_id, tag:tag(name,color)' })
  const { data: postRows } = useSupabaseQuery('post', { select: 'id,title,excerpt,cover_url,project_url,tech_tags,tag,portfolio_featured,portfolio_order', orderBy: 'portfolio_order' })

  const projectTagsMap = (tagRows || []).reduce((acc, row) => {
    if (!acc[row.project_id]) acc[row.project_id] = []
    if (row.tag) acc[row.project_id].push({ name: row.tag.name, color: row.tag.color })
    return acc
  }, {})

  const supabaseProjects = Array.isArray(projectRows) && projectRows.length > 0
    ? projectRows.map((p) => ({
        name: p.name,
        description: p.description,
        tags: projectTagsMap[p.id] || [],
        image: p.image_url || undefined,
        model_url: p.model_url || undefined,
        source_code_link: p.source_code_link,
        source_link_web: p.source_link_web,
        sort: p.order ?? 999,
      }))
    : []

  const postProjects = Array.isArray(postRows)
    ? postRows
        .filter((post) => post.portfolio_featured)
        .map((post) => {
          const tags = combineTagSources(post.tag, post.tech_tags).map((name) => ({ name, color: 'text-secondary' }))
          const blogLink = `/react/blog/blog-detail/${post.id}`
          return {
            name: post.title,
            description: post.excerpt || 'Featured blog project',
            tags,
            image: post.cover_url || undefined,
            model_url: undefined,
            source_code_link: blogLink,
            source_link_web: post.project_url || blogLink,
            sort: post.portfolio_order ?? 999,
          }
        })
    : []

  const computedList = [...postProjects, ...supabaseProjects]
    .sort((a, b) => (a.sort ?? 999) - (b.sort ?? 999))

  const list = computedList.length > 0 ? computedList : projects

  return (
    <>
      <motion.div variants={textVariant()} >
        <p className={`${styles.sectionSubText} `}>My work</p>
        <h2 className={`${styles.sectionHeadText}`}>Projects.</h2>
      </motion.div>

      <div className='w-full flex'>
        <motion.p
          variants={fadeIn("", "", 0.1, 1)}
          className={`${styles.paragraphSpacing} ${styles.bodyText} max-w-3xl`}
        >
          Following projects showcases my skills and experience through
          real-world examples of my work. Each project is briefly described with
          links to code repositories and live demos in it. It reflects my
          ability to solve complex problems, work with different technologies,
          and manage projects effectively.
        </motion.p>
      </div>

      <div className='my-20 flex  gap-7 flex-wrap justify-center'>
        {list.map((project, index) => (
          <ProjectCard key={`project-${index}`} index={index} {...project} />
        ))}
      </div>
      
    </>
  )
}

export default SectionWrapper(Works, "projects");
