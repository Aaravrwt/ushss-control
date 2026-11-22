export type RoleEnum = 'student' | 'faculty' | 'cr' | 'admin';
export type AttendanceStatus = 'present' | 'absent';
export type ReviewStatus = 'approved' | 'pending' | 'rejected';

export interface User {
  id: number;
  username: string;
  role: RoleEnum;
  full_name: string;
  email: string;
  password_hash: string;
  is_active: boolean;
  is_super_admin: boolean;
  phone?: string | null;
  enrollment_no?: string | null;
  department?: string | null;
  domain?: string | null;
  programme?: string | null;
  batch?: string | null;
  semester?: string | null;
  section?: string | null;
  designation?: string | null;
  last_login?: string | null;
  created_at: string;
  status: string;
  supabase_uid?: string | null;
}

export interface TimetableSlot {
  id: number;
  subject: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  room?: string | null;
  programme?: string | null;
  course?: string | null;
  batch?: string | null;
  semester?: string | null;
  section?: string | null;
  department?: string | null;
  faculty_id?: number | null;
  published: boolean;
  is_active: boolean;
  created_at: string;
  // Joins
  faculty?: User | null;
}

export interface AttendanceSession {
  id: number;
  slot_id: number;
  faculty_id?: number | null;
  date: string;
  is_open: boolean;
  opened_at?: string | null;
  closed_at?: string | null;
  anchor_lat?: number | null;
  anchor_lon?: number | null;
  anchor_accuracy?: number | null;
  anchor_source?: string | null;
  time_limit_disabled?: boolean;
  teacher_subnet?: string | null;
  session_cap?: number | null;
  // Joins
  timetable_slots?: TimetableSlot | null;
  faculty?: User | null;
}

export interface AttendanceRecord {
  id: number;
  session_id: number;
  student_id: number;
  status: AttendanceStatus;
  latitude?: number | null;
  longitude?: number | null;
  marked_at?: string | null;
  device_uuid?: string | null;
  gps_zone?: number | null;
  gps_distance?: number | null;
  subnet_match?: boolean | null;
  suspicion_score?: number | null;
  flags?: string | null;
  review_status?: ReviewStatus | null;
  time_delta_seconds?: number | null;
  // Joins
  users?: User | null;
  attendance_sessions?: AttendanceSession | null;
}

export interface AuditLogEntry {
  id: number;
  user_id?: number | null;
  action: string;
  detail: string;
  ip?: string | null;
  ts: string;
}

export interface AttendanceSummary {
  student_id: number;
  student_name: string;
  enrollment_no: string;
  programme: string;
  batch: string;
  semester: string;
  total_classes: number;
  attended_classes: number;
  missed_classes: number;
  percentage: number;
}

export interface SubjectAttendanceSummary {
  subject: string;
  total_classes: number;
  attended_classes: number;
  missed_classes: number;
  percentage: number;
}
