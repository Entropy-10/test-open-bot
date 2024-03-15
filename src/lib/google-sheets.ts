import env from '@env'
import { auth, sheets } from '@googleapis/sheets'
import { JWT } from 'google-auth-library'
import { GoogleSpreadsheet } from 'google-spreadsheet'

export const sheetsClient = sheets({
	version: 'v4',
	auth: new auth.GoogleAuth({
		credentials: {
			client_email: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
			private_key: env.GOOGLE_PRIVATE_KEY
		},
		scopes: ['https://www.googleapis.com/auth/spreadsheets']
	})
})

const serviceAccount = new JWT({
	email: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
	key: env.GOOGLE_PRIVATE_KEY,
	scopes: ['https://www.googleapis.com/auth/spreadsheets']
})

/**
 * Gets the spreadsheet/document from google api.
 *
 * @param {string} id - The spreadsheet id to fetch.
 */
export async function getDocument(id: string) {
	const document = new GoogleSpreadsheet(id, serviceAccount)
	await document.loadInfo()
	return document
}
