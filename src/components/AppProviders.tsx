import type { ReactNode } from "react";
import { AdminAuthProvider } from "../context/AdminAuth/AdminAuthContext";
import { ActivityProvider } from "../context/Activity/ActivityContext";
import { ExperienceProvider } from "../context/Experience/ExperienceContext";
import { ProjectProvider } from "../context/Project/ProjectContext";
import { SkillProvider } from "../context/Skill/SkillContext";

export default function AppProviders({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <AdminAuthProvider>
      <ProjectProvider>
        <ActivityProvider>
          <ExperienceProvider>
            <SkillProvider>{children}</SkillProvider>
          </ExperienceProvider>
        </ActivityProvider>
      </ProjectProvider>
    </AdminAuthProvider>
  );
}
