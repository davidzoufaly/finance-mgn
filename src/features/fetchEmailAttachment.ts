import fs from 'node:fs';
import {
  attachmentFileName,
  attachmentFilePath,
  emailImapPort,
  emailImapServer,
  emailPassword,
  emailTransactionsTarget,
  emailUsername,
} from '@constants';
import type { ImapSimple, ImapSimpleOptions } from 'imap-simple';
import imapSimple from 'imap-simple';

const { connect, getParts } = imapSimple;

/**
 * Validates that all mandatory email credentials are set.
 *
 * @throws An error if any of the required email credentials are missing.
 */
export const validateEmailCredentials = () => {
  if (!emailUsername || !emailImapServer || !emailPassword || !emailTransactionsTarget || !emailImapPort) {
    throw new Error(
      '❌  Mandatory email credentials are not set (username, password, imap server, transactions target email address and imap port). Set them in .env file or environment secrets.',
    );
  }
};

/**
 * Connects to the IMAP server using the provided email credentials.
 *
 * @returns A promise that resolves to an IMAP connection object.
 * @throws An error if the connection fails.
 */
export const connectToImapServer = async (): Promise<ImapSimple> => {
  const config: ImapSimpleOptions = {
    imap: {
      user: emailUsername || '',
      password: emailPassword || '',
      host: emailImapServer,
      port: Number(emailImapPort),
      tls: true,
      authTimeout: 30000,
    },
  };

  console.log('🔌  Connecting to IMAP server...');
  const connection = await connect(config);
  console.log('💡  Connected to IMAP server.');
  return connection;
};

/**
 * Opens the INBOX folder on the IMAP server.
 *
 * @param connection - The IMAP connection object.
 * @returns A promise that resolves when the INBOX is opened.
 * @throws An error if the INBOX cannot be opened.
 */
export const openInbox = async (connection: ImapSimple) => {
  console.log('📩  Opening INBOX...');
  await connection.openBox('INBOX');
  console.log('📩  INBOX opened');
};

/**
 * Fetches emails from the IMAP server based on the provided search criteria.
 *
 * @param connection - The IMAP connection object.
 * @param searchCriteria - The search criteria for fetching emails.
 * @returns A promise that resolves to an array of fetched emails.
 * @throws An error if fetching emails fails.
 */
export const fetchEmails = async (
  connection: ImapSimple,
  searchCriteria: (string | (string | undefined)[])[],
) => {
  const fetchOptions = { bodies: [], struct: true };
  console.log('🔍  Fetching emails...');
  return await connection.search(searchCriteria, fetchOptions);
};

/**
 * Disconnects from the IMAP server.
 *
 * @param connection - The IMAP connection object.
 */
export const disconnectFromImapServer = (connection: ImapSimple) => {
  console.log('🔌  Disconnecting from IMAP server...');
  connection.end();
  console.log('🚪  IMAP connection closed.');
};

/**
 * Fetches email attachments from the IMAP server that match a specific keyword.
 *
 * @param keywordForAttachmentCheck - The keyword to check in attachment filenames e.g. last month
 * @throws An error if fetching attachments fails.
 */
export const fetchEmailAttachment = async (keywordForAttachmentCheck: string) => {
  validateEmailCredentials();

  let connection: ImapSimple | undefined;

  try {
    connection = await connectToImapServer();
    await openInbox(connection);

    const searchCriteria = [['FROM', emailTransactionsTarget]];
    const messages = await fetchEmails(connection, searchCriteria);
    console.log(`📥  Fetched ${messages.length} emails`);

    for (const message of messages) {
      const parts = getParts(message.attributes.struct ?? []);
      const part = parts.find(
        (part) => part.disposition && part.disposition.type.toUpperCase() === 'ATTACHMENT',
      );

      if (part) {
        const filename = part.disposition.params.filename;

        if (!filename.includes(keywordForAttachmentCheck)) {
          console.log(`⏩  Skipping attachment: ${filename} (does not match specified month date range)`);
          continue;
        }

        console.log(`😎  Downloading attachment: ${filename}`);
        const partData = await connection.getPartData(message, part);
        const attachment = {
          filename,
          data: partData,
        };

        console.log(`💾  Saving attachment: ${filename} as ${attachmentFileName}`);
        fs.writeFileSync(attachmentFilePath, attachment.data);
      } else {
        console.log('🚫  No attachment found in email');
      }
    }
  } catch (error) {
    throw new Error(`❌  Error fetching attachments: ${error.message}`, {
      cause: error,
    });
  } finally {
    if (connection) {
      disconnectFromImapServer(connection);
    }
  }
};
