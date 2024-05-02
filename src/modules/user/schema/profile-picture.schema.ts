export const ProfilePictureSchema = {
  type: 'object',
  properties: {
    id: {
      type: 'number',
    },
    name: {
      type: 'string',
    },
    type: {
      type: 'string',
      example: 'jpeg',
    },
    size: {
      type: 'number',
      example: 1024,
    },
    url: {
      type: 'string',
      example: 'example.com/uploads/image.png',
    },
  },
};
