module.exports = {
  "globDirectory": "../dist/lukask-pwa/",
  "globPatterns": [
    "*.{ico,html,json}",
    "assets/**/*.{jpg,png,gif,cur,eot,svg,woff,woff2,ttf,js,css,ico}"
  ],
  "swSrc": "sw-basic.js",
  "swDest": "..\\dist\\lukask-pwa\\sw-workbox.js",
  "globIgnores": [
    "ngsw-worker.js",
    "ngsw.json",
    "safety-worker.js",
    "worker-basic.min.js",
  ]
};