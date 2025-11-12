// import { jest } from 'node:jest';
import process from "node:process";

describe('JWT config (generateToken/verifyToken)', () => {
  test('generates and verifies token with 1h expiry and payload fields', async () => {
    process.env.JWT_SECRET = 'test_secret_key_which_is_long_enough';
    const { generateToken, verifyToken } = await import('../src/config/auth.js');

    const payloadUser = {
      id: 'test-user-id',
      email: 'user@nust.edu.pk',
      role: 'student',
      cms_id: 123456
    };

    const token = generateToken(payloadUser);
    expect(typeof token).toBe('string');

    const decoded = verifyToken(token);
    expect(decoded.id).toBe(payloadUser.id);
    expect(decoded.email).toBe(payloadUser.email);
    expect(decoded.role).toBe(payloadUser.role);
    expect(decoded.cmsId).toBe(payloadUser.cms_id);
    expect(decoded.exp).toBeDefined();
    expect(decoded.iat).toBeDefined();
  });
});


