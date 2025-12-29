console.log("✅ vividmedi-flow.js loaded (LIVE FRONTEND)");

const sections = document.querySelectorAll(".form-section");
const progressBar = document.querySelector(".progress-bar");
const continueButtons = document.querySelectorAll(".continue-btn:not(#submitBtn)");
const backButtons = document.querySelectorAll(".back-btn");
const paymentLinks = document.querySelectorAll(".payment-option");
const submitBtn = document.getElementById("submitBtn");

const SUBMIT_URL = "https://vividmedi-backend.onrender.com/api/submit";

let currentStep = 0;
let submissionSent = false;
let paymentStarted = false;

// ------------------ UI helpers ------------------
function showSection(index) {
  sections.forEach((sec, i) => sec.classList.toggle("active", i === index));
  if (progressBar) {
    progressBar.style.width = `${((index + 1) / sections.length) * 100}%`;
  }
}
showSection(currentStep);

// ------------------ Toggle Other field ------------------
function toggleOther() {
  const other = document.getElementById("other");
  const field = document.getElementById("otherLeaveField");
  if (!other || !field) return;
  field.style.display = other.checked ? "block" : "none";
}
document.querySelectorAll("input[name='leaveFrom']").forEach(r =>
  r.addEventListener("change", toggleOther)
);
toggleOther();

// ------------------ Build payload ------------------
function buildPayload() {
  return {
    certType: document.querySelector("input[name='certType']:checked")?.value,
    leaveFrom: document.querySelector("input[name='leaveFrom']:checked")?.value,
    otherLeave: document.getElementById("otherLeave")?.value,
    reason: document.querySelector("input[name='reason']:checked")?.value,
    email: document.getElementById("email")?.value,
    firstName: document.getElementById("firstName")?.value,
    lastName: document.getElementById("lastName")?.value,
    dob: document.getElementById("dob")?.value,
    mobile: document.getElementById("mobile")?.value,
    gender: document.querySelector("input[name='gender']:checked")?.value,
    address: document.getElementById("address")?.value,
    city: document.getElementById("city")?.value,
    state: document.getElementById("state")?.value,
    postcode: document.getElementById("postcode")?.value,
    fromDate: document.getElementById("fromDate")?.value,
    toDate: document.getElementById("toDate")?.value,
    symptoms: document.getElementById("symptoms")?.value,
    doctorNote: document.getElementById("doctorNote")?.value,
  };
}

// ------------------ Submit once (STEP 7) ------------------
async function submitOnce() {
  if (submissionSent) return;

  const payload = buildPayload();

  if (!payload.email || !payload.firstName || !payload.lastName || !payload.fromDate || !payload.toDate) {
    alert("❌ Please complete all required fields.");
    throw new Error("Missing required fields");
  }

  const res = await fetch(SUBMIT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok || !data.success) {
    alert("❌ Submission failed. Please try again.");
    throw new Error("Submit failed");
  }

  submissionSent = true;
  console.log("✅ Patient info emailed & stored:", data);
}

// ------------------ Continue buttons ------------------
continueButtons.forEach(btn => {
  btn.addEventListener("click", async () => {
    // Step index:
    // 0–5 normal, 6 = REVIEW, 7 = PAYMENT
    if (currentStep === 6) {
      try {
        await submitOnce();
      } catch {
        return;
      }
    }
    if (currentStep < sections.length - 1) {
      currentStep++;
      showSection(currentStep);
    }
  });
});

// ------------------ Back buttons ------------------
backButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    currentStep = Math.max(0, currentStep - 1);
    showSection(currentStep);
  });
});

// ------------------ Payment tracking ------------------
paymentLinks.forEach(link => {
  link.addEventListener("click", () => {
    paymentStarted = true;
  });
});

// ------------------ Final Submit ------------------
if (submitBtn) {
  submitBtn.addEventListener("click", e => {
    e.preventDefault();
    if (!paymentStarted) {
      alert("⚠️ Please select a payment option first.");
      return;
    }
    currentStep++;
    showSection(currentStep);
  });
}
