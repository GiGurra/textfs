#!/usr/bin/env node

const fs = require('fs');
const libPath = require('path');
const yargs = require('yargs/yargs');
const istextorbinary = require('istextorbinary');

async function main() {
    const cmdLine = parseCmdLine();
    console.error(cmdLine);

    let input = cmdLine.input;
    if (cmdLine.output) {
        throw new Error("Converting back not yet implemented!");
    }

    if (input.endsWith("/")) {
        input = input.slice(0, input.length-1)
    }

    if (fs.existsSync(input)) {
        const stat = fs.lstatSync(input);
        if (stat.isDirectory()) {
            console.error("Treating " + input + " as file system input, and trying to output its json representation");
            const result = fs2JsObj(input);
            console.log(JSON.stringify(result));
        }
        else {
            throw new Error("Unsupported input. Must be directory!");
        }
    } else {
        throw new Error("Source file/folder '" + input + "' not found!");
    }
}

function fs2JsObj(path) {

    const stat = fs.lstatSync(path);
    const type = getTypeName(stat);
    const result = {
        type: getTypeName(stat),
        path: path,
        pathAbs: libPath.resolve(path)
    };

    switch (type) {
        case "symlink":
            result.target = fs.readlinkSync(path);
            break;
        case "dir":
            result.children = fs.readdirSync(path).map(child => fs2JsObj(path + "/" + child));
            break;
        case "file":
            const isText = istextorbinary.isText(path) || istextorbinary.getEncoding(path) === 'utf8';
            result.encoding = isText ? "text" : "binary";
            result.contents = isText ? fs.readFileSync(path).toString() : fs.readFileSync(path).toString('base64');
            break;
        default:
            console.error("WARN: Ignoring " + path + ", since it is of unsupported type: " + type);
            break;
    }

    return result;
}

function getTypeName(stat) {
    if (stat.isFile()) {
        return "file"
    } else if (stat.isDirectory()) {
        return "dir"
    } else if (stat.isBlockDevice()) {
        return "blockdev"
    } else if (stat.isCharacterDevice()) {
        return "chardev"
    } else if (stat.isSymbolicLink()) {
        return "symlink"
    } else if (stat.isFIFO()) {
        return "fifo"
    } else if (stat.isSocket()) {
        return "socket"
    } else {
        return "ukn"
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
