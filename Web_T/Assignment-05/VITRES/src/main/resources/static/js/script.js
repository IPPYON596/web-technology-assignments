(() => {
  "use strict";

  const API_BASE = "/api/results";

  /* ---------------------------------------------------------
     View switching (Generate / Lookup / Registry)
     --------------------------------------------------------- */
  const navLinks = document.querySelectorAll(".nav-link");
  const views = {
    generate: document.getElementById("view-generate"),
    lookup: document.getElementById("view-lookup"),
    registry: document.getElementById("view-registry"),
  };

  function showView(name) {
    Object.entries(views).forEach(([key, el]) => {
      el.classList.toggle("is-hidden", key !== name);
    });
    navLinks.forEach((btn) => btn.classList.toggle("is-active", btn.dataset.view === name));
    if (name === "registry") loadRegistry();
  }

  navLinks.forEach((btn) => {
    btn.addEventListener("click", () => showView(btn.dataset.view));
  });

  /* ---------------------------------------------------------
     Build the four subject rows in the entry form
     --------------------------------------------------------- */
  const subjectTable = document.getElementById("subject-table");
  const DEFAULT_SUBJECTS = [
    { code: "", name: "", credit: 4 },
    { code: "", name: "", credit: 4 },
    { code: "", name: "", credit: 3 },
    { code: "", name: "", credit: 3 },
  ];

  DEFAULT_SUBJECTS.forEach((subj, i) => {
    const row = document.createElement("div");
    row.className = "subject-row";
    row.dataset.rowIndex = i;
    row.innerHTML = `
      <span class="row-index">${i + 1}</span>
      <input type="text" class="s-code" placeholder="Subject code" maxlength="20" required value="${subj.code}">
      <input type="text" class="s-name" placeholder="Subject name" maxlength="100" required value="${subj.name}">
      <input type="number" class="s-credit" placeholder="Credit" min="1" max="6" required value="${subj.credit}">
      <input type="number" class="s-mse" placeholder="MSE" min="0" max="50" step="0.5" required>
      <input type="number" class="s-ese" placeholder="ESE" min="0" max="100" step="0.5" required>
    `;
    subjectTable.appendChild(row);
  });

  /* ---------------------------------------------------------
     Generate result — form submit
     --------------------------------------------------------- */
  const resultForm = document.getElementById("result-form");
  const formError = document.getElementById("form-error");
  const gradeCard = document.getElementById("grade-card");

  resultForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    formError.textContent = "";

    const regNo = resultForm.regNo.value.trim();
    const name = resultForm.name.value.trim();
    const branch = resultForm.branch.value.trim();
    const semester = resultForm.semester.value.trim();

    const rows = subjectTable.querySelectorAll(".subject-row");
    const subjects = [];
    for (const row of rows) {
      const subjectCode = row.querySelector(".s-code").value.trim();
      const subjectName = row.querySelector(".s-name").value.trim();
      const credit = Number(row.querySelector(".s-credit").value);
      const mseMarks = Number(row.querySelector(".s-mse").value);
      const eseMarks = Number(row.querySelector(".s-ese").value);

      if (!subjectCode || !subjectName || row.querySelector(".s-mse").value === "" || row.querySelector(".s-ese").value === "") {
        formError.textContent = "Please fill in every field for all four subjects.";
        return;
      }
      subjects.push({ subjectCode, subjectName, credit, mseMarks, eseMarks });
    }

    const payload = { regNo, name, branch, semester, subjects };

    const submitBtn = resultForm.querySelector(".btn-primary");
    submitBtn.disabled = true;
    submitBtn.textContent = "Generating\u2026";

    try {
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data.fieldErrors
          ? Object.values(data.fieldErrors).join(" \u00b7 ")
          : (data.message || "Could not generate the result. Please check the marks entered.");
        formError.textContent = msg;
        return;
      }

      renderGradeCard(data);
    } catch (err) {
      formError.textContent = "Could not reach the server. Confirm the backend is running.";
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Generate result";
    }
  });

  /* ---------------------------------------------------------
     Render a grade card into a target element
     --------------------------------------------------------- */
  function renderGradeCard(result, target = gradeCard) {
    const student = result.student;
    const rows = result.subjectMarks
      .map(
        (m) => `
        <tr>
          <td>${escapeHtml(m.subjectCode)}<br><span style="color:var(--muted); font-size:0.78rem;">${escapeHtml(m.subjectName)}</span></td>
          <td class="num">${m.credit}</td>
          <td class="num">${fmt(m.mseMarks)}</td>
          <td class="num">${fmt(m.eseMarks)}</td>
          <td class="num">${fmt(m.totalMarks)}</td>
          <td><span class="grade-pill grade-${m.grade}">${m.grade}</span></td>
        </tr>`
      )
      .join("");

    target.classList.remove("is-empty");
    target.innerHTML = `
      <div class="gc-band">
        <div>
          <h3>${escapeHtml(student.name)}</h3>
          <div class="gc-meta">
            Reg. no. ${escapeHtml(student.regNo)}<br>
            ${escapeHtml(student.branch || "\u2014")} &middot; ${escapeHtml(student.semester || "\u2014")}
          </div>
        </div>
        <div class="gc-meta" style="text-align:right;">
          Result generated<br>${formatDate(result.createdAt)}
        </div>
      </div>
      <div class="gc-body">
        <table class="gc-table">
          <thead>
            <tr>
              <th>Subject</th>
              <th class="num">Credit</th>
              <th class="num">MSE</th>
              <th class="num">ESE</th>
              <th class="num">Total</th>
              <th>Grade</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="gc-summary">
          <div class="gc-summary-item">
            Total credits
            <strong>${result.totalCredits}</strong>
          </div>
          <div class="gc-summary-item">
            Average percentage
            <strong>${fmt(result.totalPercentage)}%</strong>
          </div>
          <div class="gc-summary-item">
            Overall grade
            <strong>${result.overallGrade}</strong>
          </div>
          <div class="gc-sgpa">
            <span class="val">${fmt(result.sgpa)}</span>
            <span class="lbl">SGPA</span>
          </div>
        </div>
      </div>
    `;
  }

  /* ---------------------------------------------------------
     Lookup view
     --------------------------------------------------------- */
  const lookupForm = document.getElementById("lookup-form");
  const lookupError = document.getElementById("lookup-error");
  const lookupResults = document.getElementById("lookup-results");

  lookupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    lookupError.textContent = "";
    lookupResults.innerHTML = "";

    const regNo = document.getElementById("lookup-regno").value.trim();
    if (!regNo) return;

    try {
      const res = await fetch(`${API_BASE}/student/${encodeURIComponent(regNo)}`);
      const data = await res.json();

      if (!res.ok) {
        lookupError.textContent = data.message || "No results found for that registration number.";
        return;
      }

      data.forEach((result) => {
        const item = document.createElement("div");
        item.className = "lookup-item";
        item.innerHTML = `
          <div>
            <div class="li-main">${escapeHtml(result.student.name)} &middot; ${escapeHtml(result.student.semester || "\u2014")}</div>
            <div class="li-meta">Generated ${formatDate(result.createdAt)} &middot; SGPA ${fmt(result.sgpa)}</div>
          </div>
          <span class="grade-pill grade-${result.overallGrade}">${result.overallGrade}</span>
        `;
        item.addEventListener("click", () => openModal(result));
        lookupResults.appendChild(item);
      });
    } catch (err) {
      lookupError.textContent = "Could not reach the server. Confirm the backend is running.";
    }
  });

  /* ---------------------------------------------------------
     Registry view
     --------------------------------------------------------- */
  const registryBody = document.getElementById("registry-body");
  const registryEmpty = document.getElementById("registry-empty");

  async function loadRegistry() {
    registryBody.innerHTML = "";
    try {
      const res = await fetch(API_BASE);
      const data = await res.json();

      if (!res.ok) {
        registryEmpty.textContent = data.message || "Failed to load records from server.";
        registryEmpty.classList.remove("is-hidden");
        return;
      }

      registryEmpty.classList.toggle("is-hidden", data.length !== 0);

      data.forEach((result) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${escapeHtml(result.student.regNo)}</td>
          <td>${escapeHtml(result.student.name)}</td>
          <td>${escapeHtml(result.student.branch || "\u2014")}</td>
          <td>${escapeHtml(result.student.semester || "\u2014")}</td>
          <td>${fmt(result.sgpa)}</td>
          <td><span class="grade-pill grade-${result.overallGrade}">${result.overallGrade}</span></td>
          <td>${formatDate(result.createdAt)}</td>
          <td>
            <button class="link-btn" data-action="view">View</button>
            <button class="del-btn" data-action="delete">Delete</button>
          </td>
        `;
        tr.querySelector('[data-action="view"]').addEventListener("click", () => openModal(result));
        tr.querySelector('[data-action="delete"]').addEventListener("click", () => deleteResult(result.id));
        registryBody.appendChild(tr);
      });
    } catch (err) {
      registryEmpty.textContent = "Could not reach the server. Confirm the backend is running.";
      registryEmpty.classList.remove("is-hidden");
    }
  }

  async function deleteResult(id) {
    if (!confirm("Delete this result record? This cannot be undone.")) return;
    try {
      await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      loadRegistry();
    } catch (err) {
      alert("Could not delete the record. Confirm the backend is running.");
    }
  }

  /* ---------------------------------------------------------
     Modal (shared detail view)
     --------------------------------------------------------- */
  const modalBackdrop = document.getElementById("modal-backdrop");
  const modalBody = document.getElementById("modal-body");
  const modalClose = document.getElementById("modal-close");

  function openModal(result) {
    const holder = document.createElement("div");
    holder.className = "grade-card";
    modalBody.innerHTML = "";
    modalBody.appendChild(holder);
    renderGradeCard(result, holder);
    modalBackdrop.classList.remove("is-hidden");
  }

  modalClose.addEventListener("click", () => modalBackdrop.classList.add("is-hidden"));
  modalBackdrop.addEventListener("click", (e) => {
    if (e.target === modalBackdrop) modalBackdrop.classList.add("is-hidden");
  });

  /* ---------------------------------------------------------
     Helpers
     --------------------------------------------------------- */
  function fmt(n) {
    if (n === null || n === undefined) return "\u2014";
    return Number(n).toFixed(2).replace(/\.00$/, "");
  }

  function formatDate(str) {
    if (!str) return "\u2014";
    const d = new Date(str.replace(" ", "T"));
    if (isNaN(d.getTime())) return str;
    return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }) +
      ", " + d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
})();
