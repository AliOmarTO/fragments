const request = require('supertest');
const fs = require('fs').promises;
const path = require('path');
const app = require('../../src/app');
const sharp = require('sharp');

describe('GET /v1/fragments/:id ', () => {
  let fragmentID;
  let imageFragmentID;

  beforeAll(async () => {});

  test('unauthenticated requests are denied', () =>
    request(app).get('/v1/fragments/1234').expect(401));

  test('Non-existant fragment throws 404 error', async () => {
    const res = await request(app).get('/v1/fragments/1234').auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(404);
  });

  test('response returns correct fragment', async () => {
    const apiUrl = process.env.API_URL || 'http://localhost:8080';

    const resCreate = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .set('Host', apiUrl)
      .send(Buffer.from('test data'));
    expect(resCreate.statusCode).toBe(201);

    //get location header
    fragmentID = resCreate.header.location.split('/').pop();

    await request(app)
      .get(`/v1/fragments/${fragmentID}`)
      .auth('user1@email.com', 'password1')
      .expect('Content-Type', 'text/plain; charset=utf-8')
      .expect(200);
  });

  test('response includes correct Content-Type header', async () => {
    await request(app)
      .get(`/v1/fragments/${fragmentID}`)
      .auth('user1@email.com', 'password1')
      .expect('Content-Type', 'text/plain; charset=utf-8')
      .expect(200);
  });

  test('converts Markdown to HTML when requesting .html', async () => {
    const apiUrl = process.env.API_URL || 'http://localhost:8080';

    const resCreate = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/markdown')
      .set('Host', apiUrl)
      .send(Buffer.from('# test data'));
    expect(resCreate.statusCode).toBe(201);

    //get location header
    const mdFragmentID = resCreate.header.location.split('/').pop();

    const res = await request(app)
      .get(`/v1/fragments/${mdFragmentID}.html`)
      .auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(200);
    expect(res.type).toBe('text/html');
    expect(res.text).toContain('<h1>test data</h1>');
  });

  // test converting images
  test.each([
    ['webp', 'image/webp'],
    ['jpeg', 'image/jpeg'],
    ['avif', 'image/avif'],
    ['png', 'image/png'],
  ])('converts to .%s', async (ext, expectedType) => {
    const pngPath = path.join(__dirname, '../integration/table.png');
    const pngBuffer = await fs.readFile(pngPath);

    const imgCreate = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'image/png')
      .send(pngBuffer);

    expect(imgCreate.statusCode).toBe(201);
    imageFragmentID = imgCreate.header.location.split('/').pop();

    const res = await request(app)
      .get(`/v1/fragments/${imageFragmentID}.${ext}`)
      .auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe(expectedType);
    expect(res.body).toBeInstanceOf(Buffer);

    const metadata = await sharp(res.body).metadata();
    expect(metadata.format === ext || (ext === 'avif' && metadata.format === 'heif')).toBe(true);
  });
});

describe('Fragment Conversion API Tests', () => {
  const pngPath = path.join(__dirname, '../integration/table.png');
  const plainTextBuffer = Buffer.from('just some plain text');
  const mdBuffer = Buffer.from('# Hello Markdown');
  const htmlBuffer = Buffer.from('<p>Hello HTML</p>');
  const csvBuffer = Buffer.from('name,age\nAlice,30\nBob,25');
  const jsonBuffer = { hello: 'world' };
  const yamlBuffer = Buffer.from('hello: world');

  test('converts text/plain to .txt', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send(plainTextBuffer);

    expect(res.statusCode).toBe(201);

    const fragmentID = res.header.location.split('/').pop();

    const conversionRes = await request(app)
      .get(`/v1/fragments/${fragmentID}.txt`)
      .auth('user1@email.com', 'password1');
    expect(conversionRes.statusCode).toBe(200);
    expect(conversionRes.text).toBe('just some plain text');
  });

  test('converts text/markdown to .txt', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/markdown')
      .send(mdBuffer);

    expect(res.statusCode).toBe(201);

    const fragmentID = res.header.location.split('/').pop();

    const conversionRes = await request(app)
      .get(`/v1/fragments/${fragmentID}.txt`)
      .auth('user1@email.com', 'password1');
    expect(conversionRes.statusCode).toBe(200);
    expect(conversionRes.text).toContain('# Hello Markdown');
  });

  test('converts text/markdown to .html', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/markdown')
      .send(mdBuffer);

    expect(res.statusCode).toBe(201);

    const fragmentID = res.header.location.split('/').pop();

    const conversionRes = await request(app)
      .get(`/v1/fragments/${fragmentID}.html`)
      .auth('user1@email.com', 'password1');
    expect(conversionRes.statusCode).toBe(200);
    expect(conversionRes.headers['content-type']).toBe('text/html; charset=utf-8');
    expect(conversionRes.text).toContain('<h1>');
  });

  test('converts text/html to .txt', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/html')
      .send(htmlBuffer);

    expect(res.statusCode).toBe(201);

    const fragmentID = res.header.location.split('/').pop();

    const conversionRes = await request(app)
      .get(`/v1/fragments/${fragmentID}.txt`)
      .auth('user1@email.com', 'password1');
    expect(conversionRes.statusCode).toBe(200);
    expect(conversionRes.text).toBe('<p>Hello HTML</p>');
  });

  test('converts text/csv to .txt', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/csv')
      .send(csvBuffer);

    expect(res.statusCode).toBe(201);

    const fragmentID = res.header.location.split('/').pop();

    const conversionRes = await request(app)
      .get(`/v1/fragments/${fragmentID}.txt`)
      .auth('user1@email.com', 'password1');
    expect(conversionRes.statusCode).toBe(200);
    expect(conversionRes.text).toBe('name,age\nAlice,30\nBob,25');
  });

  test('converts text/csv to .json', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/csv')
      .send(csvBuffer);

    expect(res.statusCode).toBe(201);

    const fragmentID = res.header.location.split('/').pop();

    const conversionRes = await request(app)
      .get(`/v1/fragments/${fragmentID}.json`)
      .auth('user1@email.com', 'password1');
    expect(conversionRes.statusCode).toBe(200);
    expect(conversionRes.text).toBe(JSON.stringify('name,age\nAlice,30\nBob,25'));
  });

  test('converts application/json to .yaml', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'application/json')
      .send(jsonBuffer);

    expect(res.statusCode).toBe(201);

    const fragmentID = res.header.location.split('/').pop();

    const conversionRes = await request(app)
      .get(`/v1/fragments/${fragmentID}.yml`)
      .auth('user1@email.com', 'password1');
    expect(conversionRes.statusCode).toBe(200);

    expect(conversionRes.text).toBe('hello: world\n');
  });

  test('throws 415 error for unsupported conversion (application/yaml to .html)', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'application/yaml')
      .send(yamlBuffer);

    expect(res.statusCode).toBe(201);

    const fragmentID = res.header.location.split('/').pop();

    const conversionRes = await request(app)
      .get(`/v1/fragments/${fragmentID}.html`)
      .auth('user1@email.com', 'password1');
    expect(conversionRes.statusCode).toBe(415); // 415 Unsupported Media Type
  });

  test('throws error for nonexistant conversion', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'application/yaml')
      .send(yamlBuffer);

    expect(res.statusCode).toBe(201);

    const fragmentID = res.header.location.split('/').pop();

    const conversionRes = await request(app)
      .get(`/v1/fragments/${fragmentID}.error`)
      .auth('user1@email.com', 'password1');
    expect(conversionRes.statusCode).toBe(415); // 415 Unsupported Media Type
  });
});
