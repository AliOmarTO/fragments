const request = require('supertest');

const app = require('../../src/app');

describe('UPDATE /v1/fragments/:id ', () => {
  let createdFragmentId;
  test('unauthenticated requests are denied', () =>
    request(app).delete('/v1/fragments/1234').expect(401));

  test('Non-existant fragment throws 404 error', async () => {
    const res = await request(app).get('/v1/fragments/1234').auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(404);
  });

  // Test: Upload a fragment
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

    createdFragmentId = res.body.fragment.id; // Store the created fragment ID
  });

  // Test: UPdating the uploaded fragment
  test('updating by different content type returns 400 error', async () => {
    // Send PUT request for the uploaded image fragment
    const res = await request(app)
      .put(`/v1/fragments/${createdFragmentId}`) // Make sure this matches your delete endpoint
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/html')
      .send(Buffer.from('updated test data')); // Send updated data

    expect(res.statusCode).toBe(400);
  });

  // Test: Updating the uploaded fragment
  test('update text fragment by ID', async () => {
    // Send PUT request for the uploaded image fragment
    const res = await request(app)
      .put(`/v1/fragments/${createdFragmentId}`) // Make sure this matches your delete endpoint
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send(Buffer.from('updated test data')); // Send updated data

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment).toBeDefined();
  });
});
