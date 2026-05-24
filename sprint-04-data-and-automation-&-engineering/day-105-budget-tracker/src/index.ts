import dotenv from 'dotenv';
dotenv.config();

import { cmdAdd }     from './commands/add';
import { cmdList }    from './commands/list';
import { cmdSummary } from './commands/summary';
import { cmdBudget, cmdDelete } from './commands/budget';
import { cmdExport }  from './commands/export';
import { printHelp }  from './display/help';
import { closeDb }    from './db/store';

async function main(): Promise<void> {
    const [, , command, ...args] = process.argv;

    try {
        switch (command) {
            case 'add':     cmdAdd(args);     break;
            case 'list':    cmdList(args);    break;
            case 'summary': cmdSummary(args); break;
            case 'budget':  cmdBudget(args);  break;
            case 'delete':  cmdDelete(args);  break;
            case 'export':  cmdExport(args);  break;
            case 'help':
            case undefined: printHelp();      break;
            default:
                console.error(`\n  Unknown command: "${command}". Run "budget help" for usage.\n`);
                process.exit(1);
        }
    } catch (err) {
        console.error('\n  [Error]', (err as Error).message, '\n');
        process.exit(1);
    } finally {
        closeDb();
    }
}

main();