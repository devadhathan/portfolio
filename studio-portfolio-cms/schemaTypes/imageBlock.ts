import {defineField, defineType} from 'sanity'

export const imageBlock = defineType({
  name: 'imageBlock',
  title: 'Image',
  type: 'object',
  fields: [
    defineField({name: 'src', title: 'Path or URL', type: 'string'}),
    defineField({name: 'alt', title: 'Alt text', type: 'string'}),
    defineField({name: 'caption', title: 'Caption', type: 'string'}),
    defineField({name: 'title', title: 'Title', type: 'string'}),
    defineField({name: 'description', title: 'Description', type: 'text'}),
  ],
})
