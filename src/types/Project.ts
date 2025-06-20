interface Project {
  title: string;
  description: string;
  image: string;
  bullet_points: string[];
  github_link: string;
  live_link: string;
}

type Props = {
  project: Project;
};
export type { Project, Props };
