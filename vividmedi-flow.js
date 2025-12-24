// vividmedi-flow.js
document.addEventListener("DOMContentLoaded", () => {
  const steps = document.querySelectorAll(".form-section");
  const buttons = document.querySelectorAll(".continue-btn");
  const progressBar = document.querySelector(".progress-bar");

  let currentStep = 0;

  function showStep(index) {
    steps.forEach((step, i) => {
      step.classList.toggle("active", i === index);
    });
    progressBar.style.width = `${((index + 1) / steps.length) * 100}%`;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  buttons.forEach((btn, index) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (index < steps.length - 1) {
        currentStep++;
        showStep(currentStep);
      } else {
        alert("Form completed — next page or submission coming soon!");
      }
    });
  });

  showStep(currentStep);
});
