import awsData from "./aws_interview_questions.json";
import devopsData from "./devops_interview_questions.json";
import dockerData from "./docker_interview_questions.json";
import jenkinsData from "./jenkins_interviw_questions.json";
import kubernetesData from "./kubernetes_interview_questions.json";
import terraformData from "./terraform_interview_questions.json";

export interface CodeBlock {
  language: string;
  filename: string;
  code: string;
}

export interface Question {
  id: number;
  questionNumber: number;
  difficulty: string;
  question: string;
  answer: string;
  keyPoints: string[];
  codeBlocks: CodeBlock[];
  examples: string[];
  bestPractices: string[];
  warnings: string[];
  commonMistakes: string[];
  interviewNotes: string[];
  tags: string[];
}

export interface Category {
  id: number;
  title: string;
  order: number;
  questions: Question[];
}

export interface TechnologyData {
  title: string;
  technology: string;
  version: string;
  totalQuestions: number;
  categories: Category[];
}

export const rawData: Record<string, TechnologyData> = {
  aws: awsData as TechnologyData,
  devops: devopsData as TechnologyData,
  docker: dockerData as TechnologyData,
  jenkins: jenkinsData as TechnologyData,
  kubernetes: kubernetesData as TechnologyData,
  terraform: terraformData as TechnologyData,
};

export const technologies = [
  { id: "docker", name: "Docker" },
  { id: "kubernetes", name: "Kubernetes" },
  { id: "aws", name: "AWS" },
  { id: "devops", name: "DevOps" },
  { id: "jenkins", name: "Jenkins" },
  { id: "terraform", name: "Terraform" },
];

export interface SearchableQuestion extends Question {
  technologyId: string;
  technologyName: string;
  categoryId: number;
  categoryTitle: string;
}

// Flat array of all questions with technology and category metadata for Fuse.js search
export const allQuestions: SearchableQuestion[] = Object.entries(rawData).flatMap(
  ([techId, tech]) =>
    tech.categories.flatMap((category) =>
      category.questions.map((q) => ({
        ...q,
        technologyId: techId,
        technologyName: tech.technology,
        categoryId: category.id,
        categoryTitle: category.title,
      }))
    )
);
