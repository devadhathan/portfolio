import {defineField, defineType} from 'sanity'

export const exploration = defineType({
  name: 'exploration',
  title: 'Exploration',
  type: 'object',
  fields: [
    defineField({name: 'tag', title: 'Tag', type: 'string'}),
    defineField({name: 'title', title: 'Title', type: 'string'}),
    defineField({name: 'problem', title: 'Problem', type: 'text'}),
    defineField({name: 'solution', title: 'Solution', type: 'text'}),
    defineField({name: 'image', title: 'Image path', type: 'string'}),
  ],
})
