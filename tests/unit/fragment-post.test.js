const request = require('supertest');
const app = require('../../src/app');
const hash = require('../../src/hash');

describe('POST /v1/fragments', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () =>
    request(app).post('/v1/fragments').send(Buffer.from('test data')).expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app)
      .post('/v1/fragments')
      .auth('invalid@email.com', 'incorrect_password')
      .send(Buffer.from('test data'))
      .expect(401));

  // Authenticated requests with valid data should create a new fragment
  test('authenticated users can create a plain text fragment', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send(Buffer.from('test data'));
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment).toBeDefined();
  });

  test('response includes all necessary properties', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send(Buffer.from('test data'));
    // all properties are present and expected values
    expect(res.body.fragment.id).toBeDefined();
    expect(res.body.fragment.created).toBeDefined();
    expect(res.body.fragment.updated).toBeDefined();
    expect(res.body.fragment.size).toBe(9);
    expect(res.body.fragment.type).toBe('text/plain');
    expect(res.body.fragment.ownerId).toBe(hash('user1@email.com'));
  });

  test('response includes a location header with full url', async () => {
    const apiUrl = process.env.API_URL || 'http://localhost:8080';
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .set('Host', apiUrl)
      .send(Buffer.from('test data'));
    expect(res.header.location).toBe(`${apiUrl}/v1/fragments/${res.body.fragment.id}`);
  });

  // Requests with unsupported media types should return a 415 status
  test('unsupported media types are rejected', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'application/unsupported')
      .send(Buffer.from('test data'));
    expect(res.statusCode).toBe(415);
  });
});
