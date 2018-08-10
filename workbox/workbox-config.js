module.exports = {
  "globDirectory": "../dist/lukask-pwa/",
  "globPatterns": [
    "**/*.{ico,png,html,js,json,css,eot,svg,woff,woff2,ttf}",
    "assets/icons/*.png",
    "assets/images/**/*.{jpg,png,gif,cur}",
    "assets/fonts/*.{eot,woff,woff2,ttf}"
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