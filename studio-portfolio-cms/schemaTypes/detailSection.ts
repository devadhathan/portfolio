import {defineField, defineType} from 'sanity'

export const detailSection = defineType({
  name: 'detailSection',
  title: 'Detail Section',
  type: 'object',
  fields: [
    defineField({name: 'id', title: 'Section ID', type: 'string'}),
    defineField({name: 'title', title: 'Title', type: 'string'}),
    defineField({name: 'description', title: 'Description', type: 'text'}),
    defineField({name: 'image', title: 'Image path', type: 'string'}),
    defineField({name: 'video', title: 'Video path', type: 'string'}),
    defineField({name: 'prototypeGif', title: 'Prototype GIF path', type: 'string'}),
  ],
})
