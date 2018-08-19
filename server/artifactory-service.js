const axios = require("axios");
const fs = require("fs-extra");
const tar = require("tar");
const showdown  = require('showdown');

const config = require("./config-service.js");
const repoKey = config.artifactory.repoKey;
const tmpDir = "tmp";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
axios.defaults.baseURL = `${
  config.artifactory.baseURL
}/artifactory/api/npm/${repoKey}`;
axios.defaults.headers.common["Authorization"] = config.artifactory.apiKey;

function name2url({ scope, packageName }) {
  return `${scope ? `${scope}/` : ""}${packageName}`;
}

async function fetchPackages() {
  if (process.env.MOCK) {
    return new Promise((resolve, reject) => {
      resolve({
        data: require("./mock/packages-all.json")
      });
    });
  }
  return (request = axios.get(`/-/all`));
}

async function getReadme({ scope, packageName }) {
  if (process.env.MOCK) {
    console.log('bla');
    return new Promise((resolve, reject) => {
      const converter = new showdown.Converter();
      const readme = fs.readFileSync("./server/mock/fractal-menu-enhancer.readme.md");
      const html = converter.makeHtml(readme.toString());
      resolve({
        data: html
      });
    });
  }

  const packageDetailResonse = await getPackageDetail({ scope, packageName });
  const packageDetail = packageDetailResonse.data;
  const latestVersionResponse = await getDistTags({ scope, packageName });
  const latestVersion = latestVersionResponse.data.latest;
  const downloadUrl = packageDetail.versions[latestVersion].dist.tarball;
  return axios
    // Request package:
    .request({  // TODO: check if readme has been already downloaded
      responseType: "arraybuffer",
      url: downloadUrl,
      method: "get",
      headers: {
        "Content-Type": "application/gzip"
      }
    })
    // Store package in filesystem:
    .then(result => {
      fs.ensureDirSync(`${tmpDir}/${scope}/${packageName}`);
      const outputFilename = `${tmpDir}/${scope}/${packageName}/${packageName}-${latestVersion}.tar.gz`;
      fs.writeFileSync(outputFilename, result.data);
      return outputFilename;
    })
    // Extract package:
    .then(file => {
      const cwd = `${tmpDir}/${scope}/${packageName}`;
      return tar.x({ file, cwd }).then(() => cwd);
    })
    // Read README.md:
    .then(dir => {
      const readmeFile = `${dir}/package/README.md`; // TODO: ignore case
      const readme = fs.readFileSync(readmeFile);
      const converter = new showdown.Converter();
      const html = converter.makeHtml(readme.toString());
      return html;
    });
}

async function getPackageDetail({ scope, packageName }) {
  if (process.env.MOCK) {
    return new Promise((resolve, reject) => {
      resolve({
        data: require(`./mock/fractal-menu-enhancer.json`)
      });
    });
  }
  return axios.get(`/${name2url({ scope, packageName })}`);
}

async function getDistTags({ scope, packageName }) {
  return axios.get(`/-/package/${name2url({ scope, packageName })}/dist-tags`);
}

module.exports = {
  fetchPackages,
  getReadme,
  getDistTags,
  getPackageDetail
};
