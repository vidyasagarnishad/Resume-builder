// Helper to create education entry block
  function createEducationEntry(data = {}) {
    const div = document.createElement("div");
    div.className = "education-entry";
    div.style.border = "1px solid #ccc";
    div.style.padding = "10px";
    div.style.marginTop = "10px";
    div.style.position = "relative";
    div.innerHTML = `
      <div style="position:absolute; right:5px; top:5px;">
        <button type="button" class="remove-education" style="background:#d9534f; color:white; border:none; border-radius:4px; padding: 4px 8px; cursor:pointer;">Remove</button>
      </div>
      <label>Degree</label>
      <input type="text" name="degree" value="${data.degree || ""}" placeholder="e.g. Bachelor of Science in Computer Science" required />
      <label>Institution</label>
      <input type="text" name="institution" value="${data.institution || ""}" placeholder="University or College Name" required />
      <div class="flex-row">
        <div>
          <label>Year</label>
          <input type="text" name="edu-year" value="${data.year || ""}" placeholder="e.g. 2020" />
        </div>
        <div>
          <label>GPA</label>
          <input type="text" name="gpa" value="${data.gpa || ""}" placeholder="e.g. 3.8" />
        </div>
      </div>
    `;
    div.querySelector(".remove-education").onclick = () => div.remove();
    return div;
  }

  // Helper to create experience entry block
  function createExperienceEntry(data = {}) {
    const div = document.createElement("div");
    div.className = "experience-entry";
    div.style.border = "1px solid #ccc";
    div.style.padding = "10px";
    div.style.marginTop = "10px";
    div.style.position = "relative";
    div.innerHTML = `
      <div style="position:absolute; right:5px; top:5px;">
        <button type="button" class="remove-experience" style="background:#d9534f; color:white; border:none; border-radius:4px; padding: 4px 8px; cursor:pointer;">Remove</button>
      </div>
      <label>Job Title</label>
      <input type="text" name="job-title" value="${data.jobTitle || ""}" placeholder="e.g. Software Developer" required />
      <label>Company</label>
      <input type="text" name="company" value="${data.company || ""}" placeholder="Company Name" required />
      <div class="flex-row">
        <div>
          <label>Start Date</label>
          <input type="date" name="start-date" value="${data.startDate || ""}" />
        </div>
        <div>
          <label>End Date</label>
          <input type="date" name="end-date" value="${data.endDate || ""}" />
        </div>
      </div>
      <label>Job Description</label>
      <textarea name="job-desc" placeholder="Describe your responsibilities and achievements...">${data.jobDesc || ""}</textarea>
    `;
    div.querySelector(".remove-experience").onclick = () => div.remove();
    return div;
  }

  // Add skill tag UI
  function addSkillTag(skill) {
    if (!skill || skill.trim() === "") return;
    skill = skill.trim();
    // Prevent duplicates
    const existing = Array.from(document.querySelectorAll("#skills-list .skill-tag")).some(tag => tag.textContent.slice(0, -1) === skill);
    if (existing) return;

    const tag = document.createElement("span");
    tag.className = "skill-tag";
    tag.textContent = skill;
    const removeBtn = document.createElement("span");
    removeBtn.textContent = "×";
    removeBtn.title = "Remove skill";
    removeBtn.style.marginLeft = "8px";
    removeBtn.style.cursor = "pointer";
    removeBtn.onclick = () => tag.remove();

    tag.appendChild(removeBtn);
    document.getElementById("skills-list").appendChild(tag);
  }

  // DOM ready
  document.addEventListener("DOMContentLoaded", () => {
    const eduContainer = document.getElementById("education-entries");
    const expContainer = document.getElementById("experience-entries");

    // Add one initial education and experience entry
    eduContainer.appendChild(createEducationEntry());
    expContainer.appendChild(createExperienceEntry());

    // Add education entry button
    document.getElementById("add-education").onclick = () => {
      eduContainer.appendChild(createEducationEntry());
    };

    // Add experience entry button
    document.getElementById("add-experience").onclick = () => {
      expContainer.appendChild(createExperienceEntry());
    };

    // Skill input enter key
    const skillInput = document.getElementById("skill-input");
    skillInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addSkillTag(skillInput.value);
        skillInput.value = "";
      }
    });

    // Profile pic upload & preview
    let profilePicData = "";
    const profileInput = document.getElementById("profile-pic");
    profileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function (event) {
        profilePicData = event.target.result;
        document.getElementById("profile-pic-preview").innerHTML = `<img src="${profilePicData}" alt="Profile Picture" />`;
      };
      reader.readAsDataURL(file);
    });

    // Generate resume preview on form submit
    document.getElementById("resume-form").onsubmit = (e) => {
      e.preventDefault();
      generateResume(profilePicData);
      window.scrollTo({top: document.getElementById("resume").offsetTop, behavior: "smooth"});
    };

    // Save form data to localStorage
    document.getElementById("save-data").onclick = () => {
      const data = getFormData(profilePicData);
      localStorage.setItem("resumeBuilderData", JSON.stringify(data));
      alert("Data saved locally!");
    };

    // Load form data from localStorage
    document.getElementById("load-data").onclick = () => {
      const data = JSON.parse(localStorage.getItem("resumeBuilderData"));
      if (data) {
        setFormData(data);
        alert("Data loaded! Click Generate Resume to update preview.");
      } else {
        alert("No saved data found.");
      }
    };

    // PDF Download with full content fix
    document.getElementById("download-pdf").onclick = () => {
      const element = document.getElementById("resume");

      const opt = {
        margin:       0.4,
        filename:     'resume.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 3, logging: false, scrollY: 0 },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: ['css', 'legacy'] }
      };

      html2pdf().set(opt).from(element).save();
    };

    // Auto load saved data if exists (optional)
    const saved = JSON.parse(localStorage.getItem("resumeBuilderData"));
    if (saved) setFormData(saved);
  });

  // Gather form data including all entries and skills
  function getFormData(profilePicData) {
    const name = document.getElementById("name").value.trim();
    const title = document.getElementById("title").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const linkedin = document.getElementById("linkedin").value.trim();
    const summary = document.getElementById("summary").value.trim();

    const education = [];
    document.querySelectorAll("#education-entries .education-entry").forEach((edu) => {
      education.push({
        degree: edu.querySelector("input[name='degree']").value.trim(),
        institution: edu.querySelector("input[name='institution']").value.trim(),
        year: edu.querySelector("input[name='edu-year']").value.trim(),
        gpa: edu.querySelector("input[name='gpa']").value.trim(),
      });
    });

    const experience = [];
    document.querySelectorAll("#experience-entries .experience-entry").forEach((exp) => {
      experience.push({
        jobTitle: exp.querySelector("input[name='job-title']").value.trim(),
        company: exp.querySelector("input[name='company']").value.trim(),
        startDate: exp.querySelector("input[name='start-date']").value.trim(),
        endDate: exp.querySelector("input[name='end-date']").value.trim(),
        jobDesc: exp.querySelector("textarea[name='job-desc']").value.trim(),
      });
    });

    const skills = [];
    document.querySelectorAll("#skills-list .skill-tag").forEach(tag => {
      skills.push(tag.textContent.slice(0, -1).trim());
    });

    return {
      profilePicData,
      name,
      title,
      email,
      phone,
      linkedin,
      summary,
      education,
      experience,
      skills,
    };
  }

  // Fill the form with saved data
  function setFormData(data) {
    document.getElementById("name").value = data.name || "";
    document.getElementById("title").value = data.title || "";
    document.getElementById("email").value = data.email || "";
    document.getElementById("phone").value = data.phone || "";
    document.getElementById("linkedin").value = data.linkedin || "";
    document.getElementById("summary").value = data.summary || "";

    // Reset education
    const eduContainer = document.getElementById("education-entries");
    eduContainer.innerHTML = "<h3>Education</h3>";
    if (data.education && data.education.length) {
      data.education.forEach(edu => {
        eduContainer.appendChild(createEducationEntry(edu));
      });
    } else {
      eduContainer.appendChild(createEducationEntry());
    }

    // Reset experience
    const expContainer = document.getElementById("experience-entries");
    expContainer.innerHTML = "<h3>Work Experience</h3>";
    if (data.experience && data.experience.length) {
      data.experience.forEach(exp => {
        expContainer.appendChild(createExperienceEntry(exp));
      });
    } else {
      expContainer.appendChild(createExperienceEntry());
    }

    // Reset skills
    const skillsList = document.getElementById("skills-list");
    skillsList.innerHTML = "";
    if (data.skills && data.skills.length) {
      data.skills.forEach(skill => addSkillTag(skill));
    }

    // Profile pic preview
    if (data.profilePicData) {
      profilePicData = data.profilePicData;
      document.getElementById("profile-pic-preview").innerHTML = `<img src="${profilePicData}" alt="Profile Picture" />`;
    } else {
      profilePicData = "";
      document.getElementById("profile-pic-preview").innerHTML = "";
    }
  }

  // Generate resume preview based on form data
  function generateResume(profilePicData) {
    const data = getFormData(profilePicData);

    // Profile pic
    const rPic = document.getElementById("r-profile-pic");
    if (data.profilePicData) {
      rPic.innerHTML = `<img src="${data.profilePicData}" alt="Profile Picture" style="width:120px; height:120px; border-radius:50%; object-fit:cover;" />`;
    } else {
      rPic.innerHTML = "";
    }

    document.getElementById("r-name").textContent = data.name || "Your Name";
    document.getElementById("r-title").textContent = data.title || "Job Title";
    document.getElementById("r-email").textContent = data.email || "";
    document.getElementById("r-phone").textContent = data.phone || "";
    const rLinkedin = document.getElementById("r-linkedin");
    if (data.linkedin) {
      rLinkedin.href = data.linkedin;
      rLinkedin.textContent = "LinkedIn";
      rLinkedin.style.display = "inline";
    } else {
      rLinkedin.href = "#";
      rLinkedin.textContent = "";
      rLinkedin.style.display = "none";
    }

    document.getElementById("r-summary").textContent = data.summary || "";

    // Education
    const eduContainer = document.getElementById("r-education");
    eduContainer.innerHTML = "";
    data.education.forEach(edu => {
      if (edu.degree || edu.institution || edu.year || edu.gpa) {
        const div = document.createElement("div");
        div.style.marginBottom = "12px";
        div.innerHTML = `
          <strong>${edu.degree || ""}</strong> - <em>${edu.institution || ""}</em><br/>
          <span>${edu.year || ""} ${edu.gpa ? `| GPA: ${edu.gpa}` : ""}</span>
        `;
        eduContainer.appendChild(div);
      }
    });

    // Experience
    const expContainer = document.getElementById("r-experience");
    expContainer.innerHTML = "";
    data.experience.forEach(exp => {
      if (exp.jobTitle || exp.company || exp.startDate || exp.endDate || exp.jobDesc) {
        const div = document.createElement("div");
        div.style.marginBottom = "15px";
        const startDate = exp.startDate ? new Date(exp.startDate).toLocaleDateString('en-US', {year:'numeric', month:'short'}) : "";
        const endDate = exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US', {year:'numeric', month:'short'}) : "Present";
        div.innerHTML = `
          <strong>${exp.jobTitle || ""}</strong> - <em>${exp.company || ""}</em><br/>
          <small>${startDate} - ${endDate}</small>
          <p>${exp.jobDesc || ""}</p>
        `;
        expContainer.appendChild(div);
      }
    });

    // Skills
    const skillsContainer = document.getElementById("r-skills");
    skillsContainer.innerHTML = "";
    data.skills.forEach(skill => {
      const li = document.createElement("li");
      li.textContent = skill;
      skillsContainer.appendChild(li);
    });
  }