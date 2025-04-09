const request = require('supertest');
const app = require('../../src/app');
const hash = require('../../src/hash');
const fs = require('fs').promises;
const path = require('path');

const supportedTypes = [
  { type: 'text/plain', data: 'Plain text data' },
  { type: 'application/json', data: JSON.stringify({ key: 'value' }) },
  { type: 'text/markdown', data: '# Markdown Header' },
  { type: 'text/html', data: '<h1>HTML</h1>' },
  { type: 'text/csv', data: 'name,age\nJohn,30\nJane,25' },
];

describe('POST /v1/fragments', () => {
  //let createdImageFragmentIdPng;

  const pngPath = path.join(__dirname, '../integration/table.png'); // Path to your test image

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

  // Authenticated users can create a image fragment
  test('authenticated users can create an image fragment', async () => {
    const pngBuffer = await fs.readFile(pngPath); // Read the PNG image buffer

    const pngRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'image/png')
      .send(pngBuffer); // Send the PNG buffer

    expect(pngRes.statusCode).toBe(201); // Expect successful creation (201 status)
    //const pngBody = JSON.parse(pngRes.text); // Parse the response body
    //createdImageFragmentIdPng = pngBody.fragment.id; // Store the fragment ID
  });

  test.each(supportedTypes)('accepts supported content type: %s', async ({ type, data }) => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', type)
      .send(Buffer.from(data));

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment).toBeDefined();
    expect(res.body.fragment.type).toBe(type);
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
    const apiUrl = process.env.API_URL || 'localhost:8080';
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .set('Host', apiUrl)
      .send(Buffer.from('test data'));
    expect(res.header.location).toBe(`http://${apiUrl}/v1/fragments/${res.body.fragment.id}`);
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
