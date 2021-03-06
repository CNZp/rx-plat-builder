var fs = require("fs");
var commander = require("commander");
const {
  webappChecking,
  webappNotExist,
  distBuilding,
  cxtpathNotExist,
  pageBuilding,
  mediasBuilding,
  buildSuccess,
} = require("./notice");
var pjson = require("../package.json");

const WEBAPP_DIR = "web/src/main/webapp";
const DIST_DIR = "dist";
const TEXTFILE_REG = /(html|js|css)$/g;
var ctxpath = "/";
var fileNum = 0;

function deleteDirSync(path) {
  let files = [];
  if (fs.existsSync(path)) {
    files = fs.readdirSync(path);
    files.forEach(function (file) {
      let curPath = path + "/" + file;
      if (fs.statSync(curPath).isDirectory()) {
        deleteDirSync(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
}

function checkWebapp(cb) {
  webappChecking();

  if (fs.existsSync(WEBAPP_DIR)) {
    cb();
  } else {
    webappNotExist();
  }
}

function addDistDir(cb) {
  distBuilding();
  var ctxDir = DIST_DIR + ctxpath;

  if (!fs.existsSync(DIST_DIR)) {
    fs.mkdirSync(DIST_DIR);
  } else if (fs.existsSync(ctxDir)) {
    deleteDirSync(ctxDir);
  }

  fs.mkdirSync(ctxDir);
  cb();
}

function buildWebapp() {
  let files = fs.readdirSync(WEBAPP_DIR);

  files.forEach(function (path) {
    if (path === "WEB-INF") {
      buildPages();
    } else if (path === "medias") {
      buildMedias();
    }
  });
}

function copyDirSync(sourcePath, targetPath, cb) {
  var st = fs.statSync(sourcePath);

  if (st.isFile()) {
    fileNum++;
    var writable = fs.createWriteStream(targetPath);
    if (sourcePath.match(TEXTFILE_REG)) {
      var content = fs.readFileSync(sourcePath, "utf8");
      var writeContent = typeof cb === "function" ? cb(content) : content;
      if (typeof writeContent === "string") {
        writable.write(writeContent);
      }
    } else {
      var readable = fs.createReadStream(sourcePath);
      readable.pipe(writable);
    }
  } else if (st.isDirectory()) {
    fs.mkdirSync(targetPath);
    let files = fs.readdirSync(sourcePath);
    files.forEach(function (path) {
      copyDirSync(sourcePath + "/" + path, targetPath + "/" + path, cb);
    });
  }
}

function buildPages() {
  pageBuilding();
  var sourcePath = WEBAPP_DIR + "/WEB-INF";
  var targetPath = DIST_DIR + ctxpath + "/page";
  copyDirSync(sourcePath, targetPath, function (content) {
    return content.replace(/\$\{ctxPath\}/g, ctxpath);
  });
}

function buildMedias() {
  mediasBuilding();
  var sourcePath = WEBAPP_DIR + "/medias";
  var targetPath = DIST_DIR + ctxpath + "/medias";
  copyDirSync(sourcePath, targetPath);
}

function useCommand() {
  const program = new commander.Command();
  program
    .version(pjson?.version || "??????")
    .option(
      "-c, --ctxpath <ctxpath>",
      "????????????????????????html???${ctxPath}????????????????????????????????????",
      "plat"
    );
  program.parse();
  ctxpath = program.opts().ctxpath;

  if (ctxpath) {
    if (!ctxpath.startsWith("/")) {
      ctxpath = "/" + ctxpath;
    }
    checkWebapp(function () {
      addDistDir(function () {
        buildWebapp();
      });
    });

    setTimeout(function () {
      buildSuccess(fileNum);
    }, 100);
  } else {
    cxtpathNotExist();
  }
}

module.exports = {
  useCommand,
};
