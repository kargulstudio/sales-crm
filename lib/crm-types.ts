import type { Company, Owner } from "@/data/companies";
import type { Notification } from "@/data/notifications";
export type User = {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};
export type Contact = {
  id: string;
  company_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  linkedin_url: string;
  x_url: string;
  notes: string;
  created_at: string;
  updated_at: string;
};
export type Interaction = {
  id: string;
  company_id: string;
  contact_id: string | null;
  user_id: string;
  type: string;
  subject: string;
  content: string;
  occurred_at: string;
  created_at: string;
};
export type Task = {
  id: string;
  company_id: string;
  contact_id: string | null;
  assigned_to: string;
  title: string;
  description: string;
  due_at: string | null;
  completed_at: string | null;
  priority: "low" | "medium" | "high";
  created_at: string;
};
export type Opportunity = {
  id: string;
  company_id: string;
  name: string;
  stage: string;
  value: number;
  probability: number;
  expected_close_date: string | null;
  status: "open" | "won" | "lost";
  created_at: string;
  updated_at: string;
};
export type EntityMap = {
  contacts: Contact;
  interactions: Interaction;
  tasks: Task;
  opportunities: Opportunity;
};
export type EntityKind = keyof EntityMap;
export type CompanyDetail = {
  company: Company;
  contacts: Contact[];
  interactions: Interaction[];
  tasks: Task[];
  opportunities: Opportunity[];
};
export type Bootstrap = {
  user: User;
  owners: (Owner & { id: string })[];
  notifications: Notification[];
};
