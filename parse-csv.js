const path = require('path')
const fs = require('fs')
const isEmail = require('is-email')
const isURL = require('is-url')
const states = require('datasets-us-states-names').map(name => name.toLowerCase())
const parse = require('csv-parse/lib/sync')
const { last } = require('lodash')
const input = fs.readFileSync(path.join(__dirname, 'coopdirectory.csv'))

const randomPlacenames = [
  'Canada',
  'United Kingdom',
  'Northern Ireland',
  'Australia',
  'Riverside'
].map(place => place.toLowerCase())

function inferType(input) {
  input = input.toLowerCase().trim()

  // US State
  if (states.includes(input)) return 'state'

  // Placename
  if (randomPlacenames.includes(input)) return 'placename'

  // Email
  if (isEmail(input)) return 'email'

  // Website
  if (
    isURL(input) || 
    input.includes('www.') || 
    input.endsWith('.com') || 
    input.endsWith('.net') || 
    input.endsWith('.org') ||
    input.endsWith('.coop')
  ) return 'website'

  // Region? (has multiple lines)
  if (input.split('\n').length > 1) return 'region'

  // Phone
  if (input.startsWith('phone')) return 'phone'

  // Street Address (starts with a number)
  if (input.match(/^\d+/)) return 'streetAddress'
  if (input.includes('p. o. box')) return 'streetAddress'
  if (input.includes('p.o. box')) return 'streetAddress'
  if (input.includes('po box')) return 'streetAddress'
  if (input.includes('box ')) return 'streetAddress'
  if (input.includes('suite')) return 'streetAddress'
  if (input.includes('c/o')) return 'streetAddress'
  if (input.split(' ').includes('rd')) return 'streetAddress'
  if (input.split(' ').includes('rd.')) return 'streetAddress'
  if (input.split(' ').includes('dr')) return 'streetAddress'
  if (input.split(' ').includes('dr.')) return 'streetAddress'
  if (input.split(' ').includes('st')) return 'streetAddress'
  if (input.split(' ').includes('st.')) return 'streetAddress' 
  if (input.match(/\d+th/i)) return 'streetAddress' // 85th
  if (input.match(/\d+nd/i)) return 'streetAddress' // 92nd
  if (input.match(/\d+rd/i)) return 'streetAddress' // 23rd
  if (input.split(' ').some(word => word.match(/\d+/))) return 'streetAddress' // lonely number somewhere

  // Empties
  if (input.length === 0) return 'empty'
  if (input ===  'none') return 'empty'

  // Must be a coop name!
  return 'name'
}

const records = parse(input, { columns: true, skip_empty_lines: true })
  .map(record => {
    const content = record.content.trim()
    const type = inferType(content)
    return { content, type }
  })

const output = []

const unwantedTypes = ['state', 'placename', 'empty']
records
  .forEach((record) => {
    // start a new record
    if (record.type === 'name') output.push({})

    // clean up content
    if (record.type === 'phone') {
      record.content = record.content.replace(/phone: /i, '')
    }

    // add the current property to the record
    if (!unwantedTypes.includes(record.type)) {
      last(output)[record.type] = record.content
    }
  })

console.log(JSON.stringify(output, null, 2))

// console.log(
//   JSON.stringify(
//     records.filter(record => record.type === 'name').map(record => record.content).sort(),
//     // records,
//     null,
//     2
//   )
// ) 
