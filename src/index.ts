import { argv } from '@constants';
import { mainFlow } from '@features';
// without this is not possible track errors in files after build
import 'source-map-support/register.js';

mainFlow(argv);
