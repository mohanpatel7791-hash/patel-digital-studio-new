
import React, { useEffect, useMemo, useState } from "react";

const ADMIN_ID = "patel";
const ADMIN_PASSWORD = "PDS@2006";

const styles = `
*{box-sizing:border-box}
.admin{min-height:100vh;background:#090909;color:#f5f0df;font-family:Arial,sans-serif;padding:18px}
.admin button,.admin input,.admin select{font:inherit}
.admin button{cursor:pointer}
.gold{color:#d9ad52}
.login-wrap{min-height:85vh;display:grid;place-items:center}
.login{width:100%;max-width:390px;background:#171717;border:1px solid #b78b35;border-radius:18px;padding:28px;box-shadow:0 12px 45px #000}
.logo{font-size:38px;font-weight:900;color:#e6bd62;text-align:center}
.login h2{text-align:center;color:#fff}
.admin input,.admin select{width:100%;padding:12px;margin:7px 0 14px;background:#242424;color:white;border:1px solid #555;border-radius:8px}
.btn{border:0;border-radius:8px;padding:11px 15px;background:#c99b43;color:#111;font-weight:bold}
.btn.dark{background:#292929;color:#f5d58a;border:1px solid #80622d}
.btn.red{background:#7d2828;color:white}
.top{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;border-bottom:1px solid #604a24;padding-bottom:16px}
.top h2{margin:0;color:#e6bd62}
.nav{display:flex;gap:8px;flex-wrap:wrap;margin:18px 0}
.nav button{background:#202020;color:#ddd;border:1px solid #4c3c20;padding:10px 13px;border-radius:8px}
.nav button.active{background:#c99b43;color:#111;font-weight:bold}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(145px,1fr));gap:12px;margin:18px 0}
.card{background:#181818;border:1px solid #4e3b1d;border-radius:12px;padding:17px}
.card small{color:#aaa}
.card h2{color:#e6bd62;margin:10px 0 0;font-size:25px}
.panel{background:#171717;border:1px solid #44351e;border-radius:12px;padding:16px;margin:14px 0;overflow:hidden}
.panel h3{color:#e6bd62;margin-top:0}
.search{max-width:450px}
.table-wrap{overflow-x:auto}
table{width:100%;border-collapse:collapse;min-width:750px}
th,td{padding:12px 9px;border-bottom:1px solid #38332a;text-align:left;font-size:13px;vertical-align:top}
th{color:#e6bd62}
.status{display:inline-block;padding:5px 8px;border-radius:20px;background:#39301e;color:#f4d38a;font-size:12px}
.muted{color:#aaa;font-size:13px}
.actions{display:flex;gap:7px;flex-wrap:wrap}
.actions button{padding:7px 9px;font-size:12px}
.grid2{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:12px}
.empty{text-align:center;color:#aaa;padding:30px}
@media(max-width:600px){.admin{padding:11px}.login{padding:22px}.top h2{font-size:19px}.nav button{font-size:12px;padding:9px}.panel{padding:11px}}
`;

function readOrders() {
  const keys = ["pds_orders", "orders", "orderData", "customerOrders"];
  for (const key of keys) {
    try {
      const data = JSON.parse(localStorage.getItem(key) || "null");
      if (Array.isArray(data)) return { key, data };
      if (data && Array.isArray(data.orders)) return { key, data: data.orders };
    } catch {}
  }
  return { key: "pds_orders", data: [] };
}

