import React, { useState } from 'react';
import { auth, db } from './firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';

function RegisterUser() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('salesperson'); // Default role
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      // 1. Create the user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Create a user document in Firestore with the selected role
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        role: role,
      });

      setSuccess(`Successfully registered ${email} as a ${role}.`);
      // Clear form
      setEmail('');
      setPassword('');
      setRole('salesperson');

    } catch (error) {
      setError(error.message);
      console.error("Error registering user: ", error);
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '20px', marginTop: '20px' }}>
      <h3>Create a New User</h3>
      <form onSubmit={handleRegister}>
        <div>
          <label>Email:</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label>Password:</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            placeholder="Min. 6 characters"
          />
        </div>
        <div>
          <label>Role:</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="salesperson">Salesperson</option>
            <option value="dealer">Dealer</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button type="submit" style={{ marginTop: '10px' }}>Register User</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}
      </form>
    </div>
  );
}

export default RegisterUser;
