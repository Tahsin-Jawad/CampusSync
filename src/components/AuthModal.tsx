import React, { useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        // Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Save User Profile in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          id: user.uid,
          fullName: fullName,
          email: email,
          isPublic: true,
          campusStatus: 'ON_CAMPUS',
          createdAt: new Date().toISOString(),
        });
      } else {
        // Sign In
        await signInWithEmailAndPassword(auth, email, password);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md rounded-2xl p-6">
        <h3 className="font-bold text-2xl text-center mb-4">
          {isRegister ? 'Create CampusSync Account' : 'Welcome Back'}
        </h3>

        {error && (
          <div className="alert alert-error text-sm py-2 mb-4">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="form-control">
              <label className="label"><span className="label-text">Full Name</span></label>
              <input 
                type="text" 
                placeholder="Tahsin Al Jawad" 
                className="input input-bordered w-full"
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                required 
              />
            </div>
          )}

          <div className="form-control">
            <label className="label"><span className="label-text">Email</span></label>
            <input 
              type="email" 
              placeholder="jawad@example.com" 
              className="input input-bordered w-full"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text">Password</span></label>
            <input 
              type="password" 
              placeholder="••••••••" 
              className="input input-bordered w-full"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          <button 
            type="submit" 
            className={`btn btn-primary w-full mt-4 ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {isRegister ? 'Register' : 'Login'}
          </button>
        </form>

        <div className="text-center mt-4">
          <button 
            type="button"
            className="text-sm link link-hover text-primary"
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
          </button>
        </div>

        <div className="modal-action mt-2">
          <button type="button" className="btn btn-sm btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};