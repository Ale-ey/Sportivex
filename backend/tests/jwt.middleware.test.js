import { jest } from '@jest/globals';

describe('JWT Middleware', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.JWT_SECRET = 'test_secret_key_which_is_long_enough';
  });

  test('skips validation for public paths', async () => {
    const { default: jwtValidator } = await import('../src/middlewares/jwt_validator.js');

    const req = { method: 'GET', path: '/health', headers: {} };
    const res = {};
    const next = jest.fn();

    await jwtValidator(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test('returns 401 when token is missing', async () => {
    const { default: jwtValidator } = await import('../src/middlewares/jwt_validator.js');

    const req = { method: 'GET', path: '/api/secure', headers: {} };
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const res = { status };
    const next = jest.fn();

    await jwtValidator(req, res, next);
    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    expect(next).not.toHaveBeenCalled();
  });

  test('calls next when token is valid and user exists', async () => {
    // Mock supabase module before importing middleware
    const mockSingle = jest.fn(async () => ({
      data: {
        id: 'user-1',
        email: 'user@nust.edu.pk',
        role: 'student',
        cms_id: 123456,
        name: 'Test User',
        email_confirmed: true
      },
      error: null
    }));

    const mockEq = jest.fn(() => ({ single: mockSingle }));
    const mockSelect = jest.fn(() => ({ eq: mockEq }));
    const mockFrom = jest.fn(() => ({ select: mockSelect }));

    jest.unstable_mockModule('../src/config/supabase.js', () => ({
      supabase: { from: mockFrom }
    }));

    const { generateToken } = await import('../src/config/auth.js');
    const token = generateToken({
      id: 'user-1',
      email: 'user@nust.edu.pk',
      role: 'student',
      cms_id: 123456
    });

    const { default: jwtValidator } = await import('../src/middlewares/jwt_validator.js');

    const req = {
      method: 'GET',
      path: '/api/secure',
      headers: { authorization: `Bearer ${token}` }
    };
    const res = { status: jest.fn(() => ({ json: jest.fn() })) };
    const next = jest.fn();

    await jwtValidator(req, res, next);
    expect(mockFrom).toHaveBeenCalledWith('users_metadata');
    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user.email).toBe('user@nust.edu.pk');
  });
});


