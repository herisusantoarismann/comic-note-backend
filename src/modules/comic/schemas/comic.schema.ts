export const ComicSchema = {
  type: 'object',
  properties: {
    success: {
      type: 'boolean',
    },
    data: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'number',
          },
          title: {
            type: 'string',
          },
          genres: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                name: { type: 'string' },
              },
            },
          },
          chapter: {
            type: 'number',
          },
          day: {
            type: 'string',
          },
          cover: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              url: { type: 'string' },
            },
          },
        },
      },
    },
  },
};
