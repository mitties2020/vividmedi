// vividmedi-flow.js
document.addEventListener("DOMContentLoaded", () => {
  const steps = document.querySelectorAll(".form-section");
  const progressBar = document.querySelector(".progress-bar");
  let currentStep = 0;

  function showStep(index) {
    steps.forEach((step, i) => step.classList.toggle("active", i === index));
    progressBar.style.width = `${((index + 1) / steps.length) * 100}%`;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Validate date rules
  function validateDates() {
    const from = new Date(document.getElementById("fromDate").value);
    const to = new Date(document.getElementById("toDate").value);
    const today = new Date();
    const dateError = document.getElementById("dateError");

    if (isNaN(from) || isNaN(to)) return false;

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    const diffDays = (to - from) / (1000 * 60 * 60 * 24);

    if (from < sevenDaysAgo) {
      dateError.textContent = "Start date cannot be more than a week before today.";
      dateError.style.display = "block";
      return false;
    } else if (diffDays >= 5) {
      dateError.textContent = "Date range cannot exceed 5 days.";
      dateError.style.display = "block";
      return false;
    } else if (to < from) {
      dateError.textContent = "End date must be after start date.";
      dateError.style.display = "block";
      return false;
    }

    dateError.style.display = "none";
    return true;
  }

  // Update summary before review
  function updateSummary() {
    const summary = document.getElementById("summaryBox");
    summary.innerHTML = `
      <strong>Certificate Type:</strong> ${document.querySelector('input[name="certType"]:checked').value}<br>
      <strong>Reason:</strong> ${document.querySelector('input[name="reason"]:checked').value}<br>
      <strong>From:</strong> ${document.getElementById("fromDate").value}<br>
      <strong>To:</strong> ${document.getElementById("toDate").value}
    `;
  }

  document.querySelectorAll(".continue-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (currentStep === 2 && !validateDates()) return;
      if (currentStep === 6) updateSummary();
      if (currentStep < steps.length - 1) currentStep++;
      showStep(currentStep);
    });
  });

  document.querySelectorAll(".back-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (currentStep > 0) currentStep--;
      showStep(currentStep);
    });
  });

  showStep(currentStep);
});

