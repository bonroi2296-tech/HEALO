/**
 * HEALO: 병원 리드 관리 헬퍼 스크립트
 * 
 * 사용법:
 * ```bash
 * # 우선순위 리드 조회
 * npx tsx scripts/hospital-lead-helper.ts list-priority
 * 
 * # 리드 요약 생성
 * npx tsx scripts/hospital-lead-helper.ts generate-summary 123
 * 
 * # 전달 기록 추가
 * npx tsx scripts/hospital-lead-helper.ts record-sent 123 "Seoul Plastic Surgery" email
 * 
 * # 응답 대기 리드 확인
 * npx tsx scripts/hospital-lead-helper.ts list-pending
 * 
 * # 응답 업데이트
 * npx tsx scripts/hospital-lead-helper.ts update-response 1 interested "상담 가능"
 * ```
 */

import { supabaseAdmin } from "../src/lib/rag/supabaseAdmin";
import { 
  generateHospitalLeadSummary, 
  generateHospitalLeadEmail 
} from "../src/lib/hospital/leadSummary";

/**
 * 우선순위 리드 조회
 */
async function listPriorityLeads() {
  console.log("\n🔥 우선순위 리드 (Hot Leads)\n");

  const { data, error } = await supabaseAdmin
    .from("inquiries")
    .select("id, created_at, lead_quality, priority_score, nationality, treatment_type, email")
    .eq("lead_quality", "hot")
    .eq("status", "received")
    .order("priority_score", { ascending: false })
    .limit(10);

  if (error) {
    console.error("❌ Error:", error.message);
    return;
  }

  if (!data || data.length === 0) {
    console.log("ℹ️  현재 우선순위 리드가 없습니다.");
    return;
  }

  console.table(
    data.map((lead) => ({
      ID: lead.id,
      점수: lead.priority_score,
      국가: lead.nationality,
      시술: lead.treatment_type,
      날짜: new Date(lead.created_at).toLocaleDateString("ko-KR"),
    }))
  );

  console.log(`\n✅ 총 ${data.length}건의 우선순위 리드가 있습니다.\n`);
}

/**
 * 리드 요약 생성
 */
async function generateSummary(inquiryId: number, hospitalName?: string) {
  console.log(`\n📋 리드 #${inquiryId} 요약 생성 중...\n`);

  const summary = await generateHospitalLeadSummary(inquiryId);

  if (!summary) {
    console.error("❌ 리드를 찾을 수 없습니다.");
    return;
  }

  console.log("=== 기본 정보 ===");
  console.log(`리드 번호: #${summary.leadId}`);
  console.log(`우선순위: ${summary.priority}`);
  console.log(`접수 시각: ${new Date(summary.receivedAt).toLocaleString("ko-KR")}`);
  console.log();

  console.log("=== 환자 정보 ===");
  console.log(`국적: ${summary.patient.nationality}`);
  console.log(`언어: ${summary.patient.spokenLanguage}`);
  console.log(`연락: ${summary.patient.contactMethod || "미제공"}`);
  console.log();

  console.log("=== 시술 정보 ===");
  console.log(`타입: ${summary.treatment.type}`);
  if (summary.treatment.bodyPart) {
    console.log(`부위: ${summary.treatment.bodyPart}`);
  }
  if (summary.treatment.severity) {
    console.log(`심각도: ${summary.treatment.severity}/10`);
  }
  console.log();

  console.log("=== 품질 지표 ===");
  console.log(`완성도: ${summary.qualityIndicators.completeness}%`);
  console.log(`진지도: ${summary.qualityIndicators.confidence}%`);
  console.log(`응답: ${summary.qualityIndicators.responseTime}`);
  console.log();

  // 병원 이름이 제공되면 이메일 생성
  if (hospitalName) {
    const email = generateHospitalLeadEmail(summary, hospitalName);
    console.log("=== 이메일 템플릿 ===");
    console.log(`제목: ${email.subject}\n`);
    console.log(email.plainText);
    console.log("\n✅ 위 내용을 복사하여 이메일/카톡으로 전송하세요.\n");
  } else {
    console.log("💡 이메일 템플릿 생성: generate-summary <id> <병원명>\n");
  }
}

/**
 * 전달 기록 추가
 */
async function recordSent(
  inquiryId: number,
  hospitalName: string,
  method: string,
  sentBy?: string
) {
  console.log(`\n📤 리드 #${inquiryId} 전달 기록 중...\n`);

  const { data, error } = await supabaseAdmin
    .from("hospital_responses")
    .insert({
      inquiry_id: inquiryId,
      hospital_name: hospitalName,
      sent_method: method,
      sent_by: sentBy || "운영자",
      response_status: "pending",
    })
    .select()
    .single();

  if (error) {
    console.error("❌ Error:", error.message);
    return;
  }

  console.log("✅ 전달 기록 완료!");
  console.log(`   - Response ID: ${data.id}`);
  console.log(`   - 병원: ${hospitalName}`);
  console.log(`   - 방법: ${method}`);
  console.log(`   - 상태: pending (응답 대기)\n`);
}

/**
 * 응답 대기 리드 확인
 */
