#!/usr/bin/env node

const fs = require('fs');
const libPath = require('path');
const yargs = require('yargs/yargs');
const istextorbinary = require('istextorbinary');
const prettyBytes = require('pretty-bytes');

const cmdLine = parseCmdLine();
const verbose = cmdLine.verbose;

async function main() {

    let input = cmdLine.input;
    let output = cmdLine.output;

    if (input.endsWith("/")) {
        input = input.slice(0, input.length - 1)
    }

    if (output && output.endsWith("/")) {
        output = output.slice(0, output.length - 1)
    }

    if (!fs.existsSync(input)) {
        throw new Error("Source file/folder '" + input + "' not found!");
    }

    if (output) {

        if (fs.existsSync(output)) {
            throw new Error("Target file/folder '" + output + "' already exists!");
        }

        if (verbose) {
            console.error("Treating " + input + " as json file, and trying to write back the original file structure!");
        }

        const obj = JSON.parse(fs.readFileSync(cmdLine.input).toString());
        ojb2Fs(obj)
    }
    else {

        if (verbose) {
            console.error("Treating " + input + " as file system input, and trying to output its json representation");
        }

        const result = fs2obj(input);
        console.log(JSON.stringify(result));
    }
}

function fs2obj(path) {

    const stat = fs.lstatSync(path);
    const type = getTypeName(stat);
    const result = {
        type: getTypeName(stat),
        path: path,
        pathAbs: libPath.resolve(path)
    };

    switch (type) {
        case "symlink":

            if (verbose) {
                console.error(path + " (symlink)")
            }

            result.target = fs.readlinkSync(path);
            break;
        case "dir":

            if (verbose) {
                console.error(path + " (dir)")
            }

            result.children = fs.readdirSync(path).map(child => fs2obj(path + "/" + child));
            break;
        case "file":

            const size = stat.size;
            if (verbose) {
                console.error(path + " (file, " + prettyBytes(size) + ")");
            }

            const data = fs.readFileSync(path);
            let isText = istextorbinary.isTextSync(path, data);

            result.encoding = isText ? "text" : "binary";
            result.contents = isText ? data.toString() : data.toString('base64');
            result.size = size;
            break;
        default:
            console.error("WARN: Ignoring " + path + ", since it is of unsupported type: " + type);
            break;
    }

    return result;
}

function ojb2Fs(obj, cwd = "", overridePath = null) {

    const path = overridePath ? overridePath : (cwd === "" ? obj.path : cwd + "/" + obj.path);

    switch(obj.type) {
        case "symlink":

            if (verbose) {
                console.error(path + " (symlink)")
            }

            break;
        case "dir":

            if (verbose) {
                console.error(path + " (dir)")
            }

            obj.children.map(child => ojb2Fs(child, path));

            break;
        case "file":

            const size = obj.size;
            if (verbose) {
                console.error(path + " (file, " + prettyBytes(size) + ")");
            }

            const data = fs.readFileSync(path);
            let isText = istextorbinary.isTextSync(path, data);

            result.encoding = isText ? "text" : "binary";
            result.contents = isText ? data.toString() : data.toString('base64');
            result.size = size;
            break;
        default:
            console.error("Cannot recreate object " + JSON.stringify(obj) + " because it is of unsupported type " + obj.type);
            break;
    }

    const stat = fs.lstatSync(path);
    const type = getTypeName(stat);
    const result = {
        type: getTypeName(stat),
        path: path,
        pathAbs: libPath.resolve(path)
    };

    switch (type) {
        case "symlink":

            if (verbose) {
                console.error(path + " (symlink)")
            }

            result.target = fs.readlinkSync(path);
            break;
        case "dir":

            if (verbose) {
                console.error(path + " (dir)")
            }

            result.children = fs.readdirSync(path).map(child => fs2obj(path + "/" + child));
            break;
        case "file":

            const size = stat.size;
            if (verbose) {
                console.error(path + " (file, " + prettyBytes(size) + ")");
            }

            const data = fs.readFileSync(path);
            let isText = istextorbinary.isTextSync(path, data);

            result.encoding = isText ? "text" : "binary";
            result.contents = isText ? data.toString() : data.toString('base64');
            result.size = size;
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
