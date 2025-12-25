document.addEventListener("DOMContentLoaded", () => {
  const steps = document.querySelectorAll(".form-section");
  const progressBar = document.querySelector(".progress-bar");
  let currentStep = 0;

  // -----------------------------
  // FUNCTION: Show current step
  // -----------------------------
  function showStep(index) {
    steps.forEach((s, i) => s.classList.toggle("active", i === index));
    progressBar.style.width = `${((index + 1) / steps.length) * 100}%`;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // -----------------------------
  // FUNCTION: Validate leave dates
  // -----------------------------
  function validateDates() {
    const from = new Date(document.getElementById("fromDate").value);
    const to = new Date(document.getElementById("toDate").value);
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    const diffDays = (to - from) / (1000 * 60 * 60 * 24);
    const err = document.getElementById("dateError");

    if (isNaN(from) || isNaN(to)) return false;
    if (from < sevenDaysAgo) {
      err.textContent = "Start date cannot be more than 7 days before today.";
      err.style.display = "block";
      return false;
    }
    if (to < from) {
      err.textContent = "End date must be after start date.";
      err.style.display = "block";
      return false;
    }
    if (diffDays >= 5) {
      err.textContent = "Date range cannot exceed 5 days.";
      err.style.display = "block";
      return false;
    }

    err.style.display = "none";
    return true;
  }

  // -----------------------------
  // FUNCTION: Format date (AU)
  // -----------------------------
  function formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString("en-AU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  }

  // -----------------------------
  // FUNCTION: Update certificate preview
  // -----------------------------
  function updateCertificatePreview() {
    const fname = document.getElementById("firstName").value;
    const lname = document.getElementById("lastName").value;
    const certType = document.querySelector("input[name='certType']:checked").value;
    const leaveFrom = document.querySelector("input[name='leaveFrom']:checked").value;
    const reason = document.querySelector("input[name='reason']:checked").value;
    const from = formatDate(document.getElementById("fromDate").value);
    const to = formatDate(document.getElementById("toDate").value);
    const otherLeave = document.getElementById("otherLeave").value.trim();

    let phrase = "";
    if (certType === "Sick Leave") {
      if (leaveFrom === "Work") phrase = "unfit for work due to illness";
      else if (leaveFrom === "Studies") phrase = "unfit for studies due to illness";
      else phrase = `unfit for ${otherLeave || "duties"} due to illness`;
    } else {
      if (leaveFrom === "Work") phrase = "required to care for another person and should be excused from work";
      else if (leaveFrom === "Studies") phrase = "required to care for another person and should be excused from studies";
      else phrase = `required to care for another person and should be excused from ${otherLeave || "duties"}`;
    }

    const preview = document.getElementById("certificatePreview");
    preview.innerHTML = `
      <strong>Medical Certificate</strong><br><br>
      <p>I certify that in my medical opinion <strong>${fname} ${lname}</strong> is ${phrase} from <strong>${from}</strong> to <strong>${to}</strong> inclusive.</p>
      <p><em>Reason:</em> ${reason}</p>
      <p><small>Please check all information is correct before submission.</small></p>
    `;
  }

  // -----------------------------
  // NAVIGATION HANDLERS
  // -----------------------------
  document.querySelectorAll(".continue-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault();
      if (currentStep === 4 && !validateDates()) return;
      if (currentStep === 6) updateCertificatePreview();
      if (currentStep < steps.length - 1) currentStep++;
      showStep(currentStep);
    });
  });

  document.querySelectorAll(".back-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault();
      if (currentStep > 0) currentStep--;
      showStep(currentStep);
    });
  });

  // -----------------------------
  // PAYMENT OPTION SELECTION
  // -----------------------------
  document.querySelectorAll(".payment-option").forEach(opt => {
    opt.addEventListener("click", () => {
      document.querySelectorAll(".payment-option").forEach(o => o.classList.remove("active"));
      opt.classList.add("active");
    });
  });

  // -----------------------------
  // TOGGLE "OTHER" FIELD
  // -----------------------------
  const otherLeaveField = document.getElementById("otherLeaveField");
  document.querySelectorAll("input[name='leaveFrom']").forEach(radio => {
    radio.addEventListener("change", () => {
      otherLeaveField.style.display = radio.id === "other" ? "block" : "none";
    });
  });

  // -----------------------------
  // 🟦 Step 8: Backend submission
  // -----------------------------
  document.getElementById("submitBtn").addEventListener("click", async e => {
    e.preventDefault();

    const data = {
      certType: document.querySelector("input[name='certType']:checked").value,
      leaveFrom: document.querySelector("input[name='leaveFrom']:checked").value,
      otherLeave: document.getElementById("otherLeave").value,
      reason: document.querySelector("input[name='reason']:checked").value,
      firstName: document.getElementById("firstName").value,
      lastName: document.getElementById("lastName").value,
      dob: document.getElementById("dob").value,
      email: document.getElementById("email").value,
      mobile: document.getElementById("mobile").value,
      address: document.getElementById("address").value,
      city: document.getElementById("city").value,
      state: document.getElementById("state").value,
      postcode: document.getElementById("postcode").value,
      fromDate: document.getElementById("fromDate").value,
      toDate: document.getElementById("toDate").value,
      symptoms: document.getElementById("symptoms").value,
      doctorNote: document.getElementById("doctorNote").value
    };

    try {
      // Change this URL to your live Render backend
      const backendURL = "https://vividmedi-backend.onrender.com/api/submit";

      const response = await fetch(backendURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        console.log("✅ Data sent successfully to backend");
        currentStep = 8; // Show success page (Step 9)
        showStep(currentStep);
      } else {
        console.error("❌ Backend returned an error");
        alert("There was an issue submitting your form. Please try again.");
      }
    } catch (error) {
      console.error("Error sending data:", error);
      alert("There was an error connecting to the server. Please try again.");
    }
  });

  // -----------------------------
  // INIT
  // -----------------------------
  showStep(currentStep);
});

