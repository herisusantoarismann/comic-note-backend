export const NotificationSchema = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    title: { type: 'string' },
    body: { type: 'string' },
    read: { type: 'boolean' },
  },
};

export const NotificationListSchema = {
  type: 'array',
  items: NotificationSchema,
};
