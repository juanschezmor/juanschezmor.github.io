AOS.init();

// You can also pass an optional settings object
// below listed default settings
AOS.init({
  // Settings that can be overridden on per-element basis, by `data-aos-*` attributes:
  offset: 120, // offset (in px) from the original trigger point
  delay: 0, // values from 0 to 3000, with step 50ms
  duration: 700, // values from 0 to 3000, with step 50ms
  easing: "ease", // default easing for AOS animations
  once: false, // whether animation should happen only once - while scrolling down
  mirror: false, // whether elements should animate out while scrolling past them
  anchorPlacement: "top-bottom", // defines which position of the element regarding to window should trigger the animation
});

// Función para mostrar solo los skill-icons relacionados con una skill específica
function showSkillIcons(skillClass) {
  const allSkillIcons = document.querySelectorAll(".skill-icon");
  allSkillIcons.forEach((icon) => {
    if (icon.classList.contains(skillClass)) {
      icon.style.display = "block";
    } else {
      icon.style.display = "none";
    }
  });
}

// Función para mostrar todos los skill-icons
function showAllSkillIcons() {
  const allSkillIcons = document.querySelectorAll(".skill-icon");
  allSkillIcons.forEach((icon) => {
    icon.style.display = "block";
  });
}

// Asigna los eventos mouseover y mouseleave a cada skill
document.addEventListener("DOMContentLoaded", () => {
  const webDeveloperSkill = document.querySelector(".web-developer");
  const dbaDataAnalystSkill = document.querySelector(".dba-data-analyst");
  const machineLearningSkill = document.querySelector(".machine-learning");

  webDeveloperSkill.addEventListener("mouseover", () => {
    showSkillIcons("web-developer");
  });

  dbaDataAnalystSkill.addEventListener("mouseover", () => {
    showSkillIcons("dba-data-analyst");
  });
  machineLearningSkill.addEventListener("mouseover", () => {
    showSkillIcons("machine-learning");
  });

  // Evento mouseleave para restablecer todas las skill-icons

  webDeveloperSkill.addEventListener("mouseleave", () => {
    showAllSkillIcons();
  });
  dbaDataAnalystSkill.addEventListener("mouseleave", () => {
    showAllSkillIcons();
  });
  machineLearningSkill.addEventListener("mouseleave", () => {
    showAllSkillIcons();
  });
});

function validateForm() {
  var name = document.getElementById("name").value;
  var email = document.getElementById("email").value;
  var message = document.getElementById("message").value;

  if (name === "" || email === "" || message === "") {
    alert("Please fill in all fields.");
    return false;
  }

  console.log("Validating email...");
  console.log(name, email, message);

  return true; // Envía el formulario si todo está validado correctamente
}
