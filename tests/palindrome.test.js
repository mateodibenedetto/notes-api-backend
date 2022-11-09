const { palindrome } = require('../utils/for_testing')

test('palindrome', () => {
  const result = palindrome('neuquen')

  expect(result).toBe('neuquen')
})

test('palindrome of empty string', () => {
  const result = palindrome('')

  expect(result).toBe('')
})

test('palindrome of undefined', () => {
  const result = palindrome(undefined)

  expect(result).toBeUndefined()
})
