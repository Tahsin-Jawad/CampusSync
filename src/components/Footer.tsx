import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="footer footer-center p-4 bg-base-200 text-base-content border-t border-base-300 mt-auto">
      <aside>
        <p className="text-xs sm:text-sm font-medium">
          CampusSync — "Different Routines. One Campus."
        </p>
        <p className="text-xs text-base-content/70 mt-1">
          Made by <span className="font-semibold text-primary">Tahsin-Jawad</span>
        </p>
      </aside>
    </footer>
  );
};