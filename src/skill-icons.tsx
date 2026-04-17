import type { IconType } from "react-icons";
import { FaAws, FaCode, FaCss3Alt, FaJava } from "react-icons/fa6";
import {
  SiAngular,
  SiBootstrap,
  SiDocker,
  SiFirebase,
  SiFlask,
  SiGithub,
  SiHtml5,
  SiJira,
  SiJavascript,
  SiJetpackcompose,
  SiKotlin,
  SiPostgresql,
  SiPython,
  SiReact,
  SiSlack,
  SiSpringboot,
  SiTailwindcss,
  SiVaadin,
} from "react-icons/si";

type SkillVisual = {
  color: string;
  icon: IconType;
};

const skillVisuals: Record<string, SkillVisual> = {
  angular: { icon: SiAngular, color: "#dd0031" },
  aws: { icon: FaAws, color: "#ff9900" },
  bootstrap: { icon: SiBootstrap, color: "#7952b3" },
  css: { icon: FaCss3Alt, color: "#1572b6" },
  docker: { icon: SiDocker, color: "#2496ed" },
  flask: { icon: SiFlask, color: "#e5e7eb" },
  github: { icon: SiGithub, color: "#f5f5f5" },
  googlefirebase: { icon: SiFirebase, color: "#ffca28" },
  html: { icon: SiHtml5, color: "#e34f26" },
  java: { icon: FaJava, color: "#f89820" },
  javascript: { icon: SiJavascript, color: "#f7df1e" },
  jetpackcompose: { icon: SiJetpackcompose, color: "#4285f4" },
  jira: { icon: SiJira, color: "#0052cc" },
  kotlin: { icon: SiKotlin, color: "#7f52ff" },
  postgresql: { icon: SiPostgresql, color: "#4169e1" },
  python: { icon: SiPython, color: "#3776ab" },
  react: { icon: SiReact, color: "#61dafb" },
  reactjs: { icon: SiReact, color: "#61dafb" },
  slack: { icon: SiSlack, color: "#e01e5a" },
  springboot: { icon: SiSpringboot, color: "#6db33f" },
  tailwind: { icon: SiTailwindcss, color: "#38bdf8" },
  tailwindcss: { icon: SiTailwindcss, color: "#38bdf8" },
  vaadin: { icon: SiVaadin, color: "#00b4f0" },
};

const normalizeSkillKey = (skill: string) =>
  skill.toLowerCase().replace(/[^a-z0-9]/g, "");

export const resolveSkillVisual = (skill: string): SkillVisual => {
  const match = skillVisuals[normalizeSkillKey(skill)];
  return match ?? { icon: FaCode, color: "#ffb074" };
};
