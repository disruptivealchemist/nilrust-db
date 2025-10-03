import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import LoginPage from './LoginPage';
import AdminDashboard from './AdminDashboard';
import DealerDashboard from './DealerDashboard';
import SalespersonDashboard from './SalespersonDashboard';

function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role);
          } else {
            setError('No role assigned for this user.');
          }
        } catch (err) {
          setError('Failed to fetch user role.');
          console.error(err);
        }
      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  const renderDashboard = () => {
    switch (userRole) {
      case 'admin':
        return <AdminDashboard />;
      case 'dealer':
        return <DealerDashboard />;
      case 'salesperson':
        return <SalespersonDashboard />;
      default:
        return <p>Role not recognized or assigned.</p>;
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      {user ? (
        <div>
          <h1>Welcome, {user.email}</h1>
          <button onClick={handleSignOut}>Sign Out</button>
          {error ? <p style={{ color: 'red' }}>{error}</p> : renderDashboard()}
        </div>
      ) : (
        <LoginPage />
      )}
    </div>
  );
}

export default App;
