const request = require('supertest');
const app = require('../../src/app');

describe('GET /v1/fragments/:id/info', () => {
  let fragmentId;

  beforeAll(async () => {
    // Create a fragment for testing
    const resCreate = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1') // Authenticate if necessary
      .set('Content-Type', 'text/plain')
      .send(Buffer.from('test data'));

    expect(resCreate.statusCode).toBe(201);
    fragmentId = resCreate.header.location.split('/').pop(); // Get the ID of the created fragment
  });

  it('should return metadata for the given fragment', async () => {
    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}/info`)
      .auth('user1@email.com', 'password1'); // Authenticate if necessary

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.fragment).toHaveProperty('id', fragmentId);
    expect(res.body.fragment).toHaveProperty('ownerId');
    expect(res.body.fragment).toHaveProperty('created');
    expect(res.body.fragment).toHaveProperty('updated');
    expect(res.body.fragment).toHaveProperty('type', 'text/plain'); // Based on the test data created
    expect(res.body.fragment).toHaveProperty('size', 9); // Size of 'test data'
  });

  it('should return 404 if fragment does not exist', async () => {
    const res = await request(app)
      .get('/v1/fragments/nonexistent-id/info')
      .auth('user1@email.com', 'password1'); // Authenticate if necessary

    expect(res.statusCode).toBe(404);
  });
});
