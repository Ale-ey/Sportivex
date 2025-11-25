import { jest } from '@jest/globals';

describe('authenticateToken middleware', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.JWT_SECRET = 'test_secret_key_which_is_long_enough';
  });

  test('returns 401 when token is missing', async () => {
    const mockFrom = jest.fn();

    jest.unstable_mockModule('../src/config/supabase.js', () => ({
      supabase: { from: mockFrom }
    }));

    const { authenticateToken } = await import('../src/middlewares/auth.js');

    const req = { headers: {} };
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const res = { status };
    const next = jest.fn();

    await authenticateToken(req, res, next);

    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    expect(next).not.toHaveBeenCalled();
    expect(mockFrom).not.toHaveBeenCalled();
  });

  test('returns 401 when user is not found', async () => {
    const mockSingle = jest.fn(async () => ({
      data: null,
      error: { message: 'User not found' }
    }));
    const mockEq = jest.fn(() => ({ single: mockSingle }));
    const mockSelect = jest.fn(() => ({ eq: mockEq }));
    const mockFrom = jest.fn(() => ({ select: mockSelect }));

    jest.unstable_mockModule('../src/config/supabase.js', () => ({
      supabase: { from: mockFrom }
    }));

    const { generateToken } = await import('../src/config/auth.js');
    const token = generateToken({
      id: 'missing-user',
      email: 'missing@nust.edu.pk',
      role: 'student',
      cms_id: 654321
    });

    const { authenticateToken } = await import('../src/middlewares/auth.js');

    const req = {
      headers: { authorization: `Bearer ${token}` }
    };
    const json = jest.fn();
    const res = { status: jest.fn(() => ({ json })) };
    const next = jest.fn();

    await authenticateToken(req, res, next);

    expect(mockFrom).toHaveBeenCalledWith('users_metadata');
    expect(res.status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    expect(next).not.toHaveBeenCalled();
  });

  test('attaches user to request when token is valid', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'user@nust.edu.pk',
      role: 'student',
      cms_id: 123456,
      name: 'Test User',
      email_confirmed: true
    };

    const mockSingle = jest.fn(async () => ({
      data: mockUser,
      error: null
    }));
    const mockEq = jest.fn(() => ({ single: mockSingle }));
    const mockSelect = jest.fn(() => ({ eq: mockEq }));
    const mockFrom = jest.fn(() => ({ select: mockSelect }));

    jest.unstable_mockModule('../src/config/supabase.js', () => ({
      supabase: { from: mockFrom }
    }));

    const { generateToken } = await import('../src/config/auth.js');
    const token = generateToken(mockUser);

    const { authenticateToken } = await import('../src/middlewares/auth.js');

    const req = {
      headers: { authorization: `Bearer ${token}` }
    };
    const res = { status: jest.fn(() => ({ json: jest.fn() })) };
    const next = jest.fn();

    await authenticateToken(req, res, next);

    expect(mockFrom).toHaveBeenCalledWith('users_metadata');
    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user.email).toBe(mockUser.email);
    expect(req.user.cmsId).toBe(mockUser.cms_id);
  });
});