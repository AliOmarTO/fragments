const request = require('supertest');

const app = require('../../src/app');

describe('/ non existant route', () => {
  //if the route is non-existent, it should return a 404
  test('non-existent routes return 404', () => request(app).get('/not-real-route').expect(404));
});
