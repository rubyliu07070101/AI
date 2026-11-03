/* 课程登记 - 零依赖本地静态服务器
 * 用途：电脑上运行 `node server.js`，同一 WiFi 下的手机浏览器打开
 * 终端打印的「手机访问」地址即可使用。每台手机数据各自独立，
 * 存在各自手机浏览器本地（localStorage），无任何服务器存储。
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = Number(process.env.PORT) || 8080;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json'
};

const server = http.createServer(function (req, res) {
  let urlPath;
  try {
    urlPath = decodeURIComponent((req.url || '/').split('?')[0].split('#')[0]);
  } catch (e) {
    res.writeHead(400);
    res.end('Bad Request');
    return;
  }
  if (urlPath === '/') urlPath = '/index.html';

  const filePath = path.normalize(path.join(ROOT, urlPath));
  if (!filePath.startsWith(ROOT + path.sep) && filePath !== ROOT) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, function (err, data) {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': 'no-cache'
    });
    res.end(data);
  });
});

server.listen(PORT, function () {
  console.log('\n  📚 课程登记 已启动\n');
  console.log('  本机访问:  http://localhost:' + PORT + '\n');
  console.log('  手机访问（需与电脑连接同一个 WiFi）:');
  const nets = os.networkInterfaces();
  Object.keys(nets).forEach(function (name) {
    nets[name].forEach(function (n) {
      if (n.family === 'IPv4' && !n.internal) {
        console.log('    http://' + n.address + ':' + PORT);
      }
    });
  });
  console.log('\n  按 Ctrl+C 停止服务。\n');
});
