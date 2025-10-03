import React, { useState, useEffect } from 'react';
import { db, storage } from './firebase';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

function AddResourceForm({ onResourceAdded }) {
    const [resourceFor, setResourceFor] = useState('Dealer And Agent');
    const [category, setCategory] = useState('Training');
    const [title, setTitle] = useState('');
    const [file, setFile] = useState(null);
    const [image, setImage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !title) {
            setError('Title and a resource file are required.');
            return;
        }
        setIsSubmitting(true);
        setError(null);

        try {
            // 1. Upload file
            const fileRef = ref(storage, `resources/${file.name}`);
            const fileSnapshot = await uploadBytes(fileRef, file);
            const fileURL = await getDownloadURL(fileSnapshot.ref);

            // 2. Upload image (optional)
            let imageURL = null;
            if (image) {
                const imageRef = ref(storage, `resources/images/${image.name}`);
                const imageSnapshot = await uploadBytes(imageRef, image);
                imageURL = await getDownloadURL(imageSnapshot.ref);
            }

            // 3. Add document to Firestore
            await addDoc(collection(db, 'resources'), {
                resourceFor,
                category,
                title,
                fileType: file.type,
                fileName: file.name,
                fileURL,
                imageURL,
                createdAt: serverTimestamp(),
            });

            // 4. Reset form and notify parent
            onResourceAdded();
            setTitle('');
            setFile(null);
            setImage(null);
            e.target.reset(); // Reset the file inputs
        } catch (err) {
            setError('Failed to add resource. Please try again.');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '15px' }}>
            <h4>Add New Resource</h4>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required />
                <input placeholder="Category (e.g., Training)" value={category} onChange={e => setCategory(e.target.value)} required />
                <select value={resourceFor} onChange={e => setResourceFor(e.target.value)}>
                    <option>Dealer And Agent</option>
                    <option>Salesperson</option>
                    <option>Public</option>
                </select>
                <div><label>Resource File: </label><input type="file" onChange={e => setFile(e.target.files[0])} required /></div>
                <div><label>Display Image (optional): </label><input type="file" onChange={e => setImage(e.target.files[0])} /></div>
                <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Adding...' : 'Add Resource'}</button>
            </div>
        </form>
    );
}


function ResourcesPage() {
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchResources = async () => {
    setIsLoading(true);
    const querySnapshot = await getDocs(collection(db, "resources"));
    const resourcesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setResources(resourcesList);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleResourceAdded = () => {
      setShowAddForm(false); // Hide form on success
      fetchResources(); // Refresh the list
  }

  return (
    <div style={{ padding: '20px' }}>
      <h3>Resources</h3>
      <button onClick={() => setShowAddForm(!showAddForm)} style={{marginBottom: '15px'}}>
          {showAddForm ? 'Cancel' : '+ Add Resource'}
      </button>
      {showAddForm && <AddResourceForm onResourceAdded={handleResourceAdded} />}

      {isLoading ? <p>Loading resources...</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid black' }}>
              <th style={{ textAlign: 'left', padding: '8px' }}>Title</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Category</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>For</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>File</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {resources.map(res => (
              <tr key={res.id} style={{ borderBottom: '1px solid #ccc' }}>
                <td style={{ padding: '8px' }}>{res.title}</td>
                <td style={{ padding: '8px' }}>{res.category}</td>
                <td style={{ padding: '8px' }}>{res.resourceFor}</td>
                <td style={{ padding: '8px' }}>{res.fileName}</td>
                <td style={{ padding: '8px' }}>
                    <a href={res.fileURL} target="_blank" rel="noopener noreferrer">Download</a>
                    {/* Add Edit/Delete buttons here in the future */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ResourcesPage;
