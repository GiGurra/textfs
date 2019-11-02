#!/usr/bin/env node

const fs = require('fs');
const yargs = require('yargs/yargs');
const prettyBytes = require('pretty-bytes');

const cmdLine = parseCmdLine();
const verbose = cmdLine.verbose;

async function main() {

    let input = cmdLine.input;
    let output = cmdLine.output;

    if (input.endsWith("/")) {
        input = input.slice(0, input.length - 1)
    }

    if (output.endsWith("/")) {
        output = output.slice(0, output.length - 1)
    }

    if (!fs.existsSync(input)) {
        throw new Error("Source file/folder '" + input + "' not found!");
    }

    if (fs.existsSync(output)) {
        throw new Error("Target file/folder '" + output + "' already exists!");
    }

    if (verbose) {
        console.error("Treating " + input + " as json file, and trying to write back the original file structure!");
    }

    const obj = JSON.parse(fs.readFileSync(cmdLine.input).toString());
    obj.path = output;
    ojb2Fs(obj, "", output)
}

function ojb2Fs(obj, cwd = "") {

    const path = cwd === "" ? obj.path : cwd + "/" + obj.path;

    console.error(obj.path + " -> " + path);
    console.error();

    switch(obj.type) {
        case "symlink":

            if (verbose) {
                console.error(path + " (symlink)")
            }

            const target = obj.target;
            fs.symlinkSync(target, path);

            break;
        case "dir":

            if (verbose) {
                console.error(path + " (dir)")
            }

            fs.mkdirSync(path);
            obj.children.map(child => ojb2Fs(child, path));

            break;
        case "file":

            const size = obj.size;
            if (verbose) {
                console.error(path + " (file, " + prettyBytes(size) + ")");
            }

            if (obj.encoding === "text") {
                fs.writeFileSync(path, obj.contents);
            }
            else {
                fs.writeFileSync(path, Buffer.from(obj.contents, 'base64'));
            }

            break;
        default:
            console.error("Cannot recreate object " + JSON.stringify(obj) + " because it is of unsupported type " + obj.type);
            break;
    }
}

function parseCmdLine() {
    return yargs(process.argv.slice(2)).usage('$0 <input> <output>', 'Convert json file to fs', (yargs) => {
        yargs
            .example("$0 something.json outputdir",
                "Converts something.json to fs @ outputdir"
            )
            .option('verbose', {
                alias: 'v',
                description: 'print more stuff',
                type: 'boolean',
                default: false,
            })
            .help()
            .strict()
    }).argv;
}


main().catch(error => {
    console.error(error);
    process.exit(1);
});
