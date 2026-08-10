/* 열람 로그 설정
 * 1) 구글 스프레드시트 만들고, 확장 프로그램 > Apps Script 에 Code.gs 붙여넣기
 * 2) 배포 > 새 배포 > 웹 앱 > 액세스 "모든 사용자" 로 배포 → 웹앱 URL 복사
 * 3) 아래 endpoint 에 그 URL 붙여넣기 (예: https://script.google.com/macros/s/XXXX/exec)
 * 4) endpoint 가 비어 있으면 로깅은 꺼진 상태(사이트는 정상 동작)          */
window.OFFAIR_LOG = {
  endpoint: "https://script.google.com/macros/s/AKfycby8HeUMCDudERtBrlRzROn1CgJAOTHxphhPBY92_1qehkJ_Mf1nra0rTlnmU3alJFXJ/exec",              /* ← 여기에 Apps Script 웹앱 URL 붙여넣기 */
  team: []                   /* ← 열람자 이름 목록(선택). 예: ["대표","안지환","김담당"]  비워두면 직접 입력만 */
};
