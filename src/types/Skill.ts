export type SkillCategory = "Frontend" | "Backend" | "Tools";

export type SkillItem = {
  id: string;
  skill: string;
  category: SkillCategory;
};

export type DynamoSkillItem = {
  id: { S: string };
  skill: { S: string };
  category: { S: SkillCategory };
};
