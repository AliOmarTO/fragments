const request = require('supertest');

const app = require('../../src/app');

let fragmentID;

describe('GET /v1/fragments/:id ', () => {
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

    const resGet = await request(app)
      .get(`/v1/fragments/${fragmentID}`)
      .auth('user1@email.com', 'password1')
      .expect('Content-Type', 'text/plain; charset=utf-8')
      .expect(200);
  });

  test('response includes correct Content-Type header', async () => {
    const resGet = await request(app)
      .get(`/v1/fragments/${fragmentID}`)
      .auth('user1@email.com', 'password1')
      .expect('Content-Type', 'text/plain; charset=utf-8')
      .expect(200);
  });
});
