const request = require('supertest');
const app = require('./app');
const userModel = require('./models/userModel');

describe('API endpoints', () => {
  beforeEach(() => {
    userModel.reset();
  });

  describe('Auth', () => {
    test('POST /register creates a user', async () => {
      const res = await request(app)
        .post('/register')
        .send({ username: 'alice', password: 'password' });
      expect(res.status).toBe(201);
      expect(res.body.user).toMatchObject({ username: 'alice' });
    });

    test('POST /register rejects duplicate usernames', async () => {
      await request(app).post('/register').send({ username: 'alice', password: 'password' });
      const res = await request(app)
        .post('/register')
        .send({ username: 'alice', password: 'password' });
      expect(res.status).toBe(409);
    });

    test('POST /login authenticates user', async () => {
      await request(app).post('/register').send({ username: 'alice', password: 'password' });
      const res = await request(app)
        .post('/login')
        .send({ username: 'alice', password: 'password' });
      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
    });

    test('POST /login rejects invalid credentials', async () => {
      await request(app).post('/register').send({ username: 'alice', password: 'password' });
      const res = await request(app)
        .post('/login')
        .send({ username: 'alice', password: 'wrong' });
      expect(res.status).toBe(401);
    });
  });

  describe('Users', () => {
    async function getToken() {
      await request(app).post('/register').send({ username: 'alice', password: 'password' });
      const res = await request(app)
        .post('/login')
        .send({ username: 'alice', password: 'password' });
      return res.body.token;
    }

    test('GET /users requires auth', async () => {
      const res = await request(app).get('/users');
      expect(res.status).toBe(401);
    });

    test('GET /users returns users when authorized', async () => {
      const token = await getToken();
      const res = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.users).toHaveLength(1);
    });

    test('POST /users creates new user when authorized', async () => {
      const token = await getToken();
      const res = await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${token}`)
        .send({ username: 'bob', password: 'secret' });
      expect(res.status).toBe(201);
      expect(res.body.user).toMatchObject({ username: 'bob' });
    });

    test('PUT /users/:id updates user when authorized', async () => {
      const token = await getToken();
      const createRes = await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${token}`)
        .send({ username: 'bob', password: 'secret' });
      const userId = createRes.body.user.id;
      const res = await request(app)
        .put(`/users/${userId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ username: 'bobby' });
      expect(res.status).toBe(200);
      expect(res.body.user).toMatchObject({ id: userId, username: 'bobby' });
    });

    test('DELETE /users/:id deletes user when authorized', async () => {
      const token = await getToken();
      const createRes = await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${token}`)
        .send({ username: 'bob', password: 'secret' });
      const userId = createRes.body.user.id;
      const res = await request(app)
        .delete(`/users/${userId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    });
  });

  test('GET / renders users view', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('<!DOCTYPE html>');
  });

  test('GET /docs serves swagger ui', async () => {
    const res = await request(app).get('/docs/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Swagger UI');
  });
});
