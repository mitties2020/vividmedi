// ------------------------------
// Helper: get current active section index (DOM truth)
// ------------------------------
function getActiveStepIndex() {
  return Array.from(sections).findIndex((sec) => sec.classList.contains("active"));
}

// ------------------------------
// Continue buttons
// - If user is on Review page (the one that contains #certificatePreview), submit then go to next (Payment)
// ------------------------------
continueButtons.forEach((btn) => {
  btn.addEventListener("click", async () => {
    const activeIndex = getActiveStepIndex();
    console.log("➡️ Continue clicked. Active step index:", activeIndex);

    // Identify the Review step by looking for the preview div inside it
    const isReviewStep = sections[activeIndex]?.querySelector("#certificatePreview");

    try {
      if (isReviewStep) {
        console.log("🧾 Review step detected → submitting now...");
        await submitPatientInfo();

        // Go to the NEXT section (Payment) no matter what its numeric index is
        const nextIndex = Math.min(activeIndex + 1, sections.length - 1);
        console.log("✅ Submit OK → moving to step index:", nextIndex);
        showSection(nextIndex);
        return;
      }

      // Normal next step
      const nextIndex = Math.min(activeIndex + 1, sections.length - 1);
      showSection(nextIndex);
    } catch (e) {
      console.error("❌ Submit error, staying on Review step:", e);
      // stay on current step
      showSection(activeIndex);
    }
  });
});
