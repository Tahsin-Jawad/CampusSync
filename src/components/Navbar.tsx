import React from 'react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userName: string;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, userName }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'groups', label: 'My Groups' },
    { id: 'routine', label: 'My Routine' },
    { id: 'finder', label: 'Free Time Finder' },
    { id: 'public', label: 'Public Campus' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <div className="navbar bg-base-100 shadow-md px-4 sm:px-8 border-b border-base-200">
      <div className="navbar-start">
        <div className="dropdown lg:hidden">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </div>
          <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  className={activeTab === item.id ? 'active font-semibold' : ''}
                  onClick={() => setActiveTab(item.id)}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <a className="btn btn-ghost text-xl font-bold text-primary">
          CampusSync
        </a>
      </div>

      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1 gap-1">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === item.id ? 'bg-primary text-primary-content' : 'hover:bg-base-200'
                }`}
                onClick={() => setActiveTab(item.id)}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="navbar-end gap-2">
        <span className="text-sm font-medium hidden sm:inline-block">
          {userName}
        </span>
        <div className="avatar placeholder">
          <div className="bg-neutral text-neutral-content rounded-full w-8">
            <span className="text-xs">{userName.charAt(0)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};