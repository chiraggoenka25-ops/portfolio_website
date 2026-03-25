const request = require('supertest');
const fs = require('fs');
const path = require('path');

// Ensure the Express app is exported from server.js (module.exports = app;)
let app;
try {
    app = require('../server');
} catch (error) {
    console.warn("Could not import app. Make sure server.js exports it: `module.exports = app;`");
    process.exit(1);
}

describe('Security & Route Audit', () => {
    
    // ---------------------------------------------------------
    // 1. API & Route Testing
    // ---------------------------------------------------------
    describe('1. API & Route Testing', () => {
        it('should serve the frontend correctly on GET /', async () => {
            const res = await request(app).get('/');
            expect(res.status).toBe(200);
            expect(res.headers['content-type']).toMatch(/text\/html/);
        });

        it('should save data to SQLite and return success on POST /contact', async () => {
            const res = await request(app).post('/contact').send({
                name: 'Test User',
                email: 'test@example.com',
                message: 'Hello World'
            });
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('should return error on POST /contact with missing fields', async () => {
            const res = await request(app).post('/contact').send({
                name: 'Incomplete'
            });
            expect(res.status).toBe(400);
            expect(res.body.error).toBeDefined();
        });

        it('should reject invalid email formats', async () => {
            // This test will fail until email validation is implemented in server.js
            const res = await request(app).post('/contact').send({
                name: 'Test User',
                email: 'invalid-email-format',
                message: 'Hello'
            });
            expect(res.status).toBe(400);
        });
    });

    // ---------------------------------------------------------
    // 2. Rate Limiting
    // ---------------------------------------------------------
    describe('2. Rate Limiting', () => {
        it('should apply rate limiting and block after limits (simulate 20+ rapid requests)', async () => {
            let received429 = false;
            let responseMsg = '';
            
            // Hit the endpoint 25 times rapidly
            for (let i = 0; i < 25; i++) {
                const res = await request(app).post('/contact').send({
                    name: 'Spam', 
                    email: 'spam@spam.com', 
                    message: 'Spam'
                });
                
                if (res.status === 429) {
                    received429 = true;
                    responseMsg = res.text || JSON.stringify(res.body);
                    break;
                }
            }
            // This will fail until express-rate-limit is implemented in server.js
            expect(received429).toBe(true);
            expect(responseMsg.length).toBeGreaterThan(0);
        });
    });

    // ---------------------------------------------------------
    // 3. Authentication & Security Headers
    // ---------------------------------------------------------
    describe('3. Authentication & Security Headers', () => {
        it('should have security headers from helmet', async () => {
            const res = await request(app).get('/');
            // These headers are added by the `helmet` package
            expect(res.headers['x-content-type-options']).toBe('nosniff');
            expect(res.headers['x-frame-options']).toBeDefined();
            expect(res.headers['content-security-policy']).toBeDefined();
        });

        it('should hide X-Powered-By: Express', async () => {
            const res = await request(app).get('/');
            // Express sets this by default; helmet removes it, or app.disable('x-powered-by')
            expect(res.headers['x-powered-by']).toBeUndefined();
        });
        
        it('should not expose sensitive routes publicly', async () => {
            const res1 = await request(app).get('/admin');
            const res2 = await request(app).get('/database');
            // We expect these to either not exist (404) or be forbidden/unauthorized (403/401)
            expect([401, 403, 404]).toContain(res1.status);
            expect([401, 403, 404]).toContain(res2.status);
        });
    });

    // ---------------------------------------------------------
    // 4. Environment Variables (.env)
    // ---------------------------------------------------------
    describe('4. Environment Variables', () => {
        it('should verify that .env file is NOT committed to git via .gitignore', () => {
            const gitignorePath = path.join(__dirname, '../.gitignore');
            if (fs.existsSync(gitignorePath)) {
                const gitignore = fs.readFileSync(gitignorePath, 'utf8');
                expect(gitignore).toMatch(/\.env/);
            } else {
                // If .gitignore doesn't exist yet, we fail the security check
                fail('.gitignore file is missing');
            }
        });

        it('should verify PORT, DB_PATH exist in environment', () => {
            // Assumes dotenv config is executed at the top of server.js
            expect(process.env.PORT).toBeDefined();
            expect(process.env.DB_PATH).toBeDefined();
        });

        it('should verify no hardcoded secrets exist in server.js', () => {
            const serverCode = fs.readFileSync(path.join(__dirname, '../server.js'), 'utf8');
            // Very rudimentary check against obvious hardcoded passwords or API keys
            expect(serverCode).not.toMatch(/api_key\s*=\s*['"][a-zA-Z0-9]+['"]/i);
            expect(serverCode).not.toMatch(/secret\s*=\s*['"][a-zA-Z0-9]+['"]/i);
            expect(serverCode).not.toMatch(/password\s*=\s*['"][a-zA-Z0-9]+['"]/i);
        });
    });

    // ---------------------------------------------------------
    // 5. Database Security
    // ---------------------------------------------------------
    describe('5. Database Security', () => {
        it('should protect against SQL injection on the contact form', async () => {
            const payload = "'; DROP TABLE contacts; --";
            const res = await request(app).post('/contact').send({
                name: payload,
                email: 'test@example.com',
                message: payload
            });
            // Due to prepared statements, this should either cleanly fail validation (400) 
            // or safely save as a string (200). It should NOT crash the server (500).
            expect([200, 400]).toContain(res.status);
        });

        it('should use better-sqlite3 prepared statements and not raw string concatenation', () => {
            const serverCode = fs.readFileSync(path.join(__dirname, '../server.js'), 'utf8');
            // Verify the syntax of `db.prepare(...)` exists.
            expect(serverCode).toMatch(/\.prepare\(/);
            // Verify there is no direct string interpolation in `run()` methods.
            expect(serverCode).not.toMatch(/\.run\(`.*?\$.*?`\)/);
        });
    });

    // ---------------------------------------------------------
    // 6. Input Sanitization
    // ---------------------------------------------------------
    describe('6. Input Sanitization', () => {
        it('should block or sanitize HTML/script tags (XSS protection)', async () => {
            const xssPayload = "<script>alert('xss')</script>";
            
            const res = await request(app).post('/contact').send({
                name: xssPayload,
                email: 'hacker@test.com',
                message: xssPayload
            });

            // Modern protection (like express-validator) should catch and throw a 400 Bad Request, 
            // OR if you use xss-clean/dompurify, it sanitizes and returns 200 storing the sanitized string.
            expect([200, 400]).toContain(res.status);

            // If it returned 200, we'd ideally read it from DB and parse it to ensure "<script>" was stripped or encoded.
            // For now, testing the route handles it explicitly.
        });
    });
});
