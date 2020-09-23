const cheerio = require('cheerio')
const coops = require('./source-data.json')

const clean = coops.map(coop => {
  const name = coop.popup.split(' <div>')[0]
  const html = '<div>' + coop.popup.split(' <div>')[1]
  const $ = cheerio.load(html)
  const streetAddress = $('.street-address').text().trim()
  const locality = $('.locality').text().trim()
  const region = $('.region').text().trim()
  const postalCode = $('.postal-code').text().trim()
  delete coop.icon
  delete coop.cssClass
  delete coop.type
  delete coop.popup
  return {name, streetAddress, locality, region, postalCode, ...coop}
})

console.log(JSON.stringify(clean, null, 2))