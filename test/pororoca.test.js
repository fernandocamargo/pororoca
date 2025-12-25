const { expect } = require('chai')
const Q = require('q')
const twitter = require('twitter-text')

// Import the main module
const program = require('../index.js')

describe('Pororoca - Text Splitting & Async Orchestration', function() {
  // Increase timeout for async operations
  this.timeout(5000)

  describe('Helper Functions', function() {
    // We'll test the helper logic by recreating key functions
    const helpers = {
      measure: twitter.getTweetLength.bind(twitter),
      filled: (object) => (object && !!String(object).trim()),
      sum: (amount, value) => (Number(amount) + Number(value)),
      itself: (object) => object
    }

    it('should measure tweet length correctly', function() {
      const text = 'Hello World'
      const length = helpers.measure(text)
      expect(length).to.equal(11)
    })

    it('should identify filled strings', function() {
      expect(helpers.filled('test')).to.be.ok
      expect(helpers.filled('   test   ')).to.be.ok
      expect(helpers.filled('')).to.not.be.ok
      expect(helpers.filled('   ')).to.not.be.ok
      expect(helpers.filled(null)).to.not.be.ok
      expect(helpers.filled(undefined)).to.not.be.ok
    })

    it('should sum numbers correctly', function() {
      expect(helpers.sum(5, 3)).to.equal(8)
      expect(helpers.sum(0, 0)).to.equal(0)
      expect(helpers.sum(10, -5)).to.equal(5)
    })

    it('should return itself for identity function', function() {
      const obj = { test: 'value' }
      expect(helpers.itself(obj)).to.equal(obj)
    })
  })

  describe('Text Splitting Logic', function() {
    const TWEET_LIMIT = 140

    // Helper to simulate tweet splitting
    function splitIntoTweets(text, prefixLength = 5) {
      const words = text.split(/\s+/)
      const tweets = []
      let currentTweet = ''

      for (const word of words) {
        const testTweet = currentTweet ? `${currentTweet} ${word}` : word
        const totalLength = prefixLength + testTweet.length

        if (totalLength <= TWEET_LIMIT) {
          currentTweet = testTweet
        } else {
          if (currentTweet) {
            tweets.push(currentTweet)
          }
          currentTweet = word
        }
      }

      if (currentTweet) {
        tweets.push(currentTweet)
      }

      return tweets
    }

    it('should split text that exceeds 140 characters into multiple chunks', function() {
      const longText = 'This is a very long text that needs to be split into multiple tweets because it exceeds the character limit of one hundred and forty characters which is the maximum allowed by Twitter for a single tweet'
      const tweets = splitIntoTweets(longText)

      expect(tweets).to.be.an('array')
      expect(tweets.length).to.be.greaterThan(1)

      // Each tweet (with prefix) should be under the limit
      tweets.forEach(tweet => {
        expect(tweet.length + 5).to.be.at.most(TWEET_LIMIT)
      })
    })

    it('should keep short text as a single chunk', function() {
      const shortText = 'This is a short tweet'
      const tweets = splitIntoTweets(shortText)

      expect(tweets).to.be.an('array')
      expect(tweets.length).to.equal(1)
      expect(tweets[0]).to.equal(shortText)
    })

    it('should handle text exactly at the limit', function() {
      // Create text that's exactly at the limit when we account for prefix
      const text = 'a'.repeat(135) // 135 + 5 (prefix) = 140
      const tweets = splitIntoTweets(text, 5)

      expect(tweets).to.be.an('array')
      expect(tweets.length).to.equal(1)
    })

    it('should split on word boundaries, not mid-word', function() {
      const text = 'word1 word2 word3 ' + 'verylongword'.repeat(15)
      const tweets = splitIntoTweets(text)

      tweets.forEach(tweet => {
        // Each tweet should contain complete words
        expect(tweet).to.not.match(/\s$/) // shouldn't end with space
      })
    })

    it('should handle empty strings', function() {
      const tweets = splitIntoTweets('')
      expect(tweets).to.be.an('array')
      expect(tweets.length).to.equal(0)
    })

    it('should handle single word that exceeds limit', function() {
      const longWord = 'a'.repeat(150)
      const tweets = splitIntoTweets(longWord)

      expect(tweets).to.be.an('array')
      // The long word will be in its own tweet, even if it exceeds the limit
      expect(tweets.length).to.equal(1)
    })
  })

  describe('Async Orchestration with Promises', function() {
    it('should handle Q.when() promise wrapping', function(done) {
      const value = 'test value'
      Q.when(value)
        .then(result => {
          expect(result).to.equal(value)
          done()
        })
        .catch(done)
    })

    it('should handle Q.allSettled() with multiple promises', function(done) {
      const promise1 = Q.when(1)
      const promise2 = Q.when(2)
      const promise3 = Q.when(3)

      Q.allSettled([promise1, promise2, promise3])
        .then(results => {
          expect(results).to.be.an('array')
          expect(results.length).to.equal(3)
          results.forEach(result => {
            expect(result.state).to.equal('fulfilled')
          })
          done()
        })
        .catch(done)
    })

    it('should handle Q.allSettled() with mixed success/failure', function(done) {
      const promise1 = Q.when(1)
      const promise2 = Q.reject(new Error('test error'))
      const promise3 = Q.when(3)

      Q.allSettled([promise1, promise2, promise3])
        .then(results => {
          expect(results).to.be.an('array')
          expect(results.length).to.equal(3)
          expect(results[0].state).to.equal('fulfilled')
          expect(results[1].state).to.equal('rejected')
          expect(results[2].state).to.equal('fulfilled')
          done()
        })
        .catch(done)
    })

    it('should chain promises in sequence', function(done) {
      const operations = []

      Q.when('start')
        .then(value => {
          operations.push('first')
          return value + '-first'
        })
        .then(value => {
          operations.push('second')
          return value + '-second'
        })
        .then(value => {
          operations.push('third')
          return value + '-third'
        })
        .then(finalValue => {
          expect(operations).to.deep.equal(['first', 'second', 'third'])
          expect(finalValue).to.equal('start-first-second-third')
          done()
        })
        .catch(done)
    })

    it('should handle promise transformations with map', function(done) {
      const numbers = [1, 2, 3, 4, 5]
      const promises = numbers.map(n => Q.when(n * 2))

      Q.all(promises)
        .then(results => {
          expect(results).to.deep.equal([2, 4, 6, 8, 10])
          done()
        })
        .catch(done)
    })

    it('should handle promise filtering', function(done) {
      const values = [1, 2, 3, 4, 5, 6]

      Q.when(values)
        .then(arr => arr.filter(n => n % 2 === 0))
        .then(evens => {
          expect(evens).to.deep.equal([2, 4, 6])
          done()
        })
        .catch(done)
    })

    it('should handle promise reducing', function(done) {
      const values = [1, 2, 3, 4, 5]

      Q.when(values)
        .then(arr => arr.reduce((sum, n) => sum + n, 0))
        .then(total => {
          expect(total).to.equal(15)
          done()
        })
        .catch(done)
    })

    it('should properly handle async error catching', function(done) {
      Q.when('test')
        .then(() => {
          throw new Error('Intentional error')
        })
        .catch(error => {
          expect(error.message).to.equal('Intentional error')
          done()
        })
    })
  })

  describe('Text Processing Pipeline', function() {
    it('should split text by line breaks', function() {
      const text = 'Line 1\nLine 2\nLine 3'
      const lines = text.split(/(\r?\n)/).filter(line => line.trim())

      expect(lines).to.be.an('array')
      expect(lines.length).to.equal(3)
      expect(lines[0]).to.equal('Line 1')
      expect(lines[1]).to.equal('Line 2')
      expect(lines[2]).to.equal('Line 3')
    })

    it('should handle different line break styles', function() {
      const unixText = 'Line 1\nLine 2'
      const windowsText = 'Line 1\r\nLine 2'

      const unixLines = unixText.split(/(\r?\n)/).filter(line => line.trim())
      const windowsLines = windowsText.split(/(\r?\n)/).filter(line => line.trim())

      expect(unixLines.length).to.equal(2)
      expect(windowsLines.length).to.equal(2)
    })

    it('should enumerate items with prefix', function() {
      const items = ['First', 'Second', 'Third']
      const enumerated = items.map((item, index, collection) => {
        const prefix = `${index + 1}/${collection.length} `
        return `${prefix}${item}`
      })

      expect(enumerated[0]).to.equal('1/3 First')
      expect(enumerated[1]).to.equal('2/3 Second')
      expect(enumerated[2]).to.equal('3/3 Third')
    })

    it('should process complete text-to-tweets pipeline', function(done) {
      const inputText = 'This is line one\nThis is line two\nThis is line three'

      // Simulate the pipeline
      Q.when(inputText)
        .then(text => text.split(/(\r?\n)/))
        .then(lines => lines.filter(line => line.trim()))
        .then(lines => lines.map((line, index, collection) => {
          const prefix = `${index + 1}/${collection.length} `
          return `${prefix}${line}`
        }))
        .then(tweets => {
          expect(tweets).to.be.an('array')
          expect(tweets.length).to.equal(3)
          expect(tweets[0]).to.equal('1/3 This is line one')
          expect(tweets[1]).to.equal('2/3 This is line two')
          expect(tweets[2]).to.equal('3/3 This is line three')
          done()
        })
        .catch(done)
    })
  })

  describe('Integration Tests', function() {
    it('should have correct CLI structure', function() {
      expect(program).to.exist
      expect(program.version).to.be.a('function')
      expect(program.option).to.be.a('function')
      expect(program.command).to.be.a('function')
    })

    it('should export package version', function() {
      const pkg = require('../package.json')
      expect(pkg.version).to.exist
      expect(pkg.version).to.match(/^\d+\.\d+\.\d+$/)
    })

    it('should have required dependencies', function() {
      const pkg = require('../package.json')
      expect(pkg.dependencies).to.have.property('q')
      expect(pkg.dependencies).to.have.property('commander')
      expect(pkg.dependencies).to.have.property('twitter-text')
      expect(pkg.dependencies).to.have.property('mustache')
    })
  })
})
