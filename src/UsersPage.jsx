import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase';
import { collection, getDocs, addDoc, doc, setDoc, query, orderBy } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';

function AddUserForm({ onUserAdded, currentUser }) {
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Form state
    const [userName, setUserName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [address, setAddress] = useState('');
    const [role, setRole] = useState('salesperson');
    const [status, setStatus] = useState('active');
    const [permissions, setPermissions] = useState({
        product: false,
        price: false,
        resource: true, // Default to true as per user request example
        news: false,
    });

    const handlePermissionChange = (e) => {
        setPermissions({ ...permissions, [e.target.name]: e.target.checked });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }
        setIsSubmitting(true);
        setError(null);

        try {
            // We can't directly create a user with a password on the client-side without re-authenticating the admin.
            // A secure way is to use a Cloud Function. For this implementation, we will add the user to Firestore,
            // but the admin would need to set the password via the Firebase Console or a password-reset email flow.
            // For this example, we will focus on creating the Firestore user record.
            
            // This is a placeholder for creating the auth user. In a real app, you'd use a backend function for security.
            // const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            // const newUserId = userCredential.user.uid;

            const userRecord = {
                name: userName,
                email,
                companyName,
                address,
                role,
                status,
                permissions,
                createdAt: new Date()
            }

            // In a real scenario, you'd use the UID from auth as the document ID:
            // await setDoc(doc(db, "users", newUserId), userRecord);
            
            // For now, we will add a new document and let Firestore generate the ID.
            await addDoc(collection(db, "users"), userRecord);

            onUserAdded(); // Refresh list and close form
            // Reset form fields
            setUserName('');
            setEmail('');
            setPassword('');
            setCompanyName('');
            setAddress('');

        } catch (err) {
            setError(err.message); // Show Firebase auth errors
            console.error("Error creating user: ", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ border: '1px solid #ccc', padding: '20px', marginBottom: '20px' }}>
            <h4>Add New User</h4>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <input placeholder="User Name *" value={userName} onChange={e => setUserName(e.target.value)} required />
                <input placeholder="Company Name" value={companyName} onChange={e => setCompanyName(e.target.value)} />
                <input type="email" placeholder="Company Email *" value={email} onChange={e => setEmail(e.target.value)} required />
                <input type="password" placeholder="Password *" value={password} onChange={e => setPassword(e.target.value)} required />
                <input placeholder="Address" value={address} onChange={e => setAddress(e.target.value)} />
                <select value={role} onChange={e => setRole(e.target.value)}>
                    <option value="salesperson">Salesperson</option>
                    <option value="dealer">Dealer</option>
                    <option value="admin">Admin</option>
                </select>
            </div>

            <fieldset style={{marginTop: '15px'}}>
                <legend>Permissions</legend>
                <label><input type="checkbox" name="product" checked={permissions.product} onChange={handlePermissionChange} /> Product</label>
                <label><input type="checkbox" name="price" checked={permissions.price} onChange={handlePermissionChange} /> Price</label>
                <label><input type="checkbox" name="resource" checked={permissions.resource} onChange={handlePermissionChange} /> Resource</label>
                <label><input type="checkbox" name="news" checked={permissions.news} onChange={handlePermissionChange} /> News</label>
            </fieldset>

             <fieldset style={{marginTop: '15px'}}>
                <legend>Status</legend>
                <label><input type="radio" name="status" value="active" checked={status === 'active'} onChange={e => setStatus(e.target.value)} /> Active</label>
                <label><input type="radio" name="status" value="inactive" checked={status === 'inactive'} onChange={e => setStatus(e.target.value)} /> Inactive</label>
            </fieldset>

            <button type="submit" disabled={isSubmitting} style={{marginTop: '15px'}}>{isSubmitting ? 'Adding User...' : 'Add User'}</button>
        </form>
    )
}

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    const usersQuery = query(collection(db, "users"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(usersQuery);
    const usersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setUsers(usersList);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUserAdded = () => {
      setShowAddForm(false);
      fetchUsers();
  }

  return (
    <div style={{ padding: '20px' }}>
      <h3>User Management</h3>
       <button onClick={() => setShowAddForm(!showAddForm)} style={{marginBottom: '15px'}}>
          {showAddForm ? 'Cancel' : '+ Add User'}
      </button>
      {showAddForm && <AddUserForm onUserAdded={handleUserAdded} />}

      {isLoading ? <p>Loading users...</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
                <tr style={{ borderBottom: '2px solid black' }}>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Name</th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Email</th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Role</th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Status</th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Actions</th>
                </tr>
            </thead>
            <tbody>
                {users.map(user => (
                    <tr key={user.id} style={{ borderBottom: '1px solid #ccc' }}>
                        <td style={{ padding: '8px' }}>{user.name}</td>
                        <td style={{ padding: '8px' }}>{user.email}</td>
                        <td style={{ padding: '8px' }}>{user.role}</td>
                        <td style={{ padding: '8px' }}>{user.status}</td>
                        <td style={{ padding: '8px' }}>
                            <button>Edit</button> {/* Functionality to be added */}
                        </td>
                    </tr>
                ))}
            </tbody>
          </table>
      )}
    </div>
  );
}

export default UsersPage;
