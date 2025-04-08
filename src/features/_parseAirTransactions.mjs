import fs from 'node:fs'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { airAttachmentPassword, attachmentFilePath } from '../constants/_constants.mjs'

const findTransactions = (documentItems) => {
  console.log(documentItems, 'items')
  const preUselessWord = documentItems.findIndex((item) => item.str === 'Poplatky')
  const postUselessWord =
    documentItems.findIndex((item) => item.str.includes('Pokračování') || item.str === 'Vklad') - 1

  if (preUselessWord === -1 || postUselessWord === -1) {
    return []
  }

  return documentItems.slice(preUselessWord + 1, postUselessWord)
}

const processTransactions = (transactions) => {
  // console.log("transactions: ", transactions);
  return transactions.map((row) => {
    // Identify the value (last item)
    // Remove spaces to parse it to float properly
    const value = row[row.length - 1].replace(/\s/g, '')

    // Identify the second date (first valid date after the first empty or non-date entry)
    const dates = row.filter((item) => /^\d{2}\.\d{2}\.\d{4}$/.test(item)) // Extract valid dates
    const secondDate = dates.length > 1 ? dates[1] : dates[0] // Pick the second date, fallback to the first if needed

    // Remove first date and value from the merged string
    const filteredItems = row.filter((item) => item !== dates[0] && item !== secondDate && item !== value)

    return {
      trailingSpace: ' ',
      value: Number.parseFloat(value),
      date: secondDate,
      source: 'air',
      bankAccount: '',
      label: filteredItems.join(' '),
    }
  })
}

const splitByZeroZero = (pdfObjects) => {
  const rows = []
  let currentRow = []

  for (const obj of pdfObjects) {
    currentRow.push(obj)

    // Parse rows based on fee value which is always 0,00
    if (obj.str === '0,00') {
      rows.push(currentRow)
      currentRow = [] // Start a new row
    }
  }

  // Add any remaining items as the last row
  if (currentRow.length > 0) {
    rows.push(currentRow)
  }

  // Remove unsued items (last two -> blank space and transaction fee)
  const textLines = rows.map((itemArray) => itemArray.map((item) => item.str).slice(0, itemArray.length - 2))

  return textLines
}

const processPage = async (pageNum, doc) => {
  const page = await doc.getPage(pageNum)
  const content = await page.getTextContent()
  const rawTransactions = findTransactions(content.items)
  const groupLines = splitByZeroZero(rawTransactions)
  const processedTransactions = processTransactions(groupLines)
  // Release page resources.
  page.cleanup()
  return processedTransactions
}

export const parseAirTransactions = async () => {
  try {
    // Will be using promises to load document, pages and misc data instead of
    // callback.
    const loadingTask = getDocument({
      url: attachmentFilePath,
      password: airAttachmentPassword,
    })

    return await loadingTask.promise.then(async (doc) => {
      console.log('💨  Parsing AIR bank transactions...')

      const numPages = doc.numPages
      const finalTrans = []

      // Loading of the first page will wait on metadata and subsequent loadings
      // will wait on the previous pages.
      for (let i = 1; i <= numPages; i++) {
        const data = await processPage(i, doc)
        for (const item of data) {
          finalTrans.push(item)
        }
      }

      console.log(`💪  ${finalTrans.length} AIR bank transactions parsed`)

      fs.unlinkSync(attachmentFilePath)
      console.log('🗑️   Attachment successfully deleted')

      return finalTrans
    })
  } catch (error) {
    // This throws error if .pdf doesn't exist even when index.mjs is starting the execution, which is expected so ingoring that one
    if (error.name !== 'MissingPDFException') {
      throw new Error(`❌  Error while parsing AIR bank transactions: ${error.message}`, { cause: error })
    }
  }
}
