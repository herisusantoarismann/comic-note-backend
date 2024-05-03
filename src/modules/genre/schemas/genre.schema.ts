export const GenreSchema = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    name: { type: 'string' },
  },
};

export const GenreListSchema = {
  type: 'array',
  items: GenreSchema,
};
