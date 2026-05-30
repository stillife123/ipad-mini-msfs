# iPad mini MSFS Glass Cockpit Controller

**Microsoft Flight Simulator와 iPad mini를 연결하여 고급 기능의 Glass Cockpit 컨트롤러를 구현합니다.**

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)

## 🎯 개요

이 프로젝트는 PC의 Microsoft Flight Simulator를 iPad mini로 제어할 수 있는 전용 웹 인터페이스를 제공합니다.

### 주요 기능

- ✈️ **실시간 항공기 데이터 표시**
  - 항향(Heading), 지시 항속(IAS), 고도(Altitude)
  - 선택 고도(Selected Altitude)

- 🎮 **고급 자동 조종 제어**
  - AP (Autopilot) 토글
  - ALT (Altitude Hold)
  - VS (Vertical Speed)
  - LOC (Localizer) / NAV
  - APR (Approach)

- 📊 **Glass Cockpit 스타일 인터페이스**
  - 다크 테마 (조종실 환경)
  - 실시간 쓰로틀 표시
  - LED 인디케이터 (상태 표시)
  - 항공기 계기판 스타일 버튼

- 🔌 **WebSocket 실시간 통신**
  - iPad ↔ PC 간 양방향 통신
  - 자동 재연결 기능
  - 낮은 지연시간(Low Latency)

## 📋 시스템 요구사항

### PC (백엔드 서버)
- **OS**: Windows 10/11
- **소프트웨어**: 
  - Microsoft Flight Simulator 2020/2024
  - Node.js 14.0.0 이상
  - npm (Node.js 포함)

### iPad
- **OS**: iPadOS 12 이상
- **Safari** 또는 기타 웹 브라우저
- **네트워크**: PC와 동일 WiFi 네트워크 연결

## 🚀 설치 및 실행

### 1단계: PC 백엔드 설정

```bash
# 저장소 클론 또는 파일 다운로드
git clone https://github.com/stillife123/ipad-mini-msfs.git
cd ipad-mini-msfs

# 의존성 설치
npm install

# 서버 실행
npm start
```

서버가 정상 시작되면:
```
🚀 WebSocket 서버 시작: ws://localhost:8765
🌐 HTTP 서버 시작: http://localhost:8080
📱 iPad에서 접속: http://<PC-IP>:8080
```

### 2단계: PC IP 주소 확인

**Windows에서 IP 확인:**
```bash
ipconfig
```
IPv4 주소를 기록합니다 (예: `192.168.1.100`)

### 3단계: iPad에서 접속

Safari 또는 웹 브라우저에서:
```
http://192.168.1.100:8080
```

## 🎮 사용 방법

### 기본 조작

| 버튼 | 기능 | 설명 |
|------|------|------|
| **AP** | 자동 조종 | 자동 조종기 온/오프 |
| **ALT** | 고도 유지 | 현재 고도 유지 모드 |
| **VS** | 수직속도 | 설정 수직속도 유지 |
| **HDG SYNC** | 항향 동기화 | 현재 항향을 설정값으로 |
| **NAV/LOC** | 항법 추적 | 네비게이션/로컬라이저 추적 |
| **APR** | 접근 모드 | ILS 접근 모드 |
| **▲/▼ ALT** | 고도 조정 | 고도 선택값 증가/감소 (±100ft) |
| **▲/▼ VS** | 수직속도 조정 | 수직속도 증가/감소 (±100fpm) |

### 상단 상태 표시줄

- **NAV MODE**: 현재 네비게이션 경로 표시 (Waypoint)
- **LOC/G/S**: 로컬라이저/글라이드 슬로프 상태
  - `ARMED`: 준비 상태
  - `CAPTURE`: 포착됨

### 왼쪽 쓰로틀 표시계

현재 엔진 쓰로틀 위치를 시각적으로 표시

## 🔧 고급 설정

### 환경 변수

`.env` 파일 생성 (선택사항):

```env
PORT=8765
HTTP_PORT=8080
NODE_ENV=production
```

### 포트 변경

기본 포트:
- WebSocket: `8765`
- HTTP: `8080`

포트 변경 시:
```bash
PORT=9000 HTTP_PORT=9001 npm start
```

## 📱 네트워크 연결 문제 해결

### 1. iPad가 PC를 찾을 수 없는 경우

```bash
# PC IP 주소 다시 확인
ipconfig
```

방화벽 설정 확인:
- Windows Defender 방화벽 → 고급 설정
- 인바운드 규칙 → 새 규칙
- 포트 8765, 8080 허용

### 2. WebSocket 연결 실패

PC와 iPad가 같은 WiFi 네트워크에 있는지 확인

### 3. MSFS 데이터를 수신하지 못하는 경우

- MSFS가 실행 중인지 확인
- SimConnect API 설정 확인 (별도 모듈 필요)

## 🏗️ 프로젝트 구조

```
ipad-mini-msfs/
├── index.html          # iPad 웹 인터페이스
├── server.js           # WebSocket 백엔드 서버
├── package.json        # npm 설정
└── README.md           # 이 파일
```

## 📡 API 명세

### 클라이언트 → 서버 (제어 명령)

```json
{
  "action": "AP_TOGGLE"
}
```

### 서버 → 클라이언트 (텔레메트리)

```json
{
  "heading": 120,
  "airspeed": 150,
  "altitude": 5000,
  "target_altitude": 5500,
  "throttle": 75,
  "ap_state": 1,
  "alt_state": 1,
  "vs_state": 0
}
```

## 📝 라이선스

MIT License

## 🤝 기여

버그 보고 및 개선 사항 제안은 GitHub Issues를 통해 해주세요.

---

**개발자**: stillife123  
**마지막 업데이트**: 2026년 5월 30일
