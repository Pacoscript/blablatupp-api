const logic = require('../logic')
const mongoose = require('mongoose')
const databaseName = 'test'
const User = require('../database/models/User')

const {
  AlreadyExistsError,
  AuthError,
  NotAllowedError,
  NotFoundError,
} = require('../errors')

beforeAll(async () => {
  const url = `mongodb://127.0.0.1/${databaseName}`
  await mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
})

describe('Register a new user', () => {
  afterEach(async () => {
    await User.deleteMany()
  })
  it('should save a new user in the database', async () => {
    const response = await logic.registerUser({
      name: 'testName',
      username: 'testUsername',
      password: '123',
    })
    expect(response).toBeUndefined
    let user = await User.findOne({ username: 'testUsername' })
    expect(user).toBeDefined()
    expect(user.name).toBe('testName')
  })
  it('should fail if name is not a string', async () => {
    try {
      await logic.registerUser({
        name: 123,
        username: 'testName',
        password: '123',
      })
    } catch (e) {
      expect(e.message).toBe('123 is not a string')
      expect(e).toBeInstanceOf(TypeError)
    }
  })
  it('should fail if username is not a string', async () => {
    try {
      await logic.registerUser({
        name: 'testName',
        username: 123,
        password: '123',
      })
    } catch (e) {
      expect(e.message).toBe('123 is not a string')
      expect(e).toBeInstanceOf(TypeError)
    }
  })
  it('should fail if password is not a string', async () => {
    try {
      await logic.registerUser({
        name: 'testName',
        username: 'testUsername',
        password: 123,
      })
    } catch (e) {
      expect(e.message).toBe('123 is not a string')
      expect(e).toBeInstanceOf(TypeError)
    }
  })
  it('should fail if username already exists', async () => {
    await logic.registerUser({
      name: 'testName',
      username: 'testUsername',
      password: '123',
    })
    try {
      await logic.registerUser({
        name: 'testName',
        username: 'testUsername',
        password: '123',
      })
    } catch (e) {
      expect(e.message).toBe('username testUsername already registered')
      expect(e).toBeInstanceOf(AlreadyExistsError)
    }
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})
