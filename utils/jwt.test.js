const { generateToken, verifyToken } = require('./jwt');

describe('JWT utility', () => {
  test('generates a valid token that verifies to the original payload', () => {
    const payload = { userId: 123, name: 'Alice' };
    const token = generateToken(payload);
    const result = verifyToken(token);
    expect(result).toEqual(payload);
  });

  test('returns null for tokens with an invalid structure', () => {
    expect(verifyToken('invalid.token')).toBeNull();
  });

  test('returns null when the token signature is tampered with', () => {
    const payload = { userId: 456 };
    const token = generateToken(payload);
    const parts = token.split('.');
    const tamperedPayload = Buffer.from(JSON.stringify({ userId: 789 })).toString('base64url');
    const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;
    expect(verifyToken(tamperedToken)).toBeNull();
  });
});
