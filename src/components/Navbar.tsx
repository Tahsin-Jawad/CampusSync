import React from 'react';
import { Users, LogIn, Calendar, LogOut } from 'lucide-react';
import type { UserProfile } from '../types';
import { auth } from '../services/firebase';
import { signOut } from 'firebase/auth';

interface NavbarProps {
  user: UserProfile | null; // এখানে user প্রপসটি যোগ করা হয়েছে
  onOpenAuth: () => void;
  onOpenGroups: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onOpenAuth, onOpenGroups }) => {
  return (
    <div className="navbar bg-base-100 border-b border-base-300 px-4 sm:px-8 shadow-sm">
      <div className="flex-1">
        <a className="text-xl font-black flex items-center gap-2 text-primary">
          <Calendar className="w-6 h-6" /> CampusSync
        </a>
      </div>

      <div className="flex-none gap-3">
        {user ? (
          <>
            <button onClick={onOpenGroups} className="btn btn-primary btn-sm gap-2 rounded-xl">
              <Users className="w-4 h-4" /> Friend Circles
            </button>
            <button 
              onClick={() => signOut(auth)} 
              className="btn btn-ghost btn-sm text-error gap-1 rounded-xl"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </>
        ) : (
          <button onClick={onOpenAuth} className="btn btn-primary btn-sm gap-2 rounded-xl">
            <LogIn className="w-4 h-4" /> Login / Register
          </button>
        )}
      </div>
    </div>
  );
};