/**
 * iPad mini MSFS Glass Cockpit Controller
 * WebSocket Server - PC에서 실행
 * 
 * MSFS 시뮬레이터 데이터를 수집하여 iPad의 웹 인터페이스로 전송
 */

const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');

// 설정
const PORT = process.env.PORT || 8765;
const HTTP_PORT = process.env.HTTP_PORT || 8080;

// 텔레메트리 데이터 저장소
let currentTelemetry = {
  heading: 0,
  airspeed: 0,
  altitude: 0,
  target_altitude: 0,
  throttle: 0,
  loc_captured: 0,
  gs_captured: 0,
  nav_mode: 0,
  wp_current: '---',
  wp_next: '---',
  wp_next2: '---',
  wp_dest: '---',
  ap_state: 0,
  apr_state: 0,
  loc_state: 0,
  alt_state: 0,
  vs_state: 0
};

// 연결된 클라이언트 목록
const clients = new Set();

// WebSocket 서버 생성
const wss = new WebSocket.Server({ port: PORT });

console.log(`🚀 WebSocket 서버 시작: ws://localhost:${PORT}`);

wss.on('connection', (ws) => {
  console.log('✅ iPad 클라이언트 연결됨');
  clients.add(ws);

  // 연결 시 현재 텔레메트리 전송
  ws.send(JSON.stringify(currentTelemetry));

  ws.on('message', (message) => {
    try {
      const control = JSON.parse(message);
      console.log(`📨 제어 명령 수신: ${control.action}`);
      
      // MSFS로 제어 명령 전송
      handleControlCommand(control.action);
    } catch (err) {
      console.error('메시지 파싱 오류:', err);
    }
  });

  ws.on('close', () => {
    console.log('❌ iPad 클라이언트 연결 종료');
    clients.delete(ws);
  });

  ws.on('error', (err) => {
    console.error('WebSocket 오류:', err);
  });
});

/**
 * MSFS 제어 명령 처리
 * 실제 구현에서는 MSFS SimConnect API를 호출
 */
function handleControlCommand(action) {
  // 이 함수는 MSFS와의 실제 연결에서 구현됨
  // 현재는 로깅만 수행
  const commands = {
    'AP_TOGGLE': 'AP 토글',
    'ALT_TOGGLE': '고도 유지 토글',
    'VS_TOGGLE': '수직속도 토글',
    'FMS_HDG': '항향 동기화',
    'LOC_TOGGLE': 'LOC 토글',
    'APR_TOGGLE': '접근 토글',
    'ALT_UP': '고도 증가',
    'ALT_DN': '고도 감소',
    'VS_UP': '수직속도 증가',
    'VS_DN': '수직속도 감소',
    'FMS_MENU': 'FMS 메뉴',
    'FMS_FPL': '비행계획',
    'FMS_PROC': '절차',
    'FMS_CLR': '취소',
    'FMS_ENT': '실행',
    'FMS_DIAL_LEFT': '다이얼 좌회전',
    'FMS_DIAL_RIGHT': '다이얼 우회전'
  };

  console.log(`⚙️  ${commands[action] || '알 수 없는 명령'}`);
}

/**
 * 텔레메트리 데이터 업데이트 및 모든 클라이언트에 브로드캐스트
 */
function broadcastTelemetry(data) {
  currentTelemetry = { ...currentTelemetry, ...data };
  
  const message = JSON.stringify(currentTelemetry);
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

/**
 * HTTP 서버 (웹 인터페이스 제공)
 */
const server = http.createServer((req, res) => {
  let filePath = req.url === '/' ? '/index.html' : req.url;
  filePath = path.join(__dirname, filePath);

  // 보안: 디렉토리 트래버설 공격 방지
  if (!filePath.startsWith(path.join(__dirname))) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }

    // MIME 타입 설정
    let contentType = 'text/plain';
    if (filePath.endsWith('.html')) contentType = 'text/html';
    else if (filePath.endsWith('.css')) contentType = 'text/css';
    else if (filePath.endsWith('.js')) contentType = 'application/javascript';
    else if (filePath.endsWith('.json')) contentType = 'application/json';

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(HTTP_PORT, '0.0.0.0', () => {
  console.log(`🌐 HTTP 서버 시작: http://localhost:${HTTP_PORT}`);
  console.log(`📱 iPad에서 접속: http://<PC-IP>:${HTTP_PORT}`);
});

/**
 * 시뮬레이션 데이터 생성 (테스트용)
 * 실제 환경에서는 MSFS SimConnect API 사용
 */
let simTime = 0;
setInterval(() => {
  simTime += 0.016; // ~60 FPS

  // 시뮬레이션 데이터 생성
  const telemetry = {
    heading: (Math.sin(simTime * 0.5) * 180 + 180) % 360,
    airspeed: 150 + Math.sin(simTime) * 20,
    altitude: 5000 + Math.cos(simTime * 0.3) * 500,
    target_altitude: 5000,
    throttle: (Math.sin(simTime * 0.2) * 50 + 50),
    loc_captured: Math.random() > 0.7 ? 1 : 0,
    gs_captured: Math.random() > 0.7 ? 1 : 0,
    nav_mode: Math.random() > 0.5 ? 1 : 0,
    ap_state: 1,
    apr_state: 0,
    loc_state: 0,
    alt_state: 1,
    vs_state: 0
  };

  broadcastTelemetry(telemetry);
}, 16);

// 우아한 종료
process.on('SIGINT', () => {
  console.log('\n🛑 서버 종료 중...');
  server.close();
  wss.close();
  process.exit(0);
});
