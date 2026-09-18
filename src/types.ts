export interface CourseSlot {
  id: string;
  courseCode: string;
  courseTitle?: string;
  day: 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  startTime: string; // e.g. "08:30 AM"
  endTime: string;   // e.g. "10:00 AM"
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  isPublic: boolean;
  campusStatus: 'ON_CAMPUS' | 'OFF_CAMPUS';
}

export interface Group {
  id: string;
  name: string;
  createdById: string;
  members: string[]; // List of User IDs
}

export interface FriendLiveStatus {
  user: UserProfile;
  slots: CourseSlot[];
  isCurrentlyFree: boolean;
  currentClass?: CourseSlot;
  nextClass?: CourseSlot;
}