# ConnieNail - 럭셔리 네일샵 관리 시스템

## 프로젝트 개요

ConnieNail은 Washington, DC에 위치한 프리미엄 네일 살롱을 위한 종합적인 관리 플랫폼입니다. Next.js 14와 TypeScript를 기반으로 구축된 풀스택 웹 애플리케이션으로, 예약 관리, 고객 관리, 직원 배정, 결제 처리 등의 기능을 제공합니다.

## 주요 기능

### 🎯 핵심 관리 기능
- **예약 관리**: 실시간 예약 시스템과 캘린더 통합
- **고객 관리**: VIP 등급별 고객 정보 및 이력 관리
- **직원 관리**: 스케줄링, 스킬 매칭, 성과 추적
- **서비스 관리**: 동적 서비스 카탈로그와 가격 책정
- **결제 처리**: Stripe를 통한 안전한 결제 시스템
- **분석 대시보드**: 매출, 예약, 직원 성과 분석

### 👤 역할별 접근 권한
- **관리자**: 모든 기능에 대한 전체 접근
- **매니저**: 일일 운영 및 직원 관리
- **직원**: 개인 스케줄 및 할당된 고객 관리
- **고객**: 예약 및 개인 정보 관리

## 시스템 요구사항

- Node.js 18+ 
- PostgreSQL 데이터베이스
- Stripe 계정 (결제 처리용)
- SendGrid 계정 (이메일 발송용)

## 설치 및 설정

### 1. 프로젝트 클론
```bash
git clone <repository-url>
cd connienail-salon
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
`.env.local` 파일을 생성하고 다음 환경 변수를 설정하세요:

```env
# 데이터베이스
DATABASE_URL=postgresql://username:password@host:port/database

# Stripe 설정
STRIPE_SECRET_KEY=sk_test_...
VITE_STRIPE_PUBLIC_KEY=pk_test_...

# SendGrid 설정 
SENDGRID_API_KEY=SG....

# Twilio 설정 (SMS 알림용)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...
```

### 4. 데이터베이스 설정
```bash
npm run db:push
```

### 5. 개발 서버 실행
```bash
npm run dev
```

애플리케이션이 `http://localhost:5000`에서 실행됩니다.

## 사용자 가이드

### 로그인 정보

**관리자 계정:**
- 사용자명: admin
- 비밀번호: admin123

**매니저 계정:**
- 사용자명: manager
- 비밀번호: manager123

**직원 계정:**
- 사용자명: staff
- 비밀번호: staff123

### 대시보드 사용법

#### 1. 관리자 대시보드
**Dashboard 탭:**
- 일일 예약 현황 및 통계 확인
- 수익 분석 및 고객 동향 파악
- 직원 근무 현황 모니터링

**Assignment 탭:**
- 미배정 예약을 직원에게 할당
- 실시간 예약 상태 관리
- Y/N 그리드를 통한 시간대별 예약 현황

**Booking 탭:**
- 새로운 예약 생성 및 관리
- 예약 상태 변경 (확정/대기/완료/취소)
- 고객별 예약 이력 조회

**Calendar 탭:**
- 월별/주별 예약 캘린더 보기
- 드래그 앤 드롭으로 예약 이동
- 직원별 스케줄 확인

**Customers 탭:**
- 고객 정보 관리 (이름, 연락처, VIP 등급)
- 고객 예약 이력 및 선호 서비스
- VIP 등급별 혜택 관리

**Staff 탭:**
- 직원 정보 및 스케줄 관리
- 스킬셋 및 전문 분야 설정
- 근무 시간 및 휴가 관리

**CRM 탭:**
- 고객 관계 관리 도구
- 마케팅 캠페인 추적
- 고객 피드백 관리

**Payments 탭:**
- 결제 내역 및 분석
- 환불 처리
- 매출 보고서 생성

**Treatment 탭:**
- 시술 기록 관리
- 서비스별 통계
- 직원별 시술 이력

**Inquiries 탭:**
- 고객 문의 관리
- 예약 변경 요청 처리
- 피드백 응답

**Settings 탭:**
- 시스템 설정
- 할인 정책 관리
- 서비스 가격 설정
- **Carousel 관리**: 홈페이지 이미지 슬라이더 관리

#### 2. 직원 사용법

**개인 스케줄 확인:**
1. 로그인 후 자동으로 직원 대시보드로 이동
2. 오늘의 예약 일정 확인
3. 할당된 고객 정보 조회

**예약 처리:**
1. 예약 카드 클릭으로 상세 정보 확인
2. 시술 상태 업데이트 (진행중/완료)
3. 고객 노트 추가

#### 3. 예약 Assignment 시스템

**미배정 예약 처리:**
1. Assignment 탭에서 미배정 예약 목록 확인
2. "Assign Staff" 버튼 클릭
3. 적절한 직원 선택 후 배정

**Y/N 그리드 사용법:**
- **초록색 Y**: 해당 시간대 예약 가능 (클릭 시 새 예약 생성)
- **빨간색 N**: 해당 시간대 예약 있음 (클릭 시 기존 예약 조회/수정)

### 고객 예약 플로우

