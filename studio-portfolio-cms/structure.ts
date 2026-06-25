import {StructureBuilder} from 'sanity/structure'

const singletonListItem = (
  S: StructureBuilder,
  typeName: string,
  title: string,
  documentId: string,
) =>
  S.listItem()
    .title(title)
    .id(documentId)
    .child(S.document().schemaType(typeName).documentId(documentId))

export const structure = (S: StructureBuilder) =>
  S.list()
    .title('Content')
    .items([
      singletonListItem(S, 'siteSettings', 'Site Settings', 'siteSettings'),
      S.divider(),
      S.listItem()
        .title('Case Studies')
        .child(S.documentTypeList('project').title('Case Studies')),
      S.listItem()
        .title('Experience')
        .child(S.documentTypeList('experience').title('Experience')),
    ])
