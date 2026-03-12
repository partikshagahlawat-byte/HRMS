export interface Employee {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
  status: string;
  joined_date: string;
  salary: number;
}

export interface AttendanceStats {
  department: string;
  total: number;
  on_time: number;
  late: number;
  absent: number;
  on_leave: number;
}

export interface AttendanceRaw {
  id: number;
  employee_id: number;
  name: string;
  department: string;
  date: string;
  clock_in: string;
  clock_out: string;
  status: string;
}

export interface AttendanceSheetItem {
  employee_id: number;
  name: string;
  department: string;
  attendance_id: number | null;
  status: string | null;
  clock_in: string | null;
  clock_out: string | null;
  date: string | null;
}

export interface LeaveRequest {
  id: number;
  employee_id: number;
  name: string;
  department: string;
  type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
}

export interface Payroll {
  id: number;
  employee_id: number;
  name: string;
  month: string;
  year: number;
  salary: number;
  net_pay: number;
  status: string;
}

export interface Shift {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
}

export interface PerformanceReview {
  id: number;
  employee_id: number;
  name: string;
  rating: number;
  feedback: string;
  date: string;
}

export interface HRDocument {
  id: number;
  name: string;
  type: string;
  url: string;
  date: string;
}

export interface Job {
  id: number;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  status: string;
}

export interface Applicant {
  id: number;
  job_id: number;
  name: string;
  email: string;
  resume_text: string;
  ai_score: number;
  ai_feedback: string;
  status: string;
}

export interface User {
  id: number;
  email: string;
  role: string;
  employee_id?: number;
}
