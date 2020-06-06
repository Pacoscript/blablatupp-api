const logic = require('../logic')

describe('First test', () => {
  it('should sum', () => {
    expect(logic.sum(1, 2)).toBe(3)
  })
})

describe('Register an User', () => {
  it ('should fail if no data', async () => {
    // expect.assertions(1)
    try {
      await logic.registerUser({user: undefined, userName: undefined, password: undefined})
    } catch (e) {
      console.log(e.message)
      expect(e.message).toBe('undefined is not a string')
    }
  })
})
