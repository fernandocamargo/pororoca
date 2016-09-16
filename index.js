#!/usr/bin/env node --harmony
const fs = require('fs')
const request = require('request')
const Q = require('q')
const program = require('commander')
const promptly = require('promptly')
const twitter = require('twitter-text')
const mustache = require('mustache')
const package = require('./package.json')
const locale = require('./locale.json')

const helpers = {
  measure: twitter.getTweetLength.bind(twitter),
  log: console.log.bind(console),
  itself: (object) => object,
  execute: (params, callback) => callback(params),
  body: (response) => Q.when(response[0].body),
  filled: (object) => (object && !!String(object).trim()),
  sum: (amount, value) => (Number(amount) + Number(value)),
  converge: function (collection, object) {
    return (!!collection ? collection : object[this])
  },
  get: function (property) {
    return this[property]
  },
  split: function (object) {
    return object.toString().trim().split(this)
  },
  filter: function (collection) {
    return Q.when(collection.filter(this))
  },
  map: function (collection) {
    return Q.when(collection.map(this))
  },
  enumerate: function (item, index, collection) {
    const prefix = this.apply(this, Array.from(arguments))
    return `${prefix}${item}`
  },
  total: function (...numbers) {
    return Array.from(numbers).reduce(this, 0)
  },
  reduce: function (collection) {
    return collection.reduce(this, [])
  }
}

const defaults = {
  encoding: 'utf8',
  locale: locale,
  patterns: {
    breaks: /(\r?\n)/,
    words: /\s+/
  },
  output: {
    templates: {
      prefix: '{{current}}/{{total}}-) ',
      suffix: ' (...)'
    },
    limit: {
      tweet: 140
    },
    prefix: (item, index, collection) => {
      return `${(index + 1)}/${collection.length} `
    },
    suffix: (item, index, collection) => {
      return ` (...)`
    }
  },
  inputs: {
    publish: {
      prompter: promptly.confirm,
      coercion: (value) => (String(value).toLowerCase() === true.toString())
    },
    password: {
      prompter: promptly.password
    }
  },
  origins: {
    file: (resource) => Q.nfcall(fs.readFile, resource, defaults.encoding),
    remote: (resource) => Q.nfcall(request.get, resource).then(helpers.body),
    param: (resource) => Q.when(resource)
  }
}

const core = (function () {})
const methods = {
  get: {
    params: function (type, ...payload) {
      const raw = !!this.raw
      const translation = (defaults.locale.inputs[type] || '')
      const input = (defaults.inputs[type] || {})
      const coercion = (input.coercion || helpers.itself)
      const inline = program[type]
      const coerced = coercion(inline)
      const prompter = (input.prompter || promptly.prompt)
      const prompt = Q.nfbind(prompter.bind(promptly, translation, {}))
      const promptable = ((inline === undefined) && !raw)
      const promise = (promptable ? prompt() : Q.when(coerced))
      const values = Array.from(payload)
      const promises = (!values.length ? promise : values.concat(promise))
      return (raw ? coerced : promises)
    },
    lines: function (stack, line, index, lines) {
      const get = {
        params: this.get.params.bind({raw: true}),
        tweets: this.get.tweets.bind(this)
      }
      const sum = helpers.sum
      const measure = helpers.measure
      const templates = {
        prefix: (get.params('prefix') || defaults.output.templates.prefix),
        suffix: (get.params('suffix') || defaults.output.templates.suffix)
      }
      const stats = {
        current: (index + 1),
        total: lines.length
      }
      const prefix = mustache.render(templates.prefix, stats)
      const spaces = {
        prefix: prefix.length,
        line: measure(line)
      }
      const sizes = Object.keys(spaces).map(helpers.get.bind(spaces))
      const total = helpers.total.apply(sum, sizes)
      const exceed = (total > defaults.output.limit.tweet)
      const words = line.split(defaults.patterns.words)
      const tweets = words.reduce.bind(words, get.tweets, [])
      const item = (!exceed ? line : tweets().reverse())
      return stack.concat(item)
    },
    tweets: function (stack, word) {
      const sum = helpers.sum
      const measure = helpers.measure
      const line = (stack[0] || false)
      const spaces = {
        line: line.length,
        word: measure(word),
        space: 1,
      }
      const sizes = Object.keys(spaces).map(helpers.get.bind(spaces))
      const total = helpers.total.apply(sum, sizes)
      const fit = (line && (total <= defaults.output.limit.tweet))
      const base = (!fit ? word : [line, word].join(' '))
      const complement = (!fit ? stack : stack.slice(1))
      return [base].concat(complement)
    }
  },
  commands: {
    create: function () {
      const get = {
        resource: this.get.params.bind(this, 'resource')
      }
      const proceed = this.proceed.bind(this)
      return get.resource()
        .then(proceed)
        .catch(helpers.log)
        .done()
    }
  },
  proceed: function (resource) {
    const get = {
      origin: helpers.get.bind(defaults.origins)
    }
    const execute = helpers.execute.bind(this, resource)
    const promises = Object.keys(defaults.origins).map(get.origin).map(execute)
    const transform = this.transform.bind(this)
    return Q.allSettled(promises)
      .spread(transform)
      .catch(helpers.log)
      .done()
  },
  transform: function (...payload) {
    const get = {
      lines: this.get.lines.bind(this)
    }
    const split = {
      breaks: helpers.split.bind(defaults.patterns.breaks)
    }
    const separate = {
      breaks: Q.fbind(split.breaks),
      lines: Q.fbind(helpers.reduce.bind(get.lines))
    }
    const resources = Array.from(payload)
    const converge = helpers.converge.bind('value')
    const flatten = Q.fbind(resources.reduce.bind(resources, converge, ''))
    const clean = helpers.filter.bind(helpers.filled)
    const enumerate = helpers.enumerate.bind(defaults.output.prefix)
    const prefix = helpers.map.bind(enumerate)
    return flatten()
      .then(separate.breaks)
      .then(clean)
      .then(separate.lines)
      .then(prefix)
      .then(helpers.log)
      .catch(helpers.log)
      .done()
  }
}
const API = Object.assign(core, methods)

module.exports = program
  .version(package.version)
  .option('-u, --username <username>', defaults.locale.options.username)
  .option('-p, --password <password>', defaults.locale.options.password)
  .option('-r, --resource <resource>', defaults.locale.options.resource)
  .option('-P, --publish [boolean]', defaults.locale.options.publish)
  .option('-pr, --prefix <text>', defaults.locale.options.prefix)
  .option('-sf, --suffix <text>', defaults.locale.options.suffix)
  .command('create', defaults.locale.commands.create)
  .on('create', API.commands.create.bind(API))
  .parse(process.argv)
