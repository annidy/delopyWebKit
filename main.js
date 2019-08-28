'use strict'

var shell = require('shelljs');
var fs = require('fs')
const path = require('path')
const process = require('process')



const SourceDir = process.argv[2]

if (SourceDir == undefined) {
    console.log('set webkit build dir first');
    return
}

var LibraryDir = process.argv[3]
if (LibraryDir == undefined) {
    LibraryDir = '/Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/Library/CoreSimulator/Profiles/Runtimes/iOS.simruntime/Contents/Resources/RuntimeRoot/System/Library'
    console.log('unset xcode library path, use default', LibraryDir);
    
}

const FrameworksDir = path.join(LibraryDir, 'Frameworks')
const PrivateFrameworksDir = path.join(LibraryDir, 'PrivateFrameworks')

function safeCopy(dstfra) {
    var name = path.basename(dstfra)
    var srcfra = path.join(SourceDir, name)
    try {
        fs.statSync(srcfra)
    } catch (error) {
        console.log(srcfra, 'not exist');
        return
    }

    try {
        fs.statSync(dstfra+'.bak')
    } catch (error) {
        console.log('backup', dstfra);
        shell.mv(dstfra, dstfra+'.bak')
    }
    console.log(`ln -s ${srcfra} ${dstfra}`)
    shell.ln('-s', srcfra, dstfra)
}


safeCopy(path.join(FrameworksDir, 'JavaScriptCore.framework'))
safeCopy(path.join(FrameworksDir, 'WebKit.framework'))
safeCopy(path.join(PrivateFrameworksDir, 'WebCore.framework'))
safeCopy(path.join(PrivateFrameworksDir, 'WebKitLegacy.framework'))


