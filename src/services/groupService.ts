import { collection, doc, setDoc, getDocs, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from './firebase';
import type { UserProfile, CourseSlot, Group, FriendLiveStatus } from '../types';

function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return 0;

  let [, hoursStr, minutesStr, modifier] = match;
  let hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);

  if (modifier) {
    modifier = modifier.toUpperCase();
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
  }

  return hours * 60 + minutes;
}

export const calculateLiveStatus = (
  user: UserProfile,
  slots: CourseSlot[],
  currentDay: CourseSlot['day'],
  currentTimeInMinutes: number
): FriendLiveStatus => {
  const daySlots = slots.filter((s) => s.day === currentDay);

  const currentClass = daySlots.find((s) => {
    const start = timeToMinutes(s.startTime);
    const end = timeToMinutes(s.endTime);
    return currentTimeInMinutes >= start && currentTimeInMinutes <= end;
  });

  const isCurrentlyFree = !currentClass;

  const nextClass = daySlots
    .filter((s) => timeToMinutes(s.startTime) > currentTimeInMinutes)
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))[0];

  return {
    user,
    slots,
    isCurrentlyFree,
    currentClass,
    nextClass,
  };
};

export const createGroup = async (groupName: string, creatorId: string) => {
  const groupRef = doc(collection(db, 'groups'));
  const newGroup: Group = {
    id: groupRef.id,
    name: groupName,
    createdById: creatorId,
    members: [creatorId],
  };
  await setDoc(groupRef, newGroup);
  return newGroup;
};

export const getUserGroups = async (userId: string): Promise<Group[]> => {
  const querySnap = await getDocs(collection(db, 'groups'));
  const groups: Group[] = [];
  querySnap.forEach((docSnap) => {
    const data = docSnap.data() as Group;
    if (data.members && data.members.includes(userId)) {
      groups.push(data);
    }
  });
  return groups;
};

export const joinGroup = async (groupId: string, userId: string) => {
  const groupRef = doc(db, 'groups', groupId);
  await updateDoc(groupRef, {
    members: arrayUnion(userId),
  });
};