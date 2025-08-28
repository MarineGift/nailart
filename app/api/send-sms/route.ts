// app/api/send-sms/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ---- 공통 JSON 응답 헬퍼 & CORS ----
function json(data: unknown, status = 200, headers: HeadersInit = {}) {
  return new NextResponse(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...headers },
  });
}

const CORS_HEADERS: Record<string, string> = {
  // 필요한 경우 '*' 대신 프론트 도메인으로 제한하세요: 'https://your-domain.com'
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return json({}, 204, CORS_HEADERS);
}

export async function GET() {
  return json({ error: "Method Not Allowed" }, 405, CORS_HEADERS);
}

// ---- 입력 검증 ----
type Payload = { to?: string; body?: string };
// E.164 국제전화번호 형식 (예: +15715318234)
const E164 = /^\+?[1-9]\d{1,14}$/;

export async function POST(req: Request) {
  try {
    const { to, body } = (await req.json()) as Payload;

    if (!to || !body) {
      return json(
        { ok: false, error: "필수 필드 누락: 'to', 'body'가 필요합니다." },
        400,
        CORS_HEADERS
      );
    }
    if (!E164.test(to)) {
      return json(
        { ok: false, error: "전화번호 형식이 올바르지 않습니다. 예: +15715551234 (E.164)" },
        400,
        CORS_HEADERS
      );
    }

    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_PHONE_NUMBER;

    // 환경변수 미설정: 빌드 실패 대신 런타임에서 안전하게 처리
    if (!sid || !token || !from) {
      console.warn("Twilio 환경변수가 설정되지 않았습니다. (mock 응답 반환)");
      return json(
        { ok: false, mocked: true, error: "서버에 Twilio 환경변수가 설정되지 않았습니다." },
        200,
        CORS_HEADERS
      );
    }

    // 빌드 시 평가 방지: 동적 import
    const { default: twilio } = await import("twilio");
    const client = twilio(sid, token);

    const res = await client.messages.create({ to, from, body });

    return json({ ok: true, sid: res.sid }, 200, CORS_HEADERS);
  } catch (err: unknown) {
    const message =
      (typeof err === "object" && err && "message" in err && String((err as any).message)) ||
      "Internal Server Error";
    // 민감정보 노출 방지: 원문 메시지 그대로 로그 출력은 지양
    console.error("SMS send error:", message);
    return json({ ok: false, error: message }, 500, CORS_HEADERS);
  }
}
