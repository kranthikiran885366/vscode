import request from 'supertest'
import { app } from '../../server/src/app'
import User from '../../server/src/models/User'
import Project from '../../server/src/models/Project'
import mongoose from 'mongoose'

describe('Projects API Integration Tests', () => {
  let token: string
  let userId: string
  let projectId: string

  beforeAll(async () => {
    // Connect to test database
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zencode-test')
    }
  })

  afterAll(async () => {
    // Clean up and disconnect
    await User.deleteMany({})
    await Project.deleteMany({})
    await mongoose.disconnect()
  })

  beforeEach(async () => {
    // Create test user
    const user = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'TestPassword123!',
    })

    const saved = await user.save()
    userId = saved._id.toString()

    // Get auth token
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'TestPassword123!',
      })

    token = response.body.data.tokens.accessToken
  })

  describe('POST /api/projects', () => {
    it('should create a project', async () => {
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test Project',
          description: 'Test description',
          language: 'javascript',
        })

      expect(response.status).toBe(201)
      expect(response.body.data.project).toBeDefined()
      expect(response.body.data.project.name).toBe('Test Project')

      projectId = response.body.data.project._id
    })

    it('should return 400 for missing name', async () => {
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({
          description: 'Test description',
          language: 'javascript',
        })

      expect(response.status).toBe(400)
    })
  })

  describe('GET /api/projects', () => {
    it('should list projects', async () => {
      const response = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(Array.isArray(response.body.data.projects)).toBe(true)
    })
  })

  describe('GET /api/projects/:id', () => {
    it('should get a project', async () => {
      // Create a project first
      const createResponse = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Get Test Project',
          description: 'Test',
          language: 'typescript',
        })

      const id = createResponse.body.data.project._id

      const response = await request(app)
        .get(`/api/projects/${id}`)
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.data.project._id).toBe(id)
    })

    it('should return 404 for non-existent project', async () => {
      const fakeId = new mongoose.Types.ObjectId()

      const response = await request(app)
        .get(`/api/projects/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(404)
    })
  })

  describe('PUT /api/projects/:id', () => {
    it('should update a project', async () => {
      // Create a project first
      const createResponse = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Update Test Project',
          description: 'Original',
          language: 'python',
        })

      const id = createResponse.body.data.project._id

      const response = await request(app)
        .put(`/api/projects/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          description: 'Updated description',
        })

      expect(response.status).toBe(200)
      expect(response.body.data.project.description).toBe('Updated description')
    })
  })

  describe('DELETE /api/projects/:id', () => {
    it('should delete a project', async () => {
      // Create a project first
      const createResponse = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Delete Test Project',
          description: 'Test',
          language: 'go',
        })

      const id = createResponse.body.data.project._id

      const response = await request(app)
        .delete(`/api/projects/${id}`)
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(204)

      // Verify it's deleted
      const getResponse = await request(app)
        .get(`/api/projects/${id}`)
        .set('Authorization', `Bearer ${token}`)

      expect(getResponse.status).toBe(404)
    })
  })
})
