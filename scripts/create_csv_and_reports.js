// Reads the extracted "TS" folder and creates HTML files with inline images in "reports" folder.
// Creates also the reports.csv file that can be used with dataloader.
// Replace the VersionData path with correct path after csv has been created.

var fs = require('fs');
var base64Img = require('base64-img');

var rootDir = "TC";
if(!fs.existsSync(rootDir)) {
    console.log(rootDir, "missing");
    return
}

var reportName = "Traction Control Weekly HTML Report.html";
var reportFileDir = "Traction Control Weekly HTML Report_files";
var outputDir = "reports";


var absoluteVersionDataPath = 'E:/null';
var csvFileName = "reports.csv";
var csv = [['"PathOnClient"','"VersionData"','"FirstPublishLocationId"','"Origin"','"Title"']];
var firstPublishLocationId = "0586E0000004sELQAY";
var origin = "C";

var dirs = getDirectories(rootDir);
for(var i in dirs) {
    var vaPath = rootDir + "/" + dirs[i] + "/VA";
    var vcPath = rootDir + "/" + dirs[i] + "/VC";

    createHTMLs(vaPath);
    createHTMLs(vcPath);
}

var csvStr = "";
for(var i in csv) csvStr += csv[i].join(",") + "\n";
fs.writeFileSync(csvFileName, csvStr);

function createHTMLs(path) {
    if(fs.existsSync(path)) {
        var dirs = getDirectories(path);
        for(var j in dirs) {
            var reportPath = path + "/" + dirs[j];
            var reportPathWithName = reportPath +  "/" + reportName;
            
            if(fs.existsSync(reportPathWithName)) {
                var reportFiles = fs.readdirSync(reportPath + "/" + reportFileDir);
                var fileData = fs.readFileSync(reportPathWithName, 'utf-8');

                for(var k in reportFiles) {
                    console.log(reportFiles[k]);
                    fileData = fileData.replace(reportFileDir + "/" + reportFiles[k], base64Img.base64Sync(reportPath + "/" + reportFileDir + "/" + reportFiles[k], 'base64'));
                }
                
                var reportZipPath = outputDir + "/" + reportPath.replace(/\//g, "#") + ".html";
                csv.push([wrapWithChar(reportPath), wrapWithChar(absoluteVersionDataPath + "/" + reportZipPath), wrapWithChar(firstPublishLocationId), wrapWithChar(origin), wrapWithChar(reportPath)]);
                fs.writeFileSync(reportZipPath, fileData);
            }
        }
    }
}

function getDirectories(path) {
    return fs.readdirSync(path).filter(function (file) {
        return fs.statSync(path+'/'+file).isDirectory();
    });
}

function wrapWithChar(str, char) {
    if(!char) char = '"';
    return char + str + char;
}