1. **고객 정보 입력**
   - 이름, 전화번호 필수 입력
   - 기존 고객 자동 인식

2. **서비스 선택**
   - 다중 서비스 선택 가능
   - 실시간 가격 계산

3. **날짜/시간 선택**
   - 직원 가용성 기반 시간 제안
   - 즉시 예약 확정

4. **결제 처리**
   - Stripe를 통한 안전한 카드 결제
   - 선불 또는 후불 선택

## 주요 컴포넌트 설명

### 1. AdminDashboardOverview
- 전체 살롱 운영 현황을 한눈에 보여주는 메인 대시보드
- 실시간 통계 및 KPI 표시

### 2. EnhancedAssignmentInterface  
- 직원-고객 매칭 시스템
- 실시간 예약 상태 모니터링
- Y/N 그리드를 통한 직관적 인터페이스

### 3. AdminBookingCalendar
- 월별/주별 예약 캘린더
- 드래그 앤 드롭 예약 이동
- 다중 필터링 옵션

### 4. CustomerSheetManagement
- 종합 고객 관리 시스템
- VIP 등급 관리
- 고객 이력 추적

### 5. StaffManagement
- 직원 정보 및 스케줄 관리
- 스킬셋 매칭 시스템
- 성과 분석 도구

## 데이터베이스 구조

### 주요 테이블

**customers**
- 고객 기본 정보 (이름, 연락처, VIP 등급)
- 방문 이력 및 선호 서비스

**bookings**
- 예약 정보 (날짜, 시간, 상태)
- 고객-직원-서비스 연결

**staff**
- 직원 정보 및 스케줄
- 스킬셋 및 전문 분야

**services**
- 서비스 카탈로그
- 가격 및 소요 시간

**treatments**
- 실제 시술 기록
- 결제 정보 및 노트

## API 엔드포인트

### 예약 관리
- `GET /api/bookings` - 예약 목록 조회
- `POST /api/bookings` - 새 예약 생성
- `PUT /api/bookings/{id}` - 예약 정보 수정
- `DELETE /api/bookings/{id}` - 예약 취소

### 고객 관리
- `GET /api/customers` - 고객 목록 조회
- `POST /api/customers` - 새 고객 등록
- `PUT /api/customers/{id}` - 고객 정보 수정

### 직원 관리
- `GET /api/staff` - 직원 목록 조회
- `GET /api/staff?date={date}` - 특정 날짜 근무 직원

### 서비스 관리
- `GET /api/services` - 서비스 목록 조회
- `POST /api/services` - 새 서비스 추가

### 결제 처리
- `POST /api/create-payment-intent` - 결제 인텐트 생성
- `POST /api/get-or-create-subscription` - 구독 결제

## 기술 스택

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui + Radix UI
- **State Management**: React Hooks
- **Date Handling**: date-fns

### Backend
- **API**: Next.js API Routes
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM (SQL-only, NO Drizzle ORM per user request)
- **Authentication**: Context-based auth with role management

### External Services
- **Payment**: Stripe
- **Email**: SendGrid
- **SMS**: Twilio
- **Database**: Supabase (PostgreSQL hosting)

## 보안 기능

- 역할 기반 접근 제어 (RBAC)
- PCI 준수 결제 처리
- SQL 인젝션 방지
- XSS 보호
- CSRF 토큰 validation

## 성능 최적화

- Next.js Image Optimization
- 코드 스플리팅
- 지연 로딩 (Lazy Loading)
- 데이터베이스 인덱싱
- CDN 이미지 서빙

## 개발자 도구

### 디버깅
```bash
npm run dev  # 개발 서버 (HMR 포함)
npm run build  # 프로덕션 빌드
npm run start  # 프로덕션 서버
```

### 데이터베이스 관리
```bash
npm run db:push  # 스키마 변경사항 푸시
npm run db:studio  # Drizzle Studio 실행
```

### 코드 품질
```bash
npm run lint  # ESLint 실행
npm run type-check  # TypeScript 검사
```

## 배포

### 환경 설정
1. 프로덕션 데이터베이스 설정
2. 환경 변수 구성
3. SSL 인증서 설치
4. CDN 설정

### Vercel 배포 (권장)
```bash
vercel --prod
```

### Docker 배포
```bash
docker build -t connienail .
docker run -p 3000:3000 connienail
```

## 문제 해결

### 일반적인 문제

**데이터베이스 연결 오류:**
- DATABASE_URL 환경 변수 확인
- 데이터베이스 접근 권한 검토
- 방화벽 설정 확인

**결제 처리 오류:**
- Stripe 키 설정 확인
- 테스트/라이브 모드 구분
- Webhook 엔드포인트 설정

**이메일 발송 실패:**
- SendGrid API 키 검증
- 발신자 이메일 인증
- 스팸 필터 확인

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 연락처

프로젝트 관련 문의사항이 있으시면 다음으로 연락주세요:
- 개발팀: dev@connienail.com
- 지원팀: support@connienail.com

---

**마지막 업데이트:** 2025년 8월 22일  
**버전:** v1.0.0  
**개발자:** ConnieNail Development Team