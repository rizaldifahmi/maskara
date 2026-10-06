import request from 'supertest';
import app from './index.js'; // Ensure correct extension for ESM imports if needed, or ts-jest will handle it.
describe('Health Check API', () => {
    it('should return { status: "ok" }', async () => {
        const res = await request(app).get('/api/health');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({ status: 'ok' });
    });
});
describe('No Registration API', () => {
    it('should not expose a registration endpoint', async () => {
        const res = await request(app).post('/api/register').send({
            username: 'test@example.com',
            password: 'password'
        });
        // Should be a 404 since it's not implemented, enforcing no-registration.
        expect(res.statusCode).toEqual(404);
    });
});
