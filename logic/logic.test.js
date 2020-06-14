const logic = require('../logic')
const mongoose = require('mongoose')
const databaseName = 'test'
const User = require('../database/models/User')
const Workcenter = require('../database/models/Workcenter')
const Ration = require('../database/models/Ration')

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

describe('createRation', () => {
  beforeEach(async () => {
    await logic.registerUser({
      name: 'testName',
      username: 'testUsername',
      password: '123',
    })
    await logic.createWorkcenter({
      name: 'testWorkcenter',
      address: 'testAddress',
      city: 'testCity',
    })
  })
  afterEach(async () => {
    await Ration.deleteMany()
    await User.deleteMany()
    await Workcenter.deleteMany()
  })
  it('should create a new ration if parameters are correct', async () => {
    const userId = await logic.authenticateUser('testUsername', '123')
    let workcenter = await Workcenter.findOne({ name: 'testWorkcenter' })
    await logic.assignWorkCenter(userId, workcenter.id)
    const response = await logic.createRation({
      name: 'test ration name',
      prize: 3,
      userId: userId,
      workCenterId: workcenter.id ,
      numberOfRations: 3
    })
    expect(response).toBeUndefined
    let ration = await Ration.findOne({ createdBy: userId })
    expect(ration).toBeDefined()
    expect(ration.name).toBe('test ration name')
  })
  it('should fail if we try to create a ration in other workCenter', async () => {
    const userId = await logic.authenticateUser('testUsername', '123')
    let workcenter = await Workcenter.findOne({ name: 'testWorkcenter' })
    await logic.assignWorkCenter(userId, workcenter.id)
    try {
      await logic.createRation({
        name: 'test ration name',
        prize: 3,
        userId: userId,
        workCenterId: workcenter.id + 1,
        numberOfRations: 3
      })
    } catch (error) {
      expect(error).toBeInstanceOf(NotAllowedError)
      expect(error.message).toBe('user can´t create a ration in other workcenter')
    }
  })
  it('should fail if we try to create more than five rations', async () => {
    const userId = await logic.authenticateUser('testUsername', '123')
    let workcenter = await Workcenter.findOne({ name: 'testWorkcenter' })
    await logic.assignWorkCenter(userId, workcenter.id)
    try {
      await logic.createRation({
        name: 'test ration name',
        prize: 3,
        userId: userId,
        workCenterId: workcenter.id,
        numberOfRations: 6
      })
    } catch (error) {
      expect(error).toBeInstanceOf(NotAllowedError)
      expect(error.message).toBe('you can´t create more than five rations')
    }
  })
  it('should fail if name is not a string', async () => {
    const userId = await logic.authenticateUser('testUsername', '123')
    let workcenter = await Workcenter.findOne({ name: 'testWorkcenter' })
    await logic.assignWorkCenter(userId, workcenter.id)
    try {
      await logic.createRation({
        name: {},
        prize: 3,
        userId: userId,
        workCenterId: workcenter.id,
        numberOfRations: 5
      })
    } catch (error) {
      expect(error).toBeInstanceOf(TypeError)
    }
  })
  it('should fail if prize is not a number', async () => {
    const userId = await logic.authenticateUser('testUsername', '123')
    let workcenter = await Workcenter.findOne({ name: 'testWorkcenter' })
    await logic.assignWorkCenter(userId, workcenter.id)
    try {
      await logic.createRation({
        name: 'test ration name',
        prize: '3',
        userId: userId,
        workCenterId: workcenter.id,
        numberOfRations: 5
      })
    } catch (error) {
      expect(error).toBeInstanceOf(TypeError)
    }
  })
  it('should fail if userId is not a string', async () => {
    const userId = await logic.authenticateUser('testUsername', '123')
    let workcenter = await Workcenter.findOne({ name: 'testWorkcenter' })
    await logic.assignWorkCenter(userId, workcenter.id)
    try {
      await logic.createRation({
        name: 'test ration name',
        prize: 3,
        userId:Number(userId),
        workCenterId: workcenter.id,
        numberOfRations: 5
      })
    } catch (error) {
      expect(error).toBeInstanceOf(TypeError)
    }
  })
  it('should fail if workcenter is not a string', async () => {
    const userId = await logic.authenticateUser('testUsername', '123')
    let workcenter = await Workcenter.findOne({ name: 'testWorkcenter' })
    await logic.assignWorkCenter(userId, workcenter.id)
    try {
      await logic.createRation({
        name: 'test ration name',
        prize: 3,
        userId: userId,
        workCenterId: Number(workcenter.id),
        numberOfRations: 5
      })
    } catch (error) {
      expect(error).toBeInstanceOf(TypeError)
    }
  })
  it('should fail if numberOfRations is not a string', async () => {
    const userId = await logic.authenticateUser('testUsername', '123')
    let workcenter = await Workcenter.findOne({ name: 'testWorkcenter' })
    await logic.assignWorkCenter(userId, workcenter.id)
    try {
      await logic.createRation({
        name: 'test ration name',
        prize: 3,
        userId: userId,
        workCenterId: workcenter.id,
        numberOfRations: null
      })
    } catch (error) {
      expect(error).toBeInstanceOf(TypeError)
    }
  })
})
describe('assign work center', () => {
  beforeEach(async () => {
    await logic.registerUser({
      name: 'testName',
      username: 'testUsername',
      password: '123',
    })
    await logic.createWorkcenter({
      name: 'testWorkcenter',
      address: 'testAddress',
      city: 'testCity',
    })
  })
  afterEach(async () => {
    await User.deleteMany()
    await Workcenter.deleteMany()
  })
  it('should assign a workCenter to an user if data is correct', async () => {
    const user = await User.findOne({ name: 'testName' })
    const workcenter = await Workcenter.findOne({ name: 'testWorkcenter' })
    await logic.assignWorkCenter(user.id, workcenter.id)
    const userAfterAssignation = await User.findOne({ name: 'testName' })
    const expectedWorkCenter = workcenter.id
    expect(userAfterAssignation.workCenter).toBe(expectedWorkCenter)
  })
  it('should fail if userid is not a string', async () => {
    try {
      await logic.assignWorkCenter(123, 'string')
    } catch (error) {
      expect(error).toBeInstanceOf(TypeError)
    }
  })
  it('should fail if workcenterId is not a string', async () => {
    try {
      await logic.assignWorkCenter('string', undefined)
    } catch (error) {
      expect(error).toBeInstanceOf(TypeError)
    }
  })
})
describe('assign ration', () => {
  beforeEach(async () => {
    await logic.registerUser({
      name: 'testName',
      username: 'testUsername',
      password: '123',
    })
    await logic.registerUser({
      name: 'testName2',
      username: 'testUsername2',
      password: '123',
    })
    await logic.createWorkcenter({
      name: 'testWorkcenter',
      address: 'testAddress',
      city: 'testCity',
    })
    const userId = await logic.authenticateUser('testUsername', '123')
    const user2Id = await logic.authenticateUser('testUsername2', '123')
    let workcenter = await Workcenter.findOne({ name: 'testWorkcenter' })
    await logic.assignWorkCenter(userId, workcenter.id)
    await logic.assignWorkCenter(user2Id, workcenter.id)
    const response = await logic.createRation({
      name: 'test ration name',
      prize: 3,
      userId: userId,
      workCenterId: workcenter.id ,
      numberOfRations: 3
    })
  })
  afterEach(async () => {
    await User.deleteMany()
    await Workcenter.deleteMany()
    await Ration.deleteMany()
  })
  it('should assign a ration to an user if data is correct', async () => {
    const user2 = await User.findOne({name: 'testName2'})
    const ration = await Ration.findOne({ name: 'test ration name' })
    await logic.assignRation(user2.id, ration.id)
    const user2AfterRationAssigned = await User.findOne({ name: 'testName2' })
    const expectedRations = [ration.id]
    expect(user2AfterRationAssigned.buyedRations[0]).toBe(expectedRations[0])
  })
  it('should fail if userId is not a string', async () => {
    try {
      await logic.assignRation(undefined, 'string')
    } catch (error) {
      expect(error).toBeInstanceOf(TypeError)
    }
  })
  it('should fail if rationId is not a string', async () => {
    try {
      await logic.assignRation('string', 123)
    } catch (error) {
      expect(error).toBeInstanceOf(TypeError)
    }
  })
  it('should throw an error if ration is sold', async () => {
    const user2 = await User.findOne({name: 'testName2'})
    const ration = await Ration.findOne({ name: 'test ration name' })
    await logic.assignRation(user2.id, ration.id)
    try {
      await logic.assignRation(user2.id, ration.id)
    } catch (error) {
      expect(error).toBeInstanceOf(AlreadyExistsError)
    }
  })
  it('the ration must be have sold parameter setted to true', async () => {
    const user2 = await User.findOne({name: 'testName2'})
    const ration = await Ration.findOne({ name: 'test ration name' })
    await logic.assignRation(user2.id, ration.id)
    const rationAfterAssignation = await Ration.findOne({ name: 'test ration name' })
    const expectedRationSold = true
    expect(rationAfterAssignation.sold).toBe(expectedRationSold)
  })
  it('the ration must save the id of the buyer', async () => {
    const user2 = await User.findOne({name: 'testName2'})
    const ration = await Ration.findOne({ name: 'test ration name' })
    await logic.assignRation(user2.id, ration.id)
    const rationAfterAssignation = await Ration.findOne({ name: 'test ration name' })
    const expectedBuyedBy = user2.id
    expect((rationAfterAssignation.buyedBy).toString()).toBe(expectedBuyedBy)
  })
})



afterAll(async () => {
  await mongoose.connection.close()
})
