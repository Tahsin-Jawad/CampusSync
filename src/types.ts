export interface CourseSlot {
  id: string;
  courseCode: string;
  courseTitle?: string;
  room?: string;
  day: 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  startTime: string;
  endTime: string;
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
  members: string[];
}

export interface FriendLiveStatus {
  user: UserProfile;
  slots: CourseSlot[];
  isCurrentlyFree: boolean;
  currentClass?: CourseSlot;
  nextClass?: CourseSlot;
}