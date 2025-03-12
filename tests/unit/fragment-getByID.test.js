const request = require('supertest');

const app = require('../../src/app');

describe('GET /v1/fragments/:id ', () => {
  let fragmentID;

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
});
