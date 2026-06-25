import {defineField, defineType} from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({name: 'name', title: 'Full name', type: 'string'}),
    defineField({name: 'email', title: 'Email', type: 'string'}),
    defineField({name: 'website', title: 'Website', type: 'string'}),
    defineField({name: 'linkedin', title: 'LinkedIn path', type: 'string', description: 'e.g. in/devadhathan/'}),
    defineField({name: 'phone', title: 'Phone', type: 'string'}),
    defineField({name: 'github', title: 'GitHub username or URL', type: 'string'}),
    defineField({
      name: 'experienceIntro',
      title: 'Experience card intro',
      type: 'text',
      description: 'Wrap highlighted phrases in **double asterisks** for white emphasis, e.g. crafting **thoughtful, user-centric products** across...',
    }),
    defineField({
      name: 'awards',
      title: 'Awards',
      type: 'array',
      of: [{type: 'string'}],
    }),
    defineField({
      name: 'certifications',
      title: 'Certifications',
      type: 'array',
      of: [{type: 'string'}],
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Site Settings'}
    },
  },
})
