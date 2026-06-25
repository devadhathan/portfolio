import {defineField, defineType} from 'sanity'

export const painPoint = defineType({
  name: 'painPoint',
  title: 'Pain Point',
  type: 'object',
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string'}),
    defineField({name: 'detail', title: 'Detail', type: 'text'}),
  ],
})
