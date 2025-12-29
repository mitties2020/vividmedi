// vividmedi-flow.js — stable step flow + submit on Review (Step 7) Continue
console.log("✅ vividmedi-flow.js loaded (stable)");

// ------------------------------
// DOM
// ------------------------------
const sections = document.querySelectorAll(".form-section");
const progressBar = document.querySelector(".progress-bar");
const continueButtons = document.querySelectorAll(".continue-btn"); // include all continues
const backButtons = document.querySelectorAll(".back-btn");

// Support both styles:
// - <button class="payment-btn" data-link="...">
// - <a class="payment-option" href="...">
const paymentTriggers = document.querySelectorAll(".payment-btn, .payment-option");

const squareFrameContainer = document.getElementById("squareFrameContainer");
const squareCheckoutFrame = document.getElementById("squareCheckoutFrame");

// ✅ Your Render backend submit endpoint
const SUBMIT_URL = "https://vividmedi-backend.onrender.com/api/submit";

// State
let submissionSent = false;
let submissionResponse = null;

// ------------------------------
// Overlay
// ------------------------------
const overlay = document.createElement("div");
overlay.style.cssText = `
  position: fixed;
  top:0;left:0;width:100%;height:100%;
  background:rgba(255,255,255,0.85);
  display:none;
  align-items:center;
  justify-content:center;
  font-size:1.1rem;
  color:#111;
  z-index:9999;
  text-align:center;
  padding:20px;
`;
overlay.textContent = "Working...";
document.body.appendChild(overlay);

function showOverlay(msg) {
  overlay.textContent = msg || "Working...";
  overlay.style.display = "flex";
}
function hideOverlay() {
  overlay.style.display = "none";
}

// ------------------------------
// Step helpers
// ------------------------------
function getActiveStepIndex() {
  return Array.from(sections).findIndex((sec) => sec.classList.contains("active"));
}

function showSection(index) {
  sections.forEach((sec, i) => sec.classList.toggle("active", i === index));
  if (progressBar) progressBar.style.width = `${((index + 1) / sections.length) * 100}%`;
}

// Init to first section
showSection(0);

// ------------------------------
// Optional: show/hide Other leave field
// ------------------------------
function updateOtherLeaveField() {
  const otherRadio = document.getElementById("other");
  const field = document.getElementById("otherLeaveField");
  if (!otherRadio || !field) return;
  field.style.display = otherRadio.checked ? "block" : "none";
}
document.querySelectorAll("input[name='leaveFrom']").forEach((r) => {
  r.addEventListener("change", updateOtherLeaveField);
});
updateOtherLeaveField();

// ------------------------------
// Build payload (THIS is what your backend receives)
// ------------------------------
function buildPayload() {
  return {
    certType: document.querySelector("input[name='certType']:checked")?.value || "",
    leaveFrom: document.querySelector("input[name='leaveFrom']:checked")?.value || "",
    otherLeave: document.getElementById("otherLeave")?.value || "",
    reason: document.querySelector("input[name='reason']:checked")?.value || "",

    email: document.getElementById("email")?.value || "",
    firstName: document.getElementById("firstName")?.value || "",
    lastName: document.getElementById("lastName")?.value || "",
    dob: document.getElementById("dob")?.value || "",
    mobile: document.getElementById("mobile")?.value || "",
    gender: document.querySelector("input[name='gender']:checked")?.value || "",

    address: document.getElementById("address")?.value || "",
    city: document.getElementById("city")?.value || "",
    state: document.getElementById("state")?.value || "",
    postcode: document.getElementById("postcode")?.value || "",

    fromDate: document.getElementById("fromDate")?.value || "",
    toDate: document.getElementById("toDate")?.value || "",

    symptoms: document.getElementById("symptoms")?.value || "",
    doctorNote: document.getElementById("doctorNote")?.value || "",
  };
}

// ------------------------------
// Minimal required validation
// ------------------------------
function missingRequired(p) {
  const required = [
    "email",
    "firstName",
    "lastName",
    "dob",
    "mobile",
    "gender",
    "address",
    "city",
    "state",
    "postcode",
    "fromDate",
    "toDate",
  ];
  return required.filter((k) => !p[k]);
}

// ------------------------------
// Submit patient info (called on Review page Continue)
// ------------------------------
async function submitPatientInfoOnce() {
  if (submissionSent && submissionResponse) return submissionResponse;

  const payload = buildPayload();
  const missing = missingRequired(payload);
  if (missing.length) {
    alert("Please complete all required fields before continuing.");
    throw new Error("Missing required fields: " + missing.join(", "));
  }

  showOverlay("Submitting your details…");

  // Hard timeout so you never get stuck
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(SUBMIT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data?.success) {
      console.error("❌ Submit failed:", res.status, data);
      alert("❌ Submission failed. Please try again.");
      throw new Error("Submit failed");
    }

    submissionSent = true;
    submissionResponse = data;

    console.log("✅ Submission success:", data);
    return data;
  } catch (err) {
    console.error("❌ Submit error:", err);
    if (err.name === "AbortError") {
      alert("⚠️ Submission timed out. Please click Continue again.");
    } else {
      alert("❌ Could not submit details. Please try again.");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
    hideOverlay();
  }
}

// ------------------------------
// Continue buttons
// - Normal steps: go next
// - Review step (Step 7): submit THEN go next (Payment)
// ------------------------------
continueButtons.forEach((btn) => {
  btn.addEventListener("click", async (e) => {
    const activeIndex = getActiveStepIndex();
    if (activeIndex === -1) return;

    const activeSection = sections[activeIndex];

    // Identify Review step by presence of #certificatePreview in that section
    const isReviewStep = !!activeSection.querySelector("#certificatePreview");

    // If this is the Submit button on payment page (id="submitBtn"), don’t use Continue handler
    if (btn.id === "submitBtn") return;

    try {
      if (isReviewStep) {
        // Submit once on Review->Continue
        await submitPatientInfoOnce();
      }

      // Always move to next step
      const nextIndex = Math.min(activeIndex + 1, sections.length - 1);
      showSection(nextIndex);
    } catch (err) {
      // stay on current section
      showSection(activeIndex);
    }
  });
});

// ------------------------------
// Back buttons
// ------------------------------
backButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const activeIndex = getActiveStepIndex();
    if (activeIndex === -1) return;
    showSection(Math.max(0, activeIndex - 1));
  });
});

// ------------------------------
// Payment trigger behaviour
// - If iframe exists, embed
// - Otherwise open new tab
// ------------------------------
paymentTriggers.forEach((el) => {
  el.addEventListener("click", (e) => {
    // For <a>, stop navigation so we can control embedding
    e.preventDefault();

    let link = "";
    if (el.classList.contains("payment-btn")) {
      link = el.getAttribute("data-link") || "";
    } else {
      // payment-option <a>
      link = el.getAttribute("href") || "";
    }

    if (!link) return;

    if (squareFrameContainer && squareCheckoutFrame) {
      squareCheckoutFrame.src = link;
      squareFrameContainer.style.display = "block";
      squareFrameContainer.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    window.open(link, "_blank", "noopener,noreferrer");
  });
});

// ------------------------------
// If you still have a payment "Submit" button on Step 8,
// you can optionally make it go to Thank You page:
// ------------------------------
const submitBtn = document.getElementById("submitBtn");
if (submitBtn) {
  submitBtn.addEventListener("click", () => {
    const activeIndex = getActiveStepIndex();
    if (activeIndex === -1) return;
    const nextIndex = Math.min(activeIndex + 1, sections.length - 1);
    showSection(nextIndex);
  });
}