export default function Admin({ onClose }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState("Dashboard");
  const [orders, setOrders] = useState([]);
  const [storageKey, setStorageKey] = useState("pds_orders");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [services, setServices] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("pds_services") || "[]");
    } catch { return []; }
  });
  const [newService, setNewService] = useState("");
  const [newPrice, setNewPrice] = useState("");

  const refreshOrders = () => {
    const result = readOrders();
    setOrders(result.data);
    setStorageKey(result.key);
  };

  useEffect(() => {
    refreshOrders();
  }, []);

  const saveOrders = (updated) => {
    setOrders(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const login = (e) => {
    e.preventDefault();
    if (user === ADMIN_ID && pass === ADMIN_PASSWORD) {
      setLoggedIn(true);
      setError("");
      setPass("");
    } else {
      setError("गलत Admin ID या Password");
    }
  };

  const updateOrder = (index, field, value) => {
    const updated = [...orders];
    updated[index] = { ...updated[index], [field]: value };
    saveOrders(updated);
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const mobile = String(o.mobile || o.phone || o.mobileNumber || "");
      const name = String(o.name || o.customerName || "");
      const id = String(o.orderId || o.id || "");
      const matchesSearch = [mobile, name, id].join(" ").toLowerCase()
        .includes(search.toLowerCase());
      const payment = String(o.paymentStatus || o.payment_status || "Unpaid");
      const matchesFilter = filter === "All" ||
        (filter === "Paid" && payment.toLowerCase() === "paid") ||
        (filter === "Unpaid" && payment.toLowerCase() !== "paid");
      return matchesSearch && matchesFilter;
    });
  }, [orders, search, filter]);

  const totalRevenue = orders.reduce((sum, o) => {
    const paid = String(o.paymentStatus || o.payment_status || "").toLowerCase() === "paid";
    return sum + (paid ? Number(o.price || o.amount || 0) : 0);
  }, 0);

  const pendingAmount = orders.reduce((sum, o) => {
    const paid = String(o.paymentStatus || o.payment_status || "").toLowerCase() === "paid";
    return sum + (!paid ? Number(o.price || o.amount || 0) : 0);
  }, 0);

  const addService = () => {
    if (!newService.trim() || newPrice === "") return;
    const updated = [...services, {
      id: Date.now(), name: newService.trim(), price: Number(newPrice)
    }];
    setServices(updated);
    localStorage.setItem("pds_services", JSON.stringify(updated));
    setNewService("");
    setNewPrice("");
  };

  const deleteService = (id) => {
    const updated = services.filter(s => s.id !== id);
    setServices(updated);
    localStorage.setItem("pds_services", JSON.stringify(updated));
  };

  const value = (o, ...keys) => {
    for (const key of keys) {
      if (o[key] !== undefined && o[key] !== null && o[key] !== "") return o[key];
    }
    return "—";
  };

  return (
    <div className="admin">
      <style>{styles}</style>

      {!loggedIn ? (
        <div className="login-wrap">
          <form className="login" onSubmit={login}>
            <div className="logo">PD</div>
            <h2>ADMIN LOGIN</h2>
            <p className="muted" style={{textAlign:"center"}}>
              PATEL DIGITAL STUDIO
            </p>
            <label>Admin ID</label>
            <input value={user} onChange={e=>setUser(e.target.value)}
              placeholder="Enter Admin ID" required />
            <label>Password</label>
            <input type="password" value={pass}
              onChange={e=>setPass(e.target.value)}
              placeholder="Enter Password" required />
            {error && <p style={{color:"#ff7777"}}>{error}</p>}
            <button className="btn" style={{width:"100%"}}>Secure Login</button>
            {onClose && <button type="button" className="btn dark"
              style={{width:"100%",marginTop:10}} onClick={onClose}>Back to Website</button>}
          </form>
        </div>
      ) : (
        <>
          <header className="top">
            <div>
              <div className="logo" style={{textAlign:"left",fontSize:27}}>PD</div>
              <h2>Patel Digital Studio</h2>
              <small className="muted">Premium Admin Control Panel</small>
            </div>
            <div className="actions">
              <button className="btn dark" onClick={refreshOrders}>Refresh</button>
              <button className="btn red" onClick={()=>setLoggedIn(false)}>Logout</button>
            </div>
          </header>

          <nav className="nav">
            {["Dashboard","Orders","Payments","Services"].map(item=>(
              <button key={item} className={tab===item?"active":""}
                onClick={()=>setTab(item)}>{item}</button>
            ))}
          </nav>

          {tab === "Dashboard" && (
            <>
              <h2 className="gold">Dashboard Overview</h2>
              <div className="cards">
                <div className="card"><small>Total Orders</small><h2>{orders.length}</h2></div>
                <div className="card"><small>Paid Collection</small><h2>₹{totalRevenue}</h2></div>
                <div className="card"><small>Pending Amount</small><h2>₹{pendingAmount}</h2></div>
                <div className="card"><small>Total Services</small><h2>{services.length}</h2></div>
              </div>
              <div className="panel">
                <h3>Recent Orders</h3>
                {orders.length === 0 ? <div className="empty">अभी कोई सेव किया हुआ Order नहीं मिला।</div> :
                  <div className="table-wrap"><table>
                    <thead><tr><th>Order ID</th><th>Customer</th><th>Mobile</th><th>Service</th><th>Amount</th><th>Payment</th></tr></thead>
                    <tbody>{orders.slice(-5).reverse().map((o,i)=>(
                      <tr key={i}>
                        <td>{value(o,"orderId","id")}</td>
                        <td>{value(o,"name","customerName")}</td>
                        <td>{value(o,"mobile","phone","mobileNumber")}</td>
                        <td>{value(o,"service","serviceName","selectedService")}</td>
                        <td>₹{value(o,"price","amount")}</td>
                        <td><span className="status">{value(o,"paymentStatus","payment_status")}</span></td>
                      </tr>
                    ))}</tbody>
                  </table></div>}
              </div>
            </>
          )}

          {tab === "Orders" && (
            <div className="panel">
              <h3>Complete Order Management</h3>
              <input className="search" placeholder="Search name, mobile number or Order ID"
                value={search} onChange={e=>setSearch(e.target.value)} />
              <div className="table-wrap"><table>
                <thead><tr>
                  <th>Order / Date</th><th>Customer Details</th><th>Service</th>
                  <th>Amount</th><th>Payment</th><th>Order Status</th><th>Details</th>
                </tr></thead>
                <tbody>
                  {filteredOrders.map((o,i)=>(
                    <tr key={i}>
                      <td>{value(o,"orderId","id")}<br/>{value(o,"date","createdAt","timestamp")}</td>
                      <td>
                        <b>{value(o,"name","customerName")}</b><br/>
                        {value(o,"mobile","phone","mobileNumber")}<br/>
                        {value(o,"email")}
                        <div className="actions" style={{marginTop:7}}>
                          <a style={{color:"#e6bd62"}} href={"tel:"+value(o,"mobile","phone","mobileNumber")}>Call</a>
                          <a style={{color:"#e6bd62"}} target="_blank" rel="noreferrer"
                            href={"https://wa.me/91"+String(value(o,"mobile","phone","mobileNumber")).replace(/\D/g,"").slice(-10)}>WhatsApp</a>
                        </div>
                      </td>
                      <td>{value(o,"service","serviceName","selectedService")}<br/>
                        <small>{value(o,"details","orderDetails")}</small></td>
                      <td>₹{value(o,"price","amount")}</td>
                      <td>
                        <select value={o.paymentStatus || o.payment_status || "Unpaid"}
                          onChange={e=>updateOrder(orders.indexOf(o),"paymentStatus",e.target.value)}>
                          <option>Unpaid</option><option>Paid</option>
                          <option>Failed</option><option>Refunded</option>
                        </select>
                        <small>UTR: {value(o,"utr","transactionId","upiTransactionId")}</small><br/>
                        <small>Method: {value(o,"paymentMethod","method")}</small>
                      </td>
                      <td>
                        <select value={o.status || "Pending"}
                          onChange={e=>updateOrder(orders.indexOf(o),"status",e.target.value)}>
                          <option>Pending</option><option>Processing</option>
                          <option>Completed</option><option>Cancelled</option>
                        </select>
                      </td>
                      <td>
                        <small>Payment time: {value(o,"paymentDate","paidAt")}</small><br/>
                        <small>Document: {value(o,"document","documents","fileName")}</small>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table></div>
              {filteredOrders.length===0 && <div className="empty">कोई Order नहीं मिला।</div>}
            </div>
          )}

          {tab === "Payments" && (
            <>
              <div className="cards">
                <div className="card"><small>Total Paid</small><h2>₹{totalRevenue}</h2></div>
                <div className="card"><small>Pending Collection</small><h2>₹{pendingAmount}</h2></div>
                <div className="card"><small>Paid Orders</small><h2>{orders.filter(o=>String(o.paymentStatus||o.payment_status).toLowerCase()==="paid").length}</h2></div>
              </div>
              <div className="panel">
                <h3>Payment Account Details</h3>
                <p>Business: <b>Patel Digital Studio</b></p>
                <p>UPI ID: <b className="gold">9301152277@ybl</b></p>
                <p className="muted">Payment QR: आपके प्रोजेक्ट में उपलब्ध QR इमेज अलग से जोड़ी जाएगी।</p>
              </div>
              <div className="panel">
                <h3>Payment Transactions</h3>
                <div className="table-wrap"><table>
                  <thead><tr><th>Order ID</th><th>Customer</th><th>Mobile</th><th>Amount</th><th>UTR / Transaction ID</th><th>Date</th><th>Status</th></tr></thead>
                  <tbody>{orders.map((o,i)=>(
                    <tr key={i}>
                      <td>{value(o,"orderId","id")}</td>
                      <td>{value(o,"name","customerName")}</td>
                      <td>{value(o,"mobile","phone","mobileNumber")}</td>
                      <td>₹{value(o,"price","amount")}</td>
                      <td>{value(o,"utr","transactionId","upiTransactionId")}</td>
                      <td>{value(o,"paymentDate","paidAt","date","createdAt")}</td>
                      <td>
                        <select value={o.paymentStatus || o.payment_status || "Unpaid"}
                          onChange={e=>updateOrder(i,"paymentStatus",e.target.value)}>
                          <option>Unpaid</option><option>Paid</option>
                          <option>Failed</option><option>Refunded</option>
                        </select>
                      </td>
                    </tr>
                  ))}</tbody>
                </table></div>
                <p className="muted">ध्यान दें: UTR और वास्तविक भुगतान की पुष्टि बैंक/UPI ऐप से जाँचकर ही करें।</p>
              </div>
            </>
          )}

          {tab === "Services" && (
            <div className="panel">
              <h3>Manage Services</h3>
              <div className="grid2">
                <input placeholder="Service Name" value={newService}
                  onChange={e=>setNewService(e.target.value)} />
                <input type="number" placeholder="Price ₹" value={newPrice}
                  onChange={e=>setNewPrice(e.target.value)} />
              </div>
              <button className="btn" onClick={addService}>+ Add Service</button>
              {services.map(s=>(
                <div key={s.id} className="card" style={{marginTop:10,display:"flex",justifyContent:"space-between",alignItems:"center",gap:10}}>
                  <span>{s.name} — ₹{s.price}</span>
                  <button className="btn red" onClick={()=>deleteService(s.id)}>Delete</button>
                </div>
              ))}
              {services.length===0 && <p className="muted">अभी सेव की हुई सेवाएँ नहीं मिलीं।</p>}
            </div>
          )}

          <footer className="muted" style={{textAlign:"center",padding:20}}>
            PD • PATEL DIGITAL STUDIO • SMART DIGITAL SOLUTIONS
          </footer>
        </>
      )}
    </div>
  );
}
