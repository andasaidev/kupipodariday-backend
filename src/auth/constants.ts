export const jwtConstants = {
  secret: process.env.JWT_SECRET || 'qoqoqoeo',
  expiresIn: process.env.JWT_EXPIRES_IN || '24h',
};