async function listPendingResponses() {
  console.log("\n⏳ 응답 대기 중인 리드\n");

  const { data, error } = await supabaseAdmin.rpc(
    "get_pending_responses_with_wait_time"
  ).catch(async () => {
    // 함수가 없으면 직접 쿼리
    return await supabaseAdmin
      .from("hospital_responses")
      .select(`
        id,
        inquiry_id,
        hospital_name,
        sent_at,
        sent_method,
        inquiries!inner(lead_quality, priority_score, nationality, treatment_type)
      `)
      .eq("response_status", "pending")
      .order("sent_at", { ascending: true })
      .limit(20);
  });

  if (error) {
    console.error("❌ Error:", error.message);
    return;
  }

  if (!data || data.length === 0) {
    console.log("ℹ️  현재 응답 대기 중인 리드가 없습니다.");
    return;
  }

  console.table(
    data.map((response: any) => {
      const sentAt = new Date(response.sent_at);
      const hoursWaiting = Math.floor((Date.now() - sentAt.getTime()) / 3600000);

      return {
        "Response ID": response.id,
        "리드 ID": response.inquiry_id,
        병원: response.hospital_name,
        "대기 시간": `${hoursWaiting}시간`,
        전송일: sentAt.toLocaleDateString("ko-KR"),
      };
    })
  );

  console.log(`\n✅ 총 ${data.length}건 응답 대기 중\n`);
}

/**
 * 응답 업데이트
 */
async function updateResponse(
  responseId: number,
  status: string,
  notes?: string
) {
  console.log(`\n🔄 Response #${responseId} 업데이트 중...\n`);

  const updateData: any = {
    response_status: status,
    response_at: new Date().toISOString(),
  };

  if (notes) {
    updateData.response_notes = notes;
  }

  const { data, error } = await supabaseAdmin
    .from("hospital_responses")
    .update(updateData)
    .eq("id", responseId)
    .select()
    .single();

  if (error) {
    console.error("❌ Error:", error.message);
    return;
  }

  console.log("✅ 업데이트 완료!");
  console.log(`   - Response ID: ${data.id}`);
  console.log(`   - 상태: ${status}`);
  if (notes) {
    console.log(`   - 메모: ${notes}`);
  }
  console.log();
}

/**
 * 병원 통계 확인
 */
async function showStats() {
  console.log("\n📊 병원별 통계\n");

  const { data, error } = await supabaseAdmin
    .from("hospital_responses")
    .select("hospital_name, response_status");

  if (error) {
    console.error("❌ Error:", error.message);
    return;
  }

  if (!data || data.length === 0) {
    console.log("ℹ️  데이터가 없습니다.");
    return;
  }

  const stats = new Map<string, any>();

  data.forEach((response) => {
    if (!stats.has(response.hospital_name)) {
      stats.set(response.hospital_name, {
        total: 0,
        interested: 0,
        not_interested: 0,
        pending: 0,
      });
    }

    const stat = stats.get(response.hospital_name);
    stat.total += 1;

    if (response.response_status === "interested") {
      stat.interested += 1;
    } else if (response.response_status === "not_interested") {
      stat.not_interested += 1;
    } else if (response.response_status === "pending") {
      stat.pending += 1;
    }
  });

  const tableData = Array.from(stats.entries()).map(([name, stat]) => ({
    병원: name,
    "총 리드": stat.total,
    "관심 있음": stat.interested,
    "관심 없음": stat.not_interested,
    대기중: stat.pending,
    "관심률(%)": ((stat.interested / stat.total) * 100).toFixed(1),
  }));

  console.table(tableData);
  console.log();
}

/**
 * 사용법 표시
 */
function showUsage() {
  console.log(`
HEALO 병원 리드 관리 도구

사용법:
  npx tsx scripts/hospital-lead-helper.ts <명령> [옵션]

명령:
  list-priority                              우선순위 리드 조회
  generate-summary <id> [병원명]              리드 요약 생성
  record-sent <id> <병원명> <방법> [운영자]    전달 기록
  list-pending                               응답 대기 리드
  update-response <response_id> <상태> [메모]  응답 업데이트
  stats                                      병원 통계

예시:
  npx tsx scripts/hospital-lead-helper.ts list-priority
  npx tsx scripts/hospital-lead-helper.ts generate-summary 123 "Seoul Plastic Surgery"
  npx tsx scripts/hospital-lead-helper.ts record-sent 123 "Seoul Plastic" email "홍길동"
  npx tsx scripts/hospital-lead-helper.ts update-response 1 interested "상담 가능"

응답 상태:
  pending, interested, not_interested, contacted, consultation,
  quoted, booked, completed, cancelled
  `);
}

/**
 * 메인 실행
 */
async function main() {
  const command = process.argv[2];
  const args = process.argv.slice(3);

  try {
    switch (command) {
      case "list-priority":
        await listPriorityLeads();
        break;

      case "generate-summary":
        if (!args[0]) {
          console.error("❌ 리드 ID가 필요합니다.");
          showUsage();
          process.exit(1);
        }
        await generateSummary(parseInt(args[0]), args[1]);
        break;

      case "record-sent":
        if (!args[0] || !args[1] || !args[2]) {
          console.error("❌ 리드 ID, 병원명, 전송 방법이 필요합니다.");
          showUsage();
          process.exit(1);
        }
        await recordSent(parseInt(args[0]), args[1], args[2], args[3]);
        break;

      case "list-pending":
        await listPendingResponses();
        break;

      case "update-response":
        if (!args[0] || !args[1]) {
          console.error("❌ Response ID와 상태가 필요합니다.");
          showUsage();
          process.exit(1);
        }
        await updateResponse(parseInt(args[0]), args[1], args[2]);
        break;

      case "stats":
        await showStats();
        break;

      default:
        showUsage();
        break;
    }

    process.exit(0);
  } catch (error: any) {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  }
}

// 실행
if (require.main === module) {
  main();
}
