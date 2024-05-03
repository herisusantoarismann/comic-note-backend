export const LogSchema = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    message: { type: 'string' },
    stackTrace: { type: 'string' },
    timestamp: { type: 'string' },
  },
};

export const LogListSchema = {
  type: 'array',
  items: LogSchema,
};
