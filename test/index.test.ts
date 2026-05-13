import { describe, it, expect } from 'vitest';

const BASE_URL = process.env.WORKER_URL || 'http://localhost:8787';
describe('API Endpoints', () => {
	// let commentId: number;
	// let worker: any;
	describe('Health Check', () => {
		it('should return health check message', async () => {
			const res = await fetch(BASE_URL);
			const data = await res.json();
			expect(res.status).toBe(200);
			expect(data.message).toBe('Express running on Cloudflare Workers!');
		});
	});

	describe('POST /mail', () => {
		it('should send email with valid data (Korean)', async () => {
			const res = await fetch(`${BASE_URL}/mail`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					to: 'ckd_qja@naver.com',
					number: '123456',
					language: 'ko'
				})
			});
			const data = await res.json();
			expect(res.status).toBe(200);
			expect(data.res).toBe('sending');
		});

		it('should send email with valid data (English)', async () => {
			const res = await fetch(`${BASE_URL}/mail`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					to: 'ckd_qja@naver.com',
					number: '123456',
					language: 'en'
				})
			});
			const data = await res.json();
			console.log(data)
			expect(res.status).toBe(200);
			expect(data.res).toBe('sending');
		});
	});

	// describe('GET /api/comments/:slug', () => {
	// 	it('should get comments for a slug', async () => {
	// 		const res = await fetch(`${BASE_URL}/api/comments/platform`);
	// 		const data = await res.json();
	// 		expect(res.status).toBe(200);
	// 		expect(data.success).toBe(true);
	// 		expect(Array.isArray(data.comments)).toBe(true);
	// 	});

	// 	it('should return empty array for non-existent slug', async () => {
	// 		const res = await fetch(`${BASE_URL}/api/comments/non-existent-slug`);
	// 		const data = await res.json();
	// 		expect(res.status).toBe(200);
	// 		expect(data.success).toBe(true);
	// 		expect(Array.isArray(data.comments)).toBe(true);
	// 		expect(data.comments.length).toBe(0);
	// 	});
	// });

	
	// describe('POST /api/comments/:slug', () => {
	// 	it('should create a new comment', async () => {
	// 		const res = await worker.fetch(
	// 			new Request('http://localhost:3000/api/comments/test-slug', {
	// 				method: 'POST',
	// 				headers: { 'Content-Type': 'application/json' },
	// 				body: JSON.stringify({
	// 					slug: 'test-slug',
	// 					author: 'Test Author',
	// 					content: 'This is a test comment',
	// 					password: 'test123'
	// 				})
	// 			})
	// 		);
	// 		const data = await res.json();
	// 		expect(res.status).toBe(201);
	// 		expect(data.success).toBe(true);
	// 		expect(data.id).toBeDefined();
	// 		commentId = data.id;
	// 	});

	// 	it('should reject comment without author', async () => {
	// 		const res = await worker.fetch(
	// 			new Request('http://localhost:3000/api/comments/test-slug', {
	// 				method: 'POST',
	// 				headers: { 'Content-Type': 'application/json' },
	// 				body: JSON.stringify({
	// 					slug: 'test-slug',
	// 					author: '',
	// 					content: 'This is a test comment',
	// 					password: 'test123'
	// 				})
	// 			})
	// 		);
	// 		const data = await res.json();
	// 		expect(res.status).toBe(400);
	// 		expect(data.success).toBe(false);
	// 	});

	// 	it('should reject comment with empty content', async () => {
	// 		const res = await worker.fetch(
	// 			new Request('http://localhost:3000/api/comments/test-slug', {
	// 				method: 'POST',
	// 				headers: { 'Content-Type': 'application/json' },
	// 				body: JSON.stringify({
	// 					slug: 'test-slug',
	// 					author: 'Test Author',
	// 					content: '',
	// 					password: 'test123'
	// 				})
	// 			})
	// 		);
	// 		const data = await res.json();
	// 		expect(res.status).toBe(400);
	// 		expect(data.success).toBe(false);
	// 	});
	// });

	// describe('GET /api/comments/:slug', () => {
	// 	it('should get comments for a slug', async () => {
	// 		const res = await fetch(`${BASE_URL}/api/comments/platform`);
	// 		const data = await res.json();
	// 		expect(res.status).toBe(200);
	// 		expect(data.success).toBe(true);
	// 		expect(Array.isArray(data.comments)).toBe(true);
	// 	});

	// 	it('should return empty array for non-existent slug', async () => {
	// 		const res = await fetch(`${BASE_URL}/api/comments/non-existent-slug`);
	// 		const data = await res.json();
	// 		expect(res.status).toBe(200);
	// 		expect(data.success).toBe(true);
	// 		expect(Array.isArray(data.comments)).toBe(true);
	// 		expect(data.comments.length).toBe(0);
	// 	});
	// });

	// describe('POST /api/comments/:commentId/verify-password', () => {
	// 	it('should verify correct password', async () => {
	// 		const res = await worker.fetch(
	// 			new Request(`http://localhost:3000/api/comments/${commentId}/verify-password`, {
	// 				method: 'POST',
	// 				headers: { 'Content-Type': 'application/json' },
	// 				body: JSON.stringify({
	// 					password: 'test123'
	// 				})
	// 			})
	// 		);
	// 		const data = await res.json();
	// 		expect(res.status).toBe(200);
	// 		expect(data.success).toBe(true);
	// 		expect(data.message).toBe('Password verified successfully');
	// 	});

	// 	it('should reject incorrect password', async () => {
	// 		const res = await worker.fetch(
	// 			new Request(`http://localhost:3000/api/comments/${commentId}/verify-password`, {
	// 				method: 'POST',
	// 				headers: { 'Content-Type': 'application/json' },
	// 				body: JSON.stringify({
	// 					password: 'wrongpassword'
	// 				})
	// 			})
	// 		);
	// 		const data = await res.json();
	// 		expect(res.status).toBe(401);
	// 		expect(data.success).toBe(false);
	// 	});

	// 	it('should return 404 for non-existent comment', async () => {
	// 		const res = await worker.fetch(
	// 			new Request('http://localhost:3000/api/comments/99999/verify-password', {
	// 				method: 'POST',
	// 				headers: { 'Content-Type': 'application/json' },
	// 				body: JSON.stringify({
	// 					password: 'test123'
	// 				})
	// 			})
	// 		);
	// 		const data = await res.json();
	// 		expect(res.status).toBe(404);
	// 		expect(data.success).toBe(false);
	// 	});
	// });

	// describe('PUT /api/comments/:slug', () => {
	// 	it('should update comment with correct password', async () => {
	// 		const res = await worker.fetch(
	// 			new Request('http://localhost:3000/api/comments/test-slug', {
	// 				method: 'PUT',
	// 				headers: { 'Content-Type': 'application/json' },
	// 				body: JSON.stringify({
	// 					id: commentId,
	// 					content: 'Updated test comment',
	// 					password: 'test123'
	// 				})
	// 			})
	// 		);
	// 		const data = await res.json();
	// 		expect(res.status).toBe(200);
	// 		expect(data.success).toBe(true);
	// 		expect(data.message).toBe('Comment updated successfully');
	// 	});

	// 	it('should reject update with wrong password', async () => {
	// 		const res = await worker.fetch(
	// 			new Request('http://localhost:3000/api/comments/test-slug', {
	// 				method: 'PUT',
	// 				headers: { 'Content-Type': 'application/json' },
	// 				body: JSON.stringify({
	// 					id: commentId,
	// 					content: 'Updated test comment',
	// 					password: 'wrongpassword'
	// 				})
	// 			})
	// 		);
	// 		const data = await res.json();
	// 		expect(res.status).toBe(401);
	// 		expect(data.success).toBe(false);
	// 	});

	// 	it('should reject update for non-existent comment', async () => {
	// 		const res = await worker.fetch(
	// 			new Request('http://localhost/api/comments/test-slug', {
	// 				method: 'PUT',
	// 				headers: { 'Content-Type': 'application/json' },
	// 				body: JSON.stringify({
	// 					id: 99999,
	// 					content: 'Updated test comment',
	// 					password: 'test123'
	// 				})
	// 			})
	// 		);
	// 		const data = await res.json();
	// 		expect(res.status).toBe(404);
	// 		expect(data.success).toBe(false);
	// 	});
	// });

	// describe('DELETE /api/comments/:id', () => {
	// 	it('should delete comment with correct password', async () => {
	// 		const res = await worker.fetch(
	// 			new Request(`http://localhost:3000/api/comments/${commentId}`, {
	// 				method: 'DELETE',
	// 				headers: { 'Content-Type': 'application/json' },
	// 				body: JSON.stringify({
	// 					id: commentId,
	// 					password: 'test123'
	// 				})
	// 			})
	// 		);
	// 		const data = await res.json();
	// 		expect(res.status).toBe(200);
	// 		expect(data.success).toBe(true);
	// 		expect(data.message).toBe('Comment deleted successfully');
	// 	});

	// 	it('should reject deletion with wrong password', async () => {
	// 		const createRes = await worker.fetch(
	// 			new Request('http://localhost:3000/api/comments/test-slug-2', {
	// 				method: 'POST',
	// 				headers: { 'Content-Type': 'application/json' },
	// 				body: JSON.stringify({
	// 					slug: 'test-slug-2',
	// 					author: 'Test Author 2',
	// 					content: 'This is another test comment',
	// 					password: 'test456'
	// 				})
	// 			})
	// 		);
	// 		const createData = await createRes.json();
	// 		const newCommentId = createData.id;

	// 		const res = await worker.fetch(
	// 			new Request(`http://localhost:3000/api/comments/${newCommentId}`, {
	// 				method: 'DELETE',
	// 				headers: { 'Content-Type': 'application/json' },
	// 				body: JSON.stringify({
	// 					id: newCommentId,
	// 					password: 'wrongpassword'
	// 				})
	// 			})
	// 		);
	// 		const data = await res.json();
	// 		expect(res.status).toBe(401);
	// 		expect(data.success).toBe(false);
	// 	});

	// 	it('should return 404 for deleting non-existent comment', async () => {
	// 		const res = await worker.fetch(
	// 			new Request('http://localhost:3000/api/comments/99999', {
	// 				method: 'DELETE',
	// 				headers: { 'Content-Type': 'application/json' },
	// 				body: JSON.stringify({
	// 					id: 99999,
	// 					password: 'test123'
	// 				})
	// 			})
	// 		);
	// 		const data = await res.json();
	// 		expect(res.status).toBe(404);
	// 		expect(data.success).toBe(false);
	// 	});
	// });
});
