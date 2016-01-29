"use strict";

let hood = require("hood");
let helmet = require("helmet");
let csurf = require("csurf");

const defaultTrustedDomains = {
  default: [ "'self'" ],
  connection: [ "'self'" ],
  frame: [
          "'self'",
          "https://docs.google.com"],
  font: [
          "'self'",
          "https://fonts.gstatic.com",
          "https://netdna.bootstrapcdn.com",
          "https://code.cdn.mozilla.net/"
        ],
  image: [ "*" ],
  media: [ "*" ],
  script: [
            "'self'",
            "http://mozorg.cdn.mozilla.net",
            "https://ajax.googleapis.com",
            "https://mozorg.cdn.mozilla.net",
            "https://www.google-analytics.com"
          ],
  stylesheet: [
                "'self'",
                "http://mozorg.cdn.mozilla.net",
                "https://ajax.googleapis.com",
                "https://fonts.googleapis.com",
                "https://mozorg.cdn.mozilla.net",
                "https://netdna.bootstrapcdn.com"
              ]
};

function Security(server) {
  this.server = server;
}

Security.prototype = {
  csp(domainList) {
    domainList = domainList || {};
    Object.keys(defaultTrustedDomains).forEach(mimeType => {
      let domainsToAdd = domainList[mimeType];
      let defaultDomains = defaultTrustedDomains[mimeType];

      if(domainsToAdd && defaultDomains.indexOf("*") !== -1) {
        domainList[mimeType] = domainsToAdd;
      } else {
        domainList[mimeType] = defaultDomains.concat((domainsToAdd || []));
      }
    });

    this.server.use(hood.csp({
      headers: [ "Content-Security-Policy-Report-Only" ],
      policy: {
        "default-src": domainList.default,
        "connect-src": domainList.connection,
        "frame-src": domainList.frame,
        "font-src": domainList.font,
        "img-src": domainList.image,
        "media-src": domainList.media,
        "script-src": domainList.script,
        "style-src": domainList.stylesheet
      }
    }));

    return this;
  },
  ssl() {
    this.server.use(helmet.hsts());
    this.server.enable("trust proxy");

    return this;
  },
  xss() {
    this.server.use(helmet.xssFilter());
    return this;
  },
  mimeSniff() {
    this.server.use(helmet.noSniff());
    return this;
  },
  csrf() {
    this.server.use(csurf());
    return this;
  },
  xframe() {
    this.server.use(helmet.xframe());
    return this;
  }
};

module.exports = Security;
