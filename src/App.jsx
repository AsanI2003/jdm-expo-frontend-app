import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [customerContact, setCustomerContact] = useState('');
  const [orderSubmitting, setOrderSubmitting] = useState(false);

  
  const VEHICLE_API = 'http://136.68.83.35/api/v1/vehicles';
  const MEDIA_API = 'http://136.68.83.35/api/v1/media'; 
  const ORDER_API = 'http://136.68.83.35/api/v1/orders'; 

  const fetchVehicles = async (currentPage) => {
    setLoading(true);
    try {
      const res = await fetch(`${VEHICLE_API}?page=${currentPage}&size=10`);
      const data = await res.json();

      const availableVehicles = data.content.filter(
        (vehicle) => vehicle.status && vehicle.status.toUpperCase() === 'AVAILABLE'
      );

      const vehiclesWithImages = await Promise.all(
        availableVehicles.map(async (vehicle) => {
          let imageUrl = null;
          if (vehicle.imageFileName) {
            try {
              const imgRes = await fetch(`${MEDIA_API}/${vehicle.imageFileName}`);
              imageUrl = await imgRes.text(); 
            } catch (err) {
              console.error(`Failed to fetch image for ${vehicle.imageFileName}`);
            }
          }
          return { ...vehicle, imageUrl };
        })
      );

      setVehicles(vehiclesWithImages);
      setTotalPages(data.totalPages);
      
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles(page);
  }, [page]);

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    setOrderSubmitting(true);

    const orderPayload = {
      vehicleId: selectedVehicle.id, 
      customerName: customerName,
      customerContact: customerContact,
      status: 'PENDING'
    };

    try {
      const res = await fetch(ORDER_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload),
      });

      if (res.ok) {
        alert('[ ORDER_PLACED_SUCCESSFULLY ]');
        setSelectedVehicle(null);
        setCustomerName('');
        setCustomerContact('');
      } else {
        alert('[ ERROR: FAILED_TO_PLACE_ORDER ]');
      }
    } catch (err) {
      console.error("Order submission error:", err);
      alert('[ ERROR: NETWORK_ISSUE ]');
    } finally {
      setOrderSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '2rem', width: '100%', boxSizing: 'border-box', fontFamily: 'monospace', backgroundColor: '#0a0a0a', color: '#e5e5e5', minHeight: '100vh', position: 'relative' }}>
      
      {/* Header with Top-Left Order Check Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', marginBottom: '2.5rem' }}>

        <h1 style={{ margin: 0, letterSpacing: '2px' }}>JDM Exporters</h1>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '4rem' }}>[ LOADING DATA... ]</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
          {vehicles.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#555', marginTop: '2rem' }}>
               NO_AVAILABLE_VEHICLES_FOUND 
            </div>
          ) : (
            vehicles.map((v, index) => (
              <div key={index} style={{ border: '1px solid #333', borderRadius: '4px', overflow: 'hidden', backgroundColor: '#141414', display: 'flex', flexDirection: 'column' }}>
                
                {/* Image Container */}
                {v.imageUrl ? (
                  <img src={v.imageUrl} alt="Vehicle" style={{ width: '100%', height: '220px', objectFit: 'cover', borderBottom: '1px solid #333' }} />
                ) : (
                  <div style={{ width: '100%', height: '220px', backgroundColor: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #333' }}>
                     NO_IMAGE 
                  </div>
                )}
                
                {/* Data Container */}
                <div style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  
                  <div style={{ flexGrow: 1 }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>{v.name}</h3>
                    <p style={{ margin: '0 0 0.2rem 0', color: '#a0a0a0' }}>{v.status}</p>
                  </div>

                  {/* Buy Now Button triggers overlay */}
                  <button 
                    onClick={() => setSelectedVehicle(v)}
                    style={{ marginTop: '1.2rem', width: '100%', padding: '0.75rem', backgroundColor: '#e5e5e5', color: '#0a0a0a', border: 'none', fontFamily: 'monospace', fontWeight: 'bold', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '1px' }}
                  >
                    BUY NOW
                  </button>

                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Pagination Controls */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.5rem', marginTop: '3rem' }}>
        <button
          disabled={page === 0}
          onClick={() => setPage(p => p - 1)}
          style={{ padding: '0.5rem 1.5rem', cursor: page === 0 ? 'not-allowed' : 'pointer', background: 'transparent', color: page === 0 ? '#555' : '#e5e5e5', border: '1px solid', borderColor: page === 0 ? '#333' : '#e5e5e5', fontFamily: 'monospace' }}
        >
          PREV
        </button>
        
        <span>PAGE {page + 1} OF {totalPages || 1}</span>
        
        <button
          disabled={page >= totalPages - 1}
          onClick={() => setPage(p => p + 1)}
          style={{ padding: '0.5rem 1.5rem', cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer', background: 'transparent', color: page >= totalPages - 1 ? '#555' : '#e5e5e5', border: '1px solid', borderColor: page >= totalPages - 1 ? '#333' : '#e5e5e5', fontFamily: 'monospace' }}
        >
          NEXT
        </button>
      </div>

      {/* Order Form Overlay */}
      {selectedVehicle && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(10, 10, 10, 0.85)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#141414', padding: '2rem', border: '1px solid #333', width: '90%', maxWidth: '400px', boxSizing: 'border-box' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', textTransform: 'uppercase', letterSpacing: '1px' }}> ORDER {selectedVehicle.name} </h2>
            
            <form onSubmit={handleOrderSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
               <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#a0a0a0', fontSize: '0.9rem' }}>CUSTOMER NAME</label>
                <input 
                  type="text" 
                  required 
                  value={customerName} 
                  onChange={e => setCustomerName(e.target.value)} 
                  placeholder="e.g. Takumi Fujiwara" 
                  style={{ width: '100%', padding: '0.75rem', backgroundColor: '#0a0a0a', border: '1px solid #555', color: '#e5e5e5', fontFamily: 'monospace', boxSizing: 'border-box', outline: 'none' }} 
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#a0a0a0', fontSize: '0.9rem' }}>CONTACT NUMBER</label>
                <input 
                  type="text" 
                  required 
                  value={customerContact} 
                  onChange={e => setCustomerContact(e.target.value)} 
                  placeholder="e.g. 0771234567" 
                  style={{ width: '100%', padding: '0.75rem', backgroundColor: '#0a0a0a', border: '1px solid #555', color: '#e5e5e5', fontFamily: 'monospace', boxSizing: 'border-box', outline: 'none' }} 
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button 
                  type="button" 
                  onClick={() => setSelectedVehicle(null)} 
                  style={{ flex: 1, padding: '0.75rem', backgroundColor: 'transparent', color: '#e5e5e5', border: '1px solid #333', fontFamily: 'monospace', cursor: 'pointer', textTransform: 'uppercase' }}
                >
                  CANCEL
                </button>
                <button 
                  type="submit" 
                  disabled={orderSubmitting} 
                  style={{ flex: 1, padding: '0.75rem', backgroundColor: '#e5e5e5', color: '#0a0a0a', border: 'none', fontFamily: 'monospace', fontWeight: 'bold', cursor: orderSubmitting ? 'not-allowed' : 'pointer', textTransform: 'uppercase' }}
                >
                  {orderSubmitting ? 'PROCESSING...' : 'CONFIRM'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;