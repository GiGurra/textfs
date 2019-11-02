#!/usr/bin/env node

const fs = require('fs');
const yargs = require('yargs/yargs');

async function main() {
    const cmdLine = parseCmdLine();
    console.error(cmdLine);

    const input = cmdLine.input;

    const inputIsFileSystem = fs.existsSync(input);

    if (inputIsFileSystem) {
        const stat = fs.lstatSync(input);
        if (stat.isDirectory()) {
            console.error("Treating " + input + " as file system input, and trying to output its json representation");
        } else if (stat.isFile() && input.endsWith(".json")) {
            throw new Error("Converting back from json not yet implemented!");
        } else {
            throw new Error("Unsupported input. Must be directory or .json file!");
        }
    } else {
        throw new Error("Source file/folder '" + input + "' not found!");
    }
}

function parseCmdLine() {
    return yargs(process.argv.slice(2)).usage('$0 <input> [output]', 'Convert folders/files <-> text repr', (yargs) => {
        yargs
            .example("$0 /home/someone/somedir something.json",
                "Converts /home/someone/somedir to json recursively"
            )
            .help()
            .strict()
    }).argv;
}


main().catch(error => {
    console.error(error);
    process.exit(1);
});
