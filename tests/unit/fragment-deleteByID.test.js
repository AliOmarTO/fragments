const request = require('supertest');

const app = require('../../src/app');

describe('GET /v1/fragments/:id ', () => {
  let createdFragmentId;

  test('unauthenticated requests are denied', () =>
    request(app).delete('/v1/fragments/1234').expect(401));

  test('Non-existant fragment throws 404 error', async () => {
    const res = await request(app).get('/v1/fragments/1234').auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(404);
  });

  // Test: Upload an image
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

  // Test: Deleting the uploaded image fragment
  test('should delete text fragment by ID', async () => {
    // Send DELETE request for the uploaded image fragment
    const res = await request(app)
      .delete(`/v1/fragments/${createdFragmentId}`) // Make sure this matches your delete endpoint
      .auth('user1@email.com', 'password1'); // Authentication (optional)

    // Check the response status to be 200 (or 204 if no content returned after deletion)
    expect(res.statusCode).toBe(200); // or expect(res.statusCode).toBe(204); depending on your API design

    // Now, check if the fragment is indeed deleted by attempting to fetch it again
    const fetchRes = await request(app)
      .get(`/v1/fragments/${createdFragmentId}`) // Fetch by fragment ID
      .auth('user1@email.com', 'password1'); // Authentication (optional)

    // Expect a 404 (Not Found) because the fragment should no longer exist
    expect(fetchRes.statusCode).toBe(404);
  });
});
