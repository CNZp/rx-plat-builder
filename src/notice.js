function cxtpathNotExist() {
  console.log("Error: 请配置期望项目路径！");
}

function webappChecking() {
  console.log("文件检查中...");
}

function webappNotExist() {
  console.log("Error: 请在平台项目根路径执行rx-plat-builder命令！");
}

function distBuilding() {
  console.log("目录构建中...");
}

function pageBuilding() {
  console.log("page文件编译中...");
}

function mediasBuilding() {
  console.log("medias文件编译中...");
}

function buildSuccess(fileNum) {
  console.log(`编译成功！编译文件共${fileNum}个。`);
}

module.exports = {
  webappChecking,
  webappNotExist,
  distBuilding,
  cxtpathNotExist,
  pageBuilding,
  mediasBuilding,
  buildSuccess,
};
