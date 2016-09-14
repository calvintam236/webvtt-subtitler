"use strict";
/**
* WebVTT-Subtitler
* @version 0.1
* @author Calvin Tam
* @link https://github.com/calvintam236/webvtt-subtitler
**/

/**
* Convert a subtile file in string into .webvtt format subtitle file string
* @param string extension File extension e.g. ass, ssa, srt
* @param string input Raw file String
* @return string Processed file string in webvtt format | undefined
**/
function webvtt_subtitler(extension, input) {
    var rawLines = [];
    var processedLines = [];
    var cue = 0;
    var i;
    var j;
    var line;
    // remove all CR and split into array by \r\n
    rawLines = input.replace(/\r?\n|\r|\n/g, "\r\n").split("\r\n");
    switch (extension) {
    case "ass":
    case "ssa":
        var identifier = [];
        var lineArray = [];
        for (i = 0; i < rawLines.length; i++) {
            if (rawLines[i].toUpperCase().indexOf("[EVENTS]") > -1) {
                rawLines.splice(0, i + 1);
                break;
            }
        }
        for (i = 0; i < rawLines.length; i++) {
            line = [];
            if (rawLines[i].trim().length > 0) {
                lineArray = [];
                lineArray[0] = rawLines[i].split(": ");
                lineArray[1] = lineArray[0][1].split(",");
                line[0] = lineArray[0][0];
                line = line.concat(lineArray[1]);
                if (line[0].toUpperCase().indexOf("FORMAT") > -1) {
                    for (j = 1; j < line.length; j++) {
                        if (line[j].toUpperCase().indexOf("START") > -1) {
                            identifier[0] = j;
                            continue;
                        }
                        if (line[j].toUpperCase().indexOf("END") > -1) {
                            identifier[1] = j;
                            continue;
                        }
                        if (line[j].toUpperCase().indexOf("TEXT") > -1) {
                            identifier[2] = j;
                            continue;
                        }
                    }
                } else {
                    processedLines[cue] = [];
                    processedLines[cue++] = [line[identifier[0]], line[identifier[1]], line[identifier[2]]];
                }
            }
        }
        break;
    case "srt":
        for (i = 0; i < rawLines.length; i++) {
            line = [];
            if (rawLines[i] === cue + 1) {
                continue;
            } else if (rawLines[i].trim().length > 1) {
                if (rawLines[i].indexOf(" --> ") > -1) {
                    line = rawLines[i].split(" --> ");
                    processedLines[cue] = [];
                    processedLines[cue][0] = line[0].replace(",", ".");
                    processedLines[cue][1] = line[1].replace(",", ".");
                    processedLines[cue][2] = "";
                } else {
                    if (processedLines[cue][2].length > 0) {
                        processedLines[cue][2] += "\r\n";
                    }
                    processedLines[cue][2] += rawLines[i];
                }
            } else if (processedLines[cue] !== undefined) {
                cue++;
            }
            break;
        }
    }
    if (cue > 0) {
        var output = "WEBVTT\r\n";
        var timing;
        for (i = 0; i < cue; i++) {
            output += "\r\n" + (i + 1) + "\r\n";
            timing = [];
            for (j = 0; j < 2; j++) {
                timing[j] = new Date("0000-01-01T" + ("0" + processedLines[i][j]).slice(-12) + "Z");
                processedLines[i][j] = ("0" + timing[j].getUTCHours()).slice(-2) + ":" + ("0" + timing[j].getUTCMinutes()).slice(-2) + ":" + ("0" + timing[j].getUTCSeconds()).slice(-2) + "." + ("00" + timing[j].getUTCMilliseconds()).slice(-3);
            }
            output += processedLines[i][0] + " --> " + processedLines[i][1] + "\r\n" + processedLines[i][2] + "\r\n";
        }
        return output;
    } else {
        return undefined;
    }
}