/* OFF-AIR 인플루언서 모니터링 · 열람/행동 로거
 * - 최초 1회 열람자 이름 확인(이름 게이트) → 브라우저에 기억
 * - 페이지 열람 + 페이지 내 행동(탭·인플루언서 열람·필터·검색)을 로그로 전송
 * - 전송 대상: window.OFFAIR_LOG.endpoint (Apps Script 웹앱 URL)
 * - endpoint 미설정 시 아무 동작도 안 함(사이트 정상)  */
(function () {
  var CFG = window.OFFAIR_LOG || {};
  var EP = (CFG.endpoint || "").trim();
  var TEAM = CFG.team || [];
  var LS_KEY = "offair_viewer";

  if (!EP) return; // 엔드포인트 미설정 → 로깅 비활성(가입/배포 전에는 조용히 꺼짐)

  function getViewer() { try { return localStorage.getItem(LS_KEY) || "(미지정)"; } catch (e) { return "(미지정)"; } }
  function setViewer(v) { try { localStorage.setItem(LS_KEY, v); } catch (e) {} }

  function send(type, detail) {
    var payload = {
      t: new Date().toISOString(),
      viewer: getViewer(),
      page: (location.pathname.split("/").pop() || "index"),
      type: type,
      detail: detail || "",
      ref: document.referrer || "",
      ua: navigator.userAgent,
      w: screen.width, h: screen.height
    };
    var body = JSON.stringify(payload);
    try {
      var blob = new Blob([body], { type: "text/plain;charset=UTF-8" });
      if (navigator.sendBeacon && navigator.sendBeacon(EP, blob)) return;
    } catch (e) {}
    try { fetch(EP, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=UTF-8" }, body: body, keepalive: true }); } catch (e) {}
  }
  window.olog = send; // 다른 코드에서 window.olog('export','pdf') 처럼 직접 호출 가능

  // ── 이름 게이트(최초 1회) ────────────────────────────────
  function gate(next) {
    var cur = null; try { cur = localStorage.getItem(LS_KEY); } catch (e) {}
    if (cur) { next(); return; }
    var ov = document.createElement("div");
    ov.style.cssText = "position:fixed;inset:0;background:rgba(22,22,22,.55);z-index:99999;display:flex;align-items:center;justify-content:center;font-family:'IBM Plex Sans','Malgun Gothic',sans-serif";
    var opts = (TEAM || []).map(function (n) { return '<option value="' + n + '">' + n + "</option>"; }).join("");
    var box = document.createElement("div");
    box.style.cssText = "background:#fff;padding:24px;width:320px;max-width:90%;box-shadow:0 4px 24px rgba(0,0,0,.25)";
    box.innerHTML =
      '<div style="font-size:15px;font-weight:600;margin-bottom:4px">열람자 확인</div>' +
      '<div style="font-size:12px;color:#6f6f6f;margin-bottom:14px;line-height:1.5">이름을 선택하거나 입력해 주세요.<br>열람 기록에 사용됩니다.</div>' +
      (TEAM.length ? '<select id="_ovs" style="width:100%;height:38px;margin-bottom:8px;border:1px solid #e0e0e0;padding:0 8px;font-family:inherit"><option value="">— 선택 —</option>' + opts + "</select>" : "") +
      '<input id="_ovi" placeholder="이름 직접 입력" autocomplete="off" style="width:100%;height:38px;margin-bottom:12px;border:1px solid #e0e0e0;padding:0 10px;box-sizing:border-box;font-family:inherit;font-size:14px">' +
      '<button id="_ovg" style="width:100%;height:40px;background:#0f62fe;color:#fff;border:none;cursor:pointer;font-size:14px;font-family:inherit">확인</button>';
    ov.appendChild(box); document.body.appendChild(ov);
    var sel = box.querySelector("#_ovs"), inp = box.querySelector("#_ovi"), go = box.querySelector("#_ovg");
    if (sel) sel.addEventListener("change", function () { if (sel.value) inp.value = sel.value; });
    function submit() {
      var v = (inp.value || (sel && sel.value) || "").trim();
      if (!v) { inp.focus(); return; }
      setViewer(v); document.body.removeChild(ov); next();
    }
    go.addEventListener("click", submit);
    inp.addEventListener("keydown", function (e) { if (e.key === "Enter") submit(); });
    setTimeout(function () { inp.focus(); }, 50);
  }

  // ── 행동 이벤트(위임 클릭 + 몇몇 입력) ───────────────────
  function bindEvents() {
    document.addEventListener("click", function (e) {
      var el = e.target && e.target.closest ? e.target.closest(".tab,.crow,.tgb,.swt,.sw,[data-log]") : null;
      if (!el) return;
      if (el.matches("[data-log]")) send("action", el.getAttribute("data-log"));
      else if (el.matches(".tab")) send("tab", el.textContent.trim());
      else if (el.matches(".crow")) { var nm = el.querySelector(".cname"); send("open_influencer", nm ? nm.textContent.trim() : ""); }
      else if (el.matches(".tgb")) send("period", el.textContent.trim());
      else if (el.matches(".swt")) send("type_filter", el.textContent.trim());
      else if (el.matches(".sw")) send("contract_filter", el.textContent.trim());
    }, true);

    var sel = document.getElementById("sel"); // 리포트 인플루언서 선택
    if (sel) sel.addEventListener("change", function () {
      var o = sel.options[sel.selectedIndex];
      send("select_influencer", o ? o.textContent.trim() : sel.value);
    });
    var srch = document.getElementById("search"); // 현황판 검색(디바운스)
    if (srch) { var tmr; srch.addEventListener("input", function () { clearTimeout(tmr); tmr = setTimeout(function () { if (srch.value.trim()) send("search", srch.value.trim()); }, 900); }); }
  }

  function init() { gate(function () { send("pageview"); bindEvents(); }); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
