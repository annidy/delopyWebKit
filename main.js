'use strict'

var shell = require('shelljs');
var fs = require('fs')
const path = require('path')
const process = require('process')

var argv = process.argv.splice(2)
var RestoreFlag = false

console.log(argv);


if (argv[0][0] == '-') {
    switch (argv[0]) {
        case '-R':
        case '-r': {
            RestoreFlag = true
            console.log('restore files');
        }
            break
    }
    argv.shift()
}

if (!RestoreFlag) {

    var SourceDir = argv.shift()

    if (SourceDir == undefined) {
        console.log('set webkit build dir first');
        return
    }
    console.info('webkit build dir:', SourceDir);
    
}

var LibraryDir = argv.shift()
if (LibraryDir == undefined) {
    LibraryDir = '/Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/Library/CoreSimulator/Profiles/Runtimes/iOS.simruntime/Contents/Resources/RuntimeRoot/System/Library'
    console.warn('unset xcode library path, use default', LibraryDir);
}

const FrameworksDir = path.join(LibraryDir, 'Frameworks')
const PrivateFrameworksDir = path.join(LibraryDir, 'PrivateFrameworks')
const SystemFrameworksDir = '/Applications/Xcode.app/Contents/Developer/Platforms/iPhoneSimulator.platform/Developer/SDKs/iPhoneSimulator.sdk/System/Library/Frameworks'
const UsrDir = '/Applications/Xcode.app/Contents/Developer/Platforms/iPhoneSimulator.platform/Developer/SDKs/iPhoneSimulator.sdk/usr/'
const SystemPrivateFrameworksDir = '/Applications/Xcode.app/Contents/Developer/Platforms/iPhoneSimulator.platform/Developer/SDKs/iPhoneSimulator.sdk/System/Library/PrivateFrameworks'

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
        fs.statSync(dstfra + '.bak')
    } catch (error) {
        console.log('backup', dstfra);
        shell.mv(dstfra, dstfra + '.bak')
    }
    shell.rm('-rf', dstfra)
    shell.ln('-s', srcfra, dstfra)
}

function safeRestore(dstfra) {
    try {
        fs.statSync(dstfra + '.bak')
        shell.rm('-rf', dstfra)
        shell.mv(dstfra + '.bak', dstfra)
    } catch (error) {
        console.log(dstfra, 'no backup');
    }
}

const framework_paths = [
    path.join(FrameworksDir, 'JavaScriptCore.framework'),
    path.join(FrameworksDir, 'WebKit.framework'),
    path.join(PrivateFrameworksDir, 'WebCore.framework'),
    path.join(PrivateFrameworksDir, 'WebKitLegacy.framework'),
    path.join(SystemFrameworksDir, 'JavaScriptCore.framework')
]

if (RestoreFlag) {
    framework_paths.forEach(p => safeRestore(p))
} else {
    framework_paths.forEach(p => safeCopy(p))

    shell.mkdir(SystemPrivateFrameworksDir)
    shell.cp('-rf', path.join(SourceDir, 'WebKitLegacy.framework'), SystemPrivateFrameworksDir)
    
    // shell.cp('-rf', path.join(SourceDir, 'usr/local/include/wtf'), path.join(UsrDir, 'include'))
    // shell.cp('-rf', path.join(SourceDir, 'usr/local/include/bmalloc'), path.join(UsrDir, 'include'))
    // shell.cp('-rf', path.join(SourceDir, 'JavaScriptCore.framework/PrivateHeaders'), path.join(SystemFrameworksDir, 'JavaScriptCore.framework/Headers'))
    // shell.cp(path.join(SourceDir, 'libWTF.a'), path.join(UsrDir, 'lib'))
}

