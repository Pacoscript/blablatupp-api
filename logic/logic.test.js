const logic = require('../logic')
const mongoose = require('mongoose')
const databaseName = 'test'
const User = require('../database/models/User')
const Workcenter = require('../database/models/Workcenter')

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

describe('Authenticate an user', () => {
  beforeEach(async () => {
    await logic.registerUser({
      name: 'testName',
      username: 'testUsername',
      password: '123',
    })
  })
  afterEach(async () => {
    await User.deleteMany()
  })
  it('should return userId if username and password are correct', async () => {
    const response = await logic.authenticateUser('testUsername', '123')
    let user = await User.findOne({ username: 'testUsername' })
    console.log(response)
    expect(response).toBe(user.id)
  })
  it('should fail if username or password are incorrect', async () => {
    try {
      await logic.authenticateUser('testUsername', '1234')
    } catch (error) {
      expect(error).toBeInstanceOf(AuthError)
      expect(error.message).toBe('invalid username or password')
    }
  })
  it('should fail if username is not a string', async () => {
    try {
      await logic.authenticateUser(null, '123')
    } catch (error) {
      expect(error).toBeInstanceOf(TypeError)
      expect(error.message).toBe('null is not a string')
    }
  })
  it('should fail if password is not a string', async () => {
    try {
      await logic.authenticateUser('testUsername', 123)
    } catch (error) {
      expect(error).toBeInstanceOf(TypeError)
      expect(error.message).toBe('123 is not a string')
    }
  })
})

describe('CreateWorkCenter', () => {
  afterEach(async () => {
    await Workcenter.deleteMany()
  })
  it('should create a new workcenter if parameters are correct', async () => {
    const response = await logic.createWorkcenter({
      name: 'testWorkcenter',
      address: 'testAddress',
      city: 'testCity',
    })
    expect(response).toBeUndefined
    let workcenter = await Workcenter.findOne({ name: 'testWorkcenter' })
    expect(workcenter).toBeDefined()
    expect(workcenter.name).toBe('testWorkcenter')
  })
  it('should throw an AlreadyExist error if the workCenter name is repeated', async () => {
    await logic.createWorkcenter({
      name: 'testWorkcenter',
      address: 'testAddress',
      city: 'testCity',
    })
    try {
      await logic.createWorkcenter({
        name: 'testWorkcenter',
        address: 'testAddress',
        city: 'testCity',
      })
    } catch (error) {
      expect(error).toBeInstanceOf(AlreadyExistsError)
    }
  })
  it('should fail if the name is not a string', async () => {
    try {
      await logic.createWorkcenter({
        name: 0,
        address: 'testAddress',
        city: 'testCity',
      })
    } catch (error) {
      expect(error).toBeInstanceOf(TypeError)
    }
  })
  it('should fail if the address is not a string', async () => {
    try {
      await logic.createWorkcenter({
        name: 'testWorkcenter',
        address: undefined,
        city: 'testCity',
      })
    } catch (error) {
      expect(error).toBeInstanceOf(TypeError)
    }
  })
  it('should fail if the city is not a string', async () => {
    try {
      await logic.createWorkcenter({
        name: 'testWorkcenter',
        address: 'testAddress',
        city: 123,
      })
    } catch (error) {
      expect(error).toBeInstanceOf(TypeError)
    }
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})
