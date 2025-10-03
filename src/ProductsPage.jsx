import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newProductName, setNewProductName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
        const productsQuery = query(collection(db, "products"), orderBy("name"));
        const querySnapshot = await getDocs(productsQuery);
        const productsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(productsList);
    } catch (err) {
        setError("Failed to fetch products.");
        console.error(err);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProductName) return;
    setIsSubmitting(true);
    try {
        await addDoc(collection(db, "products"), { name: newProductName });
        setNewProductName('');
        fetchProducts(); // Refresh the list
    } catch (err) {
        setError("Failed to add product.");
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDelete = async (productId) => {
      if (window.confirm("Are you sure you want to delete this product?")) {
          try {
              await deleteDoc(doc(db, "products", productId));
              fetchProducts(); // Refresh list
          } catch (err) {
              setError("Failed to delete product.");
          }
      }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h3>Product Management</h3>
      {error && <p style={{color: 'red'}}>{error}</p>}
      
      <form onSubmit={handleAddProduct} style={{ marginBottom: '20px' }}>
        <input 
            value={newProductName}
            onChange={e => setNewProductName(e.target.value)}
            placeholder="New product name..."
            required
            style={{marginRight: '10px'}}
        />
        <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Adding...' : 'Add Product'}</button>
      </form>

      {isLoading ? <p>Loading products...</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
                <tr style={{ borderBottom: '2px solid black' }}>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Product Name</th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Actions</th>
                </tr>
            </thead>
            <tbody>
                {products.map(product => (
                    <tr key={product.id} style={{ borderBottom: '1px solid #ccc' }}>
                        <td style={{ padding: '8px' }}>{product.name}</td>
                        <td style={{ padding: '8px' }}>
                            <button onClick={() => handleDelete(product.id)}>Delete</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      )}
    </div>
  );
}

export default ProductsPage;
