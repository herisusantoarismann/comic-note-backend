export const UserSchema = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    name: { type: 'string' },
    email: { type: 'string' },
    profilePic: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        url: { type: 'string' },
      },
    },
  },
};

export const UserListSchema = {
  type: 'array',
  items: UserSchema,
};
