import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, doc, getDoc, setDoc, getDocs, query, orderBy } from 'firebase/firestore';

function WarrantyContentPage() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch all available products for the dropdown
  useEffect(() => {
    const fetchProducts = async () => {
      const productsQuery = query(collection(db, "products"), orderBy("name"));
      const querySnapshot = await getDocs(productsQuery);
      const productsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productsList);
      if (productsList.length > 0) {
        setSelectedProduct(productsList[0].id);
      }
    };
    fetchProducts();
  }, []);

  // When a product is selected, fetch its specific content
  useEffect(() => {
    if (!selectedProduct) return;

    const fetchContent = async () => {
      setIsLoading(true);
      setSuccess(null);
      setError(null);
      try {
        const contentDocRef = doc(db, 'warranty_content', selectedProduct);
        const docSnap = await getDoc(contentDocRef);
        if (docSnap.exists()) {
          setContent(docSnap.data().conditions);
        } else {
          setContent(''); // No pre-existing content
        }
      } catch (err) {
        setError("Failed to fetch warranty content.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [selectedProduct]);

  const handleSave = async () => {
    if (!selectedProduct) return;
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const contentDocRef = doc(db, 'warranty_content', selectedProduct);
      await setDoc(contentDocRef, { conditions: content });
      setSuccess('Content saved successfully!');
    } catch (err) {
      setError("Failed to save content.");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h3>Warranty Content Management</h3>
      <p>Select a product to define its default warranty conditions.</p>
      
      {error && <p style={{color: 'red'}}>{error}</p>}
      {success && <p style={{color: 'green'}}>{success}</p>}

      <div style={{ marginBottom: '15px' }}>
        <label>Select Product: </label>
        <select 
          value={selectedProduct} 
          onChange={(e) => setSelectedProduct(e.target.value)}
          disabled={isLoading}
        >
          {products.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <p>Loading content...</p>
      ) : (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter default warranty conditions here..."
          style={{ width: '100%', height: '300px', marginBottom: '15px' }}
        />
      )}

      <button onClick={handleSave} disabled={isSaving || isLoading}>
        {isSaving ? 'Saving...' : 'Save Content'}
      </button>
    </div>
  );
}

export default WarrantyContentPage;
