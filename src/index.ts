import { argv } from '@constants';
import { mainFlow } from './features/main';
// without this, it is not possible to track errors in files after build
import 'source-map-support/register.js';

/**
 * Entry point of the application.
 *
 * This file initializes the application by:
 * - Parsing command-line arguments.
 * - Executing the main application flow.
 * - Enabling source map support for better error tracking in production builds.
 *
 * @see mainFlow - The main application logic.
 * @see argv - Parsed command-line arguments.
 */
export default mainFlow(argv);
