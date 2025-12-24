// vividmedi-flow.js
document.addEventListener("DOMContentLoaded", () => {
  const steps = document.querySelectorAll(".form-section");
  const progressBar = document.querySelector(".progress-bar");
  let currentStep = 0;

  function updateProgress() {
    const percent = ((currentStep + 1) / steps.length) * 100;
    progressBar.style.width = `${percent}%`;
  }

  function showStep(index) {
    steps.forEach((step, i) => {
      step.classList.toggle("active", i === index);
    });
    updateProgress();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  document.querySelectorAll(".continue-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (currentStep < steps.length - 1) {
        currentStep++;
        showStep(currentStep);
      } else {
        alert("Your details will now be sent to an AHPRA-registered doctor for review.");
      }
    });
  });

  document.querySelectorAll(".back-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (currentStep > 0) {
        currentStep--;
        showStep(currentStep);
      }
    });
  });

  // Initialize
  showStep(currentStep);
});

