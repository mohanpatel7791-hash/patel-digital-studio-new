
import React, { useEffect, useState } from "react";
import "./style.css";
import CustomerLogin from "./CustomerLogin";

const WA = "919301152277";
const ADMIN_DEFAULT_PASSWORD = "PDS@123";

const INITIAL_SERVICES = [
  { id: 1, name: "PAN Card Services", price: 199, category: "Government Services", active: true },
  { id: 2, name: "Banking Services", price: 99, category: "Banking", active: true },
  { id: 3, name: "Government Services", price: 149, category: "Government", active: true },
  { id: 4, name: "Education Services", price: 99, category: "Education", active: true },
  { id: 5, name: "Farmer Services", price: 99, category: "Farmer", active: true },
  { id: 6, name: "Digital Services", price: 99, category: "Digital", active: true },
];

function readData(key, fallback) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [services, setServices] = useState(() =>
    readData("pds_services", INITIAL_SERVICES)
  );

  const [orders, setOrders] = useState(() =>
    readData("pds_orders_v2", [])
  );

  const [customer, setCustomer] = useState(() =>
    readData("pds_customer_session", null)
  );

  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [adminLogin, setAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [page, setPage] = useState("home");
  const [pendingService, setPendingService] = useState(null);

  const [newService, setNewService] = useState({
    name: "",
    price: "",
    category: "Digital Services",
  });

  const [editId, setEditId] = useState(null);

  const [upiId, setUpiId] = useState(() =>
    localStorage.getItem("pds_upi_id") || ""
  );

  const [paymentName, setPaymentName] = useState(() =>
    localStorage.getItem("pds_payment_name") || "Patel Digital Studio"
  );

  const [qrImage, setQrImage] = useState(() =>
    localStorage.getItem("pds_payment_qr") || ""
  );

  const [search, setSearch] = useState("");

  useEffect(() => {
    localStorage.setItem("pds_services", JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem("pds_orders_v2", JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(
      "pds_customer_session",
      JSON.stringify(customer)
    );
  }, [customer]);

  const whatsapp = (message) => {
    window.open(
      `https://wa.me/${WA}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  const handleCustomerLogin = (data) => {
    const saved = readData("pds_customer_session", null);
    const value = data || saved;

    if (!value) {
      setCustomer(saved);
      setShowLogin(false);
      return;
    }

    const user = {
      name: value.name || value.customer?.name || "Customer",
      mobile: String(
        value.mobile || value.phone || value.customer?.mobile || ""
      ),
    };

    setCustomer(user);
    setShowLogin(false);

    if (pendingService) {
      createOrder(pendingService, user);
      setPendingService(null);
    }
  };

  const logout = () => {
    setCustomer(null);
    localStorage.removeItem("pds_customer_session");
    setPage("home");
  };

  const createOrder = (service, user = customer) => {
    if (!user) {
      setPendingService(service);
      setShowLogin(true);
      return;
    }

    const order = {
      id: "PDS" + Date.now(),
      customerName: user.name,
      mobile: user.mobile,
      service: service.name,
      amount: Number(service.price),
      status: "Pending",
      paymentStatus: "Pending",
      paymentMethod: "UPI",
      transactionId: "",
      date: new Date().toLocaleString("en-IN"),
    };

    setOrders((old) => [order, ...old]);
    setPage("dashboard");
    alert("Your order has been placed successfully!");
  };

  const adminSignIn = () => {
    const savedPassword =
      localStorage.getItem("pds_admin_password") ||
      ADMIN_DEFAULT_PASSWORD;

    if (adminPassword === savedPassword) {
      setIsAdmin(true);
      setAdminLogin(false);
      setAdminPassword("");
      setPage("admin");
    } else {
      alert("Incorrect Admin Password!");
    }
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
    setPage("home");
  };

  const saveService = () => {
    if (!newService.name.trim() || newService.price === "") {
      alert("Please enter service name and price.");
      return;
    }

    const price = Number(newService.price);

    if (!Number.isFinite(price) || price < 0) {
      alert("Enter a valid price.");
      return;
    }

    if (editId !== null) {
      setServices((old) =>
        old.map((s) =>
          s.id === editId
            ? { ...s, ...newService, price }
            : s
        )
      );
      setEditId(null);
    } else {
      setServices((old) => [
        ...old,
        {
          ...newService,
          price,
          id: Date.now(),
          active: true,
        },
      ]);
    }

    setNewService({
      name: "",
      price: "",
      category: "Digital Services",
    });

    alert("Service saved successfully!");
  };

  const editService = (service) => {
    setNewService({
      name: service.name,
      price: String(service.price),
      category: service.category,
    });
    setEditId(service.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteService = (id) => {
    if (window.confirm("Delete this service?")) {
      setServices((old) => old.filter((s) => s.id !== id));
    }
  };

  const updateOrder = (id, field, value) => {
    setOrders((old) =>
      old.map((o) =>
        o.id === id ? { ...o, [field]: value } : o
      )
    );
  };

  const savePaymentSettings = () => {
    localStorage.setItem("pds_upi_id", upiId);
    localStorage.setItem("pds_payment_name", paymentName);
    localStorage.setItem("pds_payment_qr", qrImage);
    alert("Payment settings saved!");
  };

  const uploadQR = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image.");
      return;
    }

    if (file.size > 1024 * 1024) {
      alert("Please select a QR image smaller than 1 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setQrImage(reader.result);
    reader.readAsDataURL(file);
  };

  const changeAdminPassword = () => {
    const oldPass = window.prompt("Enter current admin password:");
    const current =
      localStorage.getItem("pds_admin_password") ||
      ADMIN_DEFAULT_PASSWORD;

    if (oldPass !== current) {
      alert("Current password is incorrect.");
      return;
    }

    const next = window.prompt("Enter new admin password:");
    if (!next || next.length < 6) {
      alert("Password must have at least 6 characters.");
      return;
    }

    localStorage.setItem("pds_admin_password", next);
    alert("Admin password changed successfully!");
  };

  const myOrders = orders.filter(
    (o) => customer && String(o.mobile) === String(customer.mobile)
  );

  const totalRevenue = orders
    .filter((o) => o.paymentStatus === "Paid")
    .reduce((sum, o) => sum + Number(o.amount || 0), 0);

  const pendingPayments = orders.filter(
    (o) => o.paymentStatus !== "Paid"
  ).length;

  const activeServices = services.filter((s) => s.active);

  
  const payNow = (order) => {
    const paymentUpiId =
        upiId || "9301152277@ybl";

          const paymentNameValue =
              paymentName || "Patel Digital Studio";

                if (!paymentUpiId) {
                    alert("Please configure UPI ID.");
                        return;
                          }

                            const url =
                                `upi://pay?pa=${encodeURIComponent(paymentUpiId)}` +
                                    `&pn=${encodeURIComponent(paymentNameValue)}` +
                                        `&am=${Number(order.amount || 0)}` +
                                            `&cu=INR` +
                                                `&tn=${encodeURIComponent(order.id || "PDS Payment")}`;

                                                  window.location.href = url;
                                                  };
                                                  

  return (
    <div className="pds-app">
      <style>{`
        .pds-app {
          min-height:100vh;
          background:#080808;
          color:#f5f1e8;
          font-family:Arial,sans-serif;
        }
        .pds-app * { box-sizing:border-box; }
        .pds-header {
          background:#101010;
          border-bottom:1px solid #b58b37;
          padding:15px 5%;
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:12px;
          flex-wrap:wrap;
        }
        .pds-brand {
          display:flex;
          align-items:center;
          gap:12px;
        }
        .pds-logo {
          width:48px;height:48px;
          border:2px solid #d5ad55;
          border-radius:12px;
          display:grid;place-items:center;
          color:#eac56d;
          font-size:23px;font-weight:bold;
          background:#050505;
        }
        .pds-brand h2 {
          color:#eac56d;margin:0;font-size:20px;
        }
        .pds-brand small {color:#aaa;font-size:10px;letter-spacing:2px;}
        .pds-nav {display:flex;gap:8px;flex-wrap:wrap;}
        .pds-app button {
          cursor:pointer;border:none;border-radius:7px;
          padding:10px 15px;font-weight:bold;
        }
        .pds-gold {background:#d5ad55;color:#111;}
        .pds-dark {background:#252525;color:#f4d58b;border:1px solid #8e702f!important;}
        .pds-danger {background:#922b27;color:white;}
        .pds-hero {
          text-align:center;padding:75px 20px 65px;
          background:radial-gradient(ellipse at top,#30240e,#080808 70%);
        }
        .pds-hero h1 {
          font-size:clamp(32px,6vw,56px);
          color:#eac56d;margin:10px 0;
        }
        .pds-hero p {color:#ccc;line-height:1.8;}
        .pds-section {padding:35px 5%;max-width:1250px;margin:auto;}
        .pds-heading {
          text-align:center;color:#eac56d;margin:10px 0 25px;
          font-size:27px;
        }
        .pds-grid {
          display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
          gap:18px;
        }
        .pds-card,.pds-panel {
          background:#141414;border:1px solid #473a20;
          border-radius:13px;padding:20px;
        }
        .pds-card h3 {color:#edc66c;}
        .pds-price {font-size:25px;color:#eac56d;font-weight:bold;}
        .pds-card p,.pds-muted {color:#aaa;line-height:1.6;}
        .pds-panel {margin:18px 0;}
        .pds-input,.pds-select {
          width:100%;padding:12px;margin:7px 0 14px;
          background:#090909;color:white;border:1px solid #62502c;
          border-radius:7px;
        }
        .pds-label {color:#eac56d;font-size:13px;}
        .pds-table-wrap {overflow-x:auto;}
        .pds-table {width:100%;border-collapse:collapse;min-width:650px;}
        .pds-table th,.pds-table td {
          padding:12px;text-align:left;border-bottom:1px solid #393020;
          font-size:13px;
        }
        .pds-table th {color:#eac56d;background:#1b1914;}
        .pds-badge {
          display:inline-block;padding:5px 9px;border-radius:20px;
          background:#393020;color:#f4d58b;font-size:11px;
        }
        .pds-actions {display:flex;gap:7px;flex-wrap:wrap;}
        .pds-stat {
          background:#181818;padding:20px;border:1px solid #554324;
          border-radius:12px;
        }
        .pds-stat strong {display:block;color:#eac56d;font-size:26px;margin-top:8px;}
        .pds-qr {width:190px;max-width:100%;background:white;padding:8px;border-radius:8px;}
        .pds-footer {
          text-align:center;padding:30px 15px;background:#111;
          border-top:1px solid #554324;color:#aaa;
        }
        .pds-floating {
          position:fixed;right:18px;bottom:18px;
          border-radius:50%!important;width:55px;height:55px;
          font-size:23px;z-index:10;
        }
        .pds-login-overlay {
          position:fixed;inset:0;background:#000c;z-index:20;
          display:grid;place-items:center;padding:15px;
        }
        .pds-login-box {
          background:#151515;border:1px solid #d5ad55;
          border-radius:14px;padding:20px;width:100%;max-width:430px;
          max-height:90vh;overflow:auto;
        }
        @media(max-width:600px) {
          .pds-header {justify-content:center;}
          .pds-nav {justify-content:center;}
          .pds-nav button {padding:9px;font-size:12px;}
          .pds-hero {padding:50px 15px;}
          .pds-section {padding:25px 14px;}
        }
      `}</style>

      <header className="pds-header">
        <div className="pds-brand">
          <div className="pds-logo">PD</div>
          <div>
            <h2>PATEL DIGITAL STUDIO</h2>
            <small>SMART DIGITAL SOLUTIONS</small>
          </div>
        </div>

        <nav className="pds-nav">
          <button className="pds-dark" onClick={() => setPage("home")}>
            Home
          </button>

          <button className="pds-dark" onClick={() => setPage("services")}>
            Services
          </button>

          {customer ? (
            <>
              <button className="pds-dark" onClick={() => setPage("dashboard")}>
                My Account
              </button>
              <button className="pds-dark" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <button className="pds-gold" onClick={() => setShowLogin(true)}>
              Customer Login
            </button>
          )}

          <button
            className="pds-dark"
            onClick={() => isAdmin ? setPage("admin") : setAdminLogin(true)}
          >
            Admin Login
          </button>
        </nav>
      </header>

      {page === "home" && (
        <>
          <section className="pds-hero">
            <div className="pds-logo" style={{margin:"auto",width:75,height:75,fontSize:34}}>PD</div>
            <h1>Patel Digital Studio</h1>
            <p>SMART DIGITAL SOLUTIONS</p>
            <p>
              Government Services | Banking | Online Forms |
              Digital Solutions
            </p>
            <button className="pds-gold" onClick={() => setPage("services")}>
              Explore Our Services
            </button>
            <button className="pds-dark" style={{marginLeft:8}} onClick={() => setShowLogin(true)}>
              Customer Login
            </button>
          </section>

          <section className="pds-section">
            <h2 className="pds-heading">Our Services</h2>
            <div className="pds-grid">
              {activeServices.slice(0, 6).map((service) => (
                <div className="pds-card" key={service.id}>
                  <h3>{service.name}</h3>
                  <p>{service.category}</p>
                  <div className="pds-price">₹{service.price}</div>
                  <button
                    className="pds-gold"
                    style={{marginTop:15}}
                    onClick={() => createOrder(service)}
                  >
                    Order Now
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="pds-section">
            <h2 className="pds-heading">About Us</h2>
            <div className="pds-panel" style={{textAlign:"center"}}>
              <h3 style={{color:"#eac56d"}}>PATEL DIGITAL STUDIO</h3>
              <p className="pds-muted">
                Your trusted partner for smart digital and online services.
                We provide convenient online service assistance.
              </p>
              <button className="pds-gold" onClick={() => whatsapp("Hello Patel Digital Studio, I need information about your services.")}>
                Contact on WhatsApp
              </button>
            </div>
          </section>
        </>
      )}

      {page === "services" && (
        <section className="pds-section">
          <h2 className="pds-heading">All Our Services</h2>
          <div className="pds-grid">
            {activeServices.map((service) => (
              <div className="pds-card" key={service.id}>
                <h3>{service.name}</h3>
                <p>{service.category}</p>
                <div className="pds-price">₹{service.price}</div>
                <button className="pds-gold" style={{marginTop:12}}
                  onClick={() => createOrder(service)}>
                  Order Now
                </button>
                <button className="pds-dark" style={{marginTop:8,marginLeft:5}}
                  onClick={() => whatsapp(`Hello, I want ${service.name}. Price ₹${service.price}.`)}>
                  Enquire
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {page === "dashboard" && (
        <section className="pds-section">
          {customer ? (
            <>
              <h2 className="pds-heading">Customer Dashboard</h2>
              <div className="pds-panel">
                <h3 style={{color:"#eac56d"}}>Welcome, {customer.name}</h3>
                <p>Mobile: {customer.mobile}</p>
                <p>Total Orders: {myOrders.length}</p>
                <button className="pds-dark" onClick={() => setPage("services")}>
                  Browse Services
                </button>
              </div>

              <h3 style={{color:"#eac56d"}}>My Orders</h3>
              {myOrders.length === 0 ? (
                <div className="pds-panel">
                  <p className="pds-muted">You have not placed any orders yet.</p>
                  <button className="pds-gold" onClick={() => setPage("services")}>
                    Explore Services
                  </button>
                </div>
              ) : (
                myOrders.map((order) => (
                  <div className="pds-panel" key={order.id}>
                    <h3 style={{color:"#eac56d"}}>{order.service}</h3>
                    <p>Order ID: {order.id}</p>
                    <p>Date: {order.date}</p>
                    <p>Amount: ₹{order.amount}</p>
                    <p>Order Status: <span className="pds-badge">{order.status}</span></p>
                    <p>Payment Status: <span className="pds-badge">{order.paymentStatus}</span></p>

                    {order.paymentStatus !== "Paid" && (
                      <button className="pds-gold" onClick={() => payNow(order)}>
                        Pay ₹{order.amount}
                      </button>
                    )}

                    <button className="pds-dark" style={{marginLeft:8}}
                      onClick={() => whatsapp(`My Order ID: ${order.id}, Service: ${order.service}, Mobile: ${customer.mobile}. Please provide an update.`)}>
                      Contact Support
                    </button>
                  </div>
                ))
              )}
            </>
          ) : (
            <div className="pds-panel">
              <h2>Please Login First</h2>
              <button className="pds-gold" onClick={() => setShowLogin(true)}>
                Customer Login
              </button>
            </div>
          )}
        </section>
      )}

      {page === "admin" && isAdmin && (
        <section className="pds-section">
          <div className="pds-actions" style={{justifyContent:"space-between"}}>
            <h2 className="pds-heading">Admin Dashboard</h2>
            <button className="pds-danger" onClick={logoutAdmin}>Admin Logout</button>
          </div>

          <div className="pds-grid">
            <div className="pds-stat">Total Orders<strong>{orders.length}</strong></div>
            <div className="pds-stat">Total Services<strong>{services.length}</strong></div>
            <div className="pds-stat">Paid Revenue<strong>₹{totalRevenue}</strong></div>
            <div className="pds-stat">Pending Payments<strong>{pendingPayments}</strong></div>
          </div>

          <div className="pds-panel">
            <h3 style={{color:"#eac56d"}}>{editId !== null ? "Edit Service" : "Add New Service"}</h3>

            <label className="pds-label">Service Name</label>
            <input className="pds-input" placeholder="Service name"
              value={newService.name}
              onChange={(e) => setNewService({...newService,name:e.target.value})}/>

            <label className="pds-label">Price (₹)</label>
            <input className="pds-input" type="number" placeholder="Enter price"
              value={newService.price}
              onChange={(e) => setNewService({...newService,price:e.target.value})}/>

            <label className="pds-label">Category</label>
            <input className="pds-input" placeholder="Category"
              value={newService.category}
              onChange={(e) => setNewService({...newService,category:e.target.value})}/>

            <button className="pds-gold" onClick={saveService}>
              {editId !== null ? "Update Service" : "Add Service"}
            </button>
            {editId !== null && (
              <button className="pds-dark" onClick={() => {
                setEditId(null);
                setNewService({name:"",price:"",category:"Digital Services"});
              }}>Cancel</button>
            )}
          </div>

          <div className="pds-panel">
            <h3 style={{color:"#eac56d"}}>Manage Services</h3>
            <div className="pds-table-wrap">
              <table className="pds-table">
                <thead><tr><th>Service</th><th>Category</th><th>Price</th><th>Actions</th></tr></thead>
                <tbody>
                  {services.map((s) => (
                    <tr key={s.id}>
                      <td>{s.name}</td>
                      <td>{s.category}</td>
                      <td>₹{s.price}</td>
                      <td>
                        <div className="pds-actions">
                          <button className="pds-dark" onClick={() => editService(s)}>Edit</button>
                          <button className="pds-danger" onClick={() => deleteService(s.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pds-panel">
            <h3 style={{color:"#eac56d"}}>All Customer Orders</h3>
            <input className="pds-input" placeholder="Search mobile, customer or order ID"
              value={search} onChange={(e) => setSearch(e.target.value)}/>

            <div className="pds-table-wrap">
              <table className="pds-table">
                <thead>
                  <tr>
                    <th>Order ID</th><th>Customer</th><th>Mobile</th>
                    <th>Service</th><th>Amount</th><th>Date</th>
                    <th>Order Status</th><th>Payment</th><th>Transaction ID</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.filter((o) =>
                    `${o.id} ${o.customerName} ${o.mobile}`.toLowerCase().includes(search.toLowerCase())
                  ).map((o) => (
                    <tr key={o.id}>
                      <td>{o.id}</td>
                      <td>{o.customerName}</td>
                      <td>{o.mobile}</td>
                      <td>{o.service}</td>
                      <td>₹{o.amount}</td>
                      <td>{o.date}</td>
                      <td>
                        <select className="pds-select" value={o.status}
                          onChange={(e) => updateOrder(o.id,"status",e.target.value)}>
                          <option>Pending</option>
                          <option>Processing</option>
                          <option>Completed</option>
                          <option>Cancelled</option>
                        </select>
                      </td>
                      <td>
                        <select className="pds-select" value={o.paymentStatus}
                          onChange={(e) => updateOrder(o.id,"paymentStatus",e.target.value)}>
                          <option>Pending</option>
                          <option>Paid</option>
                          <option>Refunded</option>
                        </select>
                      </td>
                      <td>
                        <input className="pds-input" placeholder="Transaction ID"
                          value={o.transactionId || ""}
                          onChange={(e) => updateOrder(o.id,"transactionId",e.target.value)}/>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pds-panel">
            <h3 style={{color:"#eac56d"}}>Payment Management</h3>

            <label className="pds-label">UPI ID</label>
            <input className="pds-input" placeholder="Enter your UPI ID"
              value={upiId} onChange={(e) => setUpiId(e.target.value)}/>

            <label className="pds-label">Payment Name</label>
            <input className="pds-input"
              value={paymentName}
              onChange={(e) => setPaymentName(e.target.value)}/>

            <label className="pds-label">Upload Payment QR Image (under 1 MB)</label>
            <input className="pds-input" type="file" accept="image/*" onChange={uploadQR}/>

            {qrImage && (
              <div style={{margin:"12px 0"}}>
                <img className="pds-qr" src={qrImage} alt="Payment QR"/>
                <br/>
                <button className="pds-danger" style={{marginTop:8}}
                  onClick={() => setQrImage("")}>Remove QR</button>
              </div>
            )}

            <button className="pds-gold" onClick={savePaymentSettings}>
              Save Payment Settings
            </button>
          </div>

          <div className="pds-panel">
            <h3 style={{color:"#eac56d"}}>Admin Security</h3>
            <button className="pds-dark" onClick={changeAdminPassword}>
              Change Admin Password
            </button>
          </div>
        </section>
      )}

      <footer className="pds-footer">
        <h3 style={{color:"#eac56d"}}>PD | PATEL DIGITAL STUDIO</h3>
        <p>SMART DIGITAL SOLUTIONS</p>
        <p>© {new Date().getFullYear()} Patel Digital Studio. All Rights Reserved.</p>
        <p>Contact: 9301152277</p>
      </footer>

      <button className="pds-gold pds-floating"
        onClick={() => whatsapp("Hello Patel Digital Studio, I need help.")}>
        ☎
      </button>

      {showLogin && (
        <div className="pds-login-overlay">
          <div className="pds-login-box">
            <button className="pds-danger"
              style={{float:"right"}}
              onClick={() => {
                setShowLogin(false);
                setPendingService(null);
              }}>Close</button>
            <div style={{clear:"both"}}/>
            <CustomerLogin
              onLogin={handleCustomerLogin}
              onClose={() => setShowLogin(false)}
            />
          </div>
        </div>
      )}

      {adminLogin && (
        <div className="pds-login-overlay">
          <div className="pds-login-box">
            <button className="pds-danger" style={{float:"right"}}
              onClick={() => setAdminLogin(false)}>Close</button>
            <div style={{clear:"both"}}/>
            <h2 style={{color:"#eac56d"}}>Admin Login</h2>
            <p className="pds-muted">Enter your administrator password.</p>
            <input className="pds-input" type="password"
              placeholder="Admin Password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && adminSignIn()}/>
            <button className="pds-gold" onClick={adminSignIn}>
              Login to Admin Panel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
