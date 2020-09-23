const path = require('path')
const fs = require('fs')
const isEmail = require('is-email')
const isURL = require('is-url')
const states = require('datasets-us-states-names').map(name => name.toLowerCase())
const parse = require('csv-parse/lib/sync')
const input = fs.readFileSync(path.join(__dirname, 'coopdirectory.csv'))

function inferType(input) {
  input = input.toLowerCase().trim()

  // US State
  if (states.includes(input)) return 'state'

  // Website
  if (
    isURL(input) || 
    input.includes('www.') || 
    input.endsWith('.com') || 
    input.endsWith('.org') ||
    input.endsWith('.coop')
  ) return 'website'
  
  // Email
  if (isEmail(input)) return 'email'

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

  // Empties
  if (input.length === 0) return null
  if (input ===  'none') return null

  // "Australia",
  // "Alfalfa House Food Co-op",
  // "Byron Bay Harvest",
  // "Jura Books Food Co-op",
  // "Canada",
  // "Living Organics Buying Club",
  // "Karma Co-op",
  // "Northern Ireland",
  // "Riverside",
  // "Circular Road",
  // "United Kingdom"

  // Must be a coop name!
  return 'name'
}

const records = parse(input, { columns: true, skip_empty_lines: true })
  .map(record => {
    const content = record.content.trim()
    const type = inferType(content)
    return { content, type }
  })

console.log(
  JSON.stringify(
    records.filter(record => record.type === 'name').map(record => record.content),
    null,
    2
  )
) 
