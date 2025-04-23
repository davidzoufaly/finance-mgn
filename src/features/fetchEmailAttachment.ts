import fs from 'node:fs';
import {
  attachmentFileName,
  attachmentFilePath,
  emailHost,
  emailPassword,
  emailTarget,
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
  if (!emailUsername || !emailHost || !emailPassword || !emailTarget) {
    throw new Error(
      '❌  Mandatory email credentials are not set (username, password, host, target email). Set them in .env file',
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
      host: emailHost,
      port: 993,
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
 * @param keywordForAttachmentCheck - The keyword to check in attachment filenames.
 * @throws An error if fetching attachments fails.
 */
export const fetchEmailAttachment = async (keywordForAttachmentCheck: string) => {
  validateEmailCredentials();

  let connection: ImapSimple | undefined;

  try {
    connection = await connectToImapServer();
    await openInbox(connection);

    const searchCriteria = ['UNSEEN', ['FROM', emailTarget]];
    const messages = await fetchEmails(connection, searchCriteria);
    console.log(`📥  Fetched ${messages.length} emails`);

    for (const message of messages) {
      console.log('📧  Processing email...');
      const parts = getParts(message.attributes.struct ?? []);
      const part = parts.find(
        (part) => part.disposition && part.disposition.type.toUpperCase() === 'ATTACHMENT',
      );

      if (part) {
        const filename = part.disposition.params.filename;
        console.log(`📎  Found attachment: ${filename}`);

        if (!filename.includes(keywordForAttachmentCheck)) {
          console.log(`⏩  Skipping attachment: ${filename} (does not match last month date range)`);
          continue;
        }

        console.log(`⬇️   Downloading attachment: ${filename}`);
        const partData = await connection.getPartData(message, part);
        const attachment = {
          filename,
          data: partData,
        };

        console.log(`💾  Saving attachment: ${filename} as ${attachmentFileName}`);
        fs.writeFileSync(attachmentFilePath, attachment.data);

        // Mark email as seen
        console.log('👀  Marking email as seen');
        await connection.addFlags(message.attributes.uid, ['\\Seen']);
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

/**
 * Marks the last seen email as unseen.
 *
 * @throws An error if marking the email as unseen fails.
 */
export const markLastSeenEmailAsUnseen = async () => {
  validateEmailCredentials();

  let connection: ImapSimple | undefined;
  try {
    connection = await connectToImapServer();
    await openInbox(connection);

    const searchCriteria = ['SEEN', ['FROM', emailTarget]];
    const messages = await fetchEmails(connection, searchCriteria);
    console.log(`📥  Fetched ${messages.length} seen emails`);

    if (messages.length > 0) {
      const lastSeenMessage = messages[messages.length - 1];
      console.log('🔄  Marking last seen email as unseen');
      await connection.delFlags(lastSeenMessage.attributes.uid, ['\\Seen']);
      console.log('🫣   Last seen email marked as unseen');
    } else {
      console.log('🚫  No seen emails found from target email');
    }
  } catch (error) {
    throw new Error(`❌  Error marking last seen email as unseen: ${error.message}`, { cause: error });
  } finally {
    if (connection) {
      disconnectFromImapServer(connection);
    }
  }
};
