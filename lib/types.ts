export type ResourceType = "Datasheet" | "PDF" | "Code" | "Video" | "Tool" | "Website" | "Paper";

export type Resource = {
  id: string;
  title: string;
  description: string;
  url: string;
  type: ResourceType | string;
  topic: string;
  level: string;
  source: string;
  is_featured: boolean;
  created_at?: string;
};

export type ResourceInput = Omit<Resource, "id" | "created_at">;
