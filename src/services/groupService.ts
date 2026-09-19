import { collection, doc, setDoc, getDocs, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from './firebase';
import type { UserProfile, CourseSlot, Group, FriendLiveStatus } from '../types';

export const createGroup = async (name: string, creatorId: string): Promise<Group> => {
  const groupRef = doc(collection(db, 'groups'));
  const newGroup: Group = {
    id: groupRef.id,
    name,
    createdById: creatorId,
    members: [creatorId],
  };
  await setDoc(groupRef, newGroup);
  return newGroup;
};

export const getUserGroups = async (userId: string): Promise<Group[]> => {
  const querySnapshot = await getDocs(collection(db, 'groups'));
  const groups: Group[] = [];
  querySnapshot.forEach((docSnap) => {
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

export const removeGroupMember = async (groupId: string, userIdToRemove: string) => {
  const groupRef = doc(db, 'groups', groupId);
  await updateDoc(groupRef, {
    members: arrayRemove(userIdToRemove),
  });
};

export const calculateLiveStatus = (
  user: UserProfile,
  slots: CourseSlot[],
  dayName: CourseSlot['day'],
  currentMinutes: number
): FriendLiveStatus => {
  const todaySlots = slots.filter((s) => s.day === dayName);

  const parseToMinutes = (timeStr: string) => {
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return 0;
    let hrs = parseInt(match[1]);
    const mins = parseInt(match[2]);
    const ampm = match[3].toUpperCase();
    if (ampm === 'PM' && hrs < 12) hrs += 12;
    if (ampm === 'AM' && hrs === 12) hrs = 0;
    return hrs * 60 + mins;
  };

  let currentClass: CourseSlot | undefined;
  let nextClass: CourseSlot | undefined;
  let minNextTime = Infinity;

  todaySlots.forEach((slot) => {
    const startMins = parseToMinutes(slot.startTime);
    const endMins = parseToMinutes(slot.endTime);

    if (currentMinutes >= startMins && currentMinutes <= endMins) {
      currentClass = slot;
    }

    if (startMins > currentMinutes && startMins < minNextTime) {
      minNextTime = startMins;
      nextClass = slot;
    }
  });

  const hasClassesToday = todaySlots.length > 0;
  const latestEnd = hasClassesToday ? Math.max(...todaySlots.map(s => parseToMinutes(s.endTime))) : 0;
  const isAfterAllClasses = hasClassesToday && currentMinutes > latestEnd;

  const isCurrentlyFree = hasClassesToday && !currentClass && !isAfterAllClasses;

  return {
    user,
    slots,
    isCurrentlyFree,
    currentClass,
    nextClass,
  };
};