export type User = {
  id: string;
  username: string;
  name: string;
  lastname: string;
  isAdmin: boolean;
  Departments: Department[];
  DepartmentUsers: Array<{ Departments: Department }>;
  responsibleFor: Department[];
};

export type Department = {
  id: string;
  name: string;
  description?: string;
};

export type Demography = {
  id: string;
  state: string;
  population: number;
  description: string;
  politics: string;
};
