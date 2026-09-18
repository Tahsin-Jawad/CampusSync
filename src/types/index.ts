export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  isPublic: boolean;
  campusStatus: 'ON_CAMPUS' | 'OFF_CAMPUS';
}

export interface CourseSlot {
  id: string;
  courseCode: string;
  courseTitle: string;
  room: string;
  day: 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  startTime: string;
  endTime: string;
  section?: string;
}

export interface UserRoutine {
  userId: string;
  updatedAt: string;
  slots: CourseSlot[];
}