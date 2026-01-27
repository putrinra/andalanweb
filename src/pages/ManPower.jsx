import { useState } from "react";
import { Eye, Edit, Trash2, X } from "lucide-react";
import QRCode from "qrcode";
import jsPDF from "jspdf";
import searchIcon from "../assets/search.png";
import "../styles/manpower.css";

export default function ManPower() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);
  const [addForm, setAddForm] = useState({
    nama: "",
    nik: "",
    department: "Engineering",
    position: "",
    status: "Active"
  });

  const [showQrModal, setShowQrModal] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [qrPayload, setQrPayload] = useState(null);
  const [qrError, setQrError] = useState("");
  const [qrGenerating, setQrGenerating] = useState(false);

  const [manPowerData, setManPowerData] = useState([
    { id: 1, no: 1, nama: "John Doe", nik: "12345", department: "Engineering", position: "Technician", status: "Active" },
    { id: 2, no: 2, nama: "Jane Smith", nik: "12346", department: "Maintenance", position: "Supervisor", status: "Active" },
    { id: 3, no: 3, nama: "Bob Johnson", nik: "12347", department: "Operations", position: "Operator", status: "Inactive" },
    { id: 4, no: 4, nama: "Alice Brown", nik: "12348", department: "Engineering", position: "Engineer", status: "Active" },
    { id: 5, no: 5, nama: "Charlie Wilson", nik: "12349", department: "Maintenance", position: "Technician", status: "Active" },
  ]);

  const filteredManPower = manPowerData.filter(person =>
    person.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    person.nik.includes(searchQuery)
  );

  const handleAddManPower = () => {
    setAddForm({
      nama: "",
      nik: "",
      department: "Engineering",
      position: "",
      status: "Active"
    });
    setShowAddModal(true);
  };

  const handleAddFormChange = (field, value) => {
    setAddForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveAdd = () => {
    if (!addForm.nama || !addForm.nik || !addForm.department || !addForm.position) {
      alert("Please fill in all required fields");
      return;
    }

    const nikExists = manPowerData.some(person => person.nik === addForm.nik);
    if (nikExists) {
      alert("NIK already exists. Please use a different NIK.");
      return;
    }

    const newId = manPowerData.length > 0 ? Math.max(...manPowerData.map(p => p.id)) + 1 : 1;
    const newNo = manPowerData.length > 0 ? Math.max(...manPowerData.map(p => p.no)) + 1 : 1;

    const newPerson = {
      id: newId,
      no: newNo,
      nama: addForm.nama,
      nik: addForm.nik,
      department: addForm.department,
      position: addForm.position,
      status: addForm.status
    };

    setManPowerData(prev => [...prev, newPerson]);
    handleCloseAddModal();
    alert("Man Power added successfully!");
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setAddForm({
      nama: "",
      nik: "",
      department: "Engineering",
      position: "",
      status: "Active"
    });
  };

  const sanitizeFilePart = (s) =>
    String(s || "")
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^\w\-]+/g, "_");

  const handleDownloadPdf = async () => {
    try {
      if (!qrPayload || !qrDataUrl) return;

      const nik = sanitizeFilePart(qrPayload.nik);
      const nama = sanitizeFilePart(qrPayload.nama);
      const id = sanitizeFilePart(qrPayload.id);
      const filename = `QR_${nik}_${nama}_${id}.pdf`;

      // Buat PDF ukuran A4 (portrait), unit mm
      const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });

      // Konversi DataURL QR ke image (base64)
      // qrDataUrl biasanya: data:image/png;base64,....
      const imgData = qrDataUrl;

      const pageWidth = doc.internal.pageSize.getWidth();   // ~210mm
      const pageHeight = doc.internal.pageSize.getHeight(); // ~297mm

      // Setting ukuran QR di PDF
      const qrSize = 100; // mm (silakan adjust)
      const x = (pageWidth - qrSize) / 2;
      const y = 40;

      // Tambah gambar QR
      doc.addImage(imgData, "PNG", x, y, qrSize, qrSize);

      // Teks bawah QR (rata kiri)
      const textY = y + qrSize + 20;

      // X teks = kiri QR
      const textX = x + 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(20);

      const lines = [
        `NIK  : ${qrPayload.nik}`,
        `Nama : ${qrPayload.nama}`,
      ];

      lines.forEach((line, i) => {
        doc.text(line, textX, textY + i * 7);
      });


      doc.save(filename);
    } catch (err) {
      console.error(err);
      alert("Gagal membuat PDF.");
    }
  };

  const handleViewQR = async (person) => {
    try {
      setQrError("");
      setQrDataUrl("");
      setQrGenerating(true);

      const payload = {
        nik: String(person.nik),
        nama: String(person.nama),
      };

      setQrPayload(payload);

      const jsonString = JSON.stringify(payload)
        .replace(/":/g, '": ')
        .replace(/","/g, '", "');

      const dataUrl = await QRCode.toDataURL(jsonString, {
        margin: 2,
        width: 320,
        errorCorrectionLevel: "M",
      });

      setQrDataUrl(dataUrl);
      setShowQrModal(true);
    } catch (err) {
      console.error(err);
      setQrError("Gagal generate QR Code.");
      setShowQrModal(true);
    } finally {
      setQrGenerating(false);
    }
  };

  const handleCloseQrModal = () => {
    setShowQrModal(false);
    setQrDataUrl("");
    setQrPayload(null);
    setQrError("");
    setQrGenerating(false);
  };

  const handleEdit = (person) => {
    setEditingPerson({ ...person });
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (!editingPerson.nama || !editingPerson.nik || !editingPerson.department || !editingPerson.position) {
      alert("Semua field harus diisi!");
      return;
    }

    setManPowerData(manPowerData.map(person =>
      person.id === editingPerson.id ? editingPerson : person
    ));
    setShowEditModal(false);
    setEditingPerson(null);
    alert("Man Power updated successfully!");
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingPerson(null);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this person?")) {
      setManPowerData(manPowerData.filter(person => person.id !== id));
      alert("Man Power deleted successfully!");
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setManPowerData(manPowerData.map(person =>
      person.id === id ? { ...person, status: newStatus } : person
    ));
  };

  return (
    <div>
      <div className="manpower-top">
        <div className="search-wrapper">
          <img src={searchIcon} alt="Search" className="search-icon" />
          <input
            type="text"
            placeholder="Search Man Power"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <button className="add-manpower-btn" onClick={handleAddManPower}>
          Add Man Power
        </button>
      </div>

      <div className="table-container">
        <table className="manpower-table">
          <thead>
            <tr>
              <th>No.</th>
              <th>Nama</th>
              <th>NIK</th>
              <th>Department</th>
              <th>Position</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredManPower.map((person) => (
              <tr key={person.id}>
                <td>{person.no}</td>
                <td>{person.nama}</td>
                <td>{person.nik}</td>
                <td>{person.department}</td>
                <td>{person.position}</td>
                <td>
                  <select
                    value={person.status}
                    onChange={(e) => handleStatusChange(person.id, e.target.value)}
                    className={`status-select status-${person.status.toLowerCase()}`}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="action-btn view-btn"
                      onClick={() => handleViewQR(person)}
                      title="View QR Code"
                    >
                      <span>View QR</span>
                      <Eye size={18} />
                    </button>
                    <button
                      className="action-btn edit-btn"
                      onClick={() => handleEdit(person)}
                      title="Edit"
                    >
                      <span>Edit</span>
                      <Edit size={18} />
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDelete(person.id)}
                      title="Delete"
                    >
                      <span>Delete</span>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showQrModal && (
        <>
          <div className="modal-overlay" onClick={handleCloseQrModal}></div>
          <div className="modal">
            <div className="modal-header">
              <h2>QR Code</h2>
              <button className="modal-close" onClick={handleCloseQrModal}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body" style={{ textAlign: "center" }}>
              {qrError ? (
                <p className="error-text">{qrError}</p>
              ) : qrGenerating ? (
                <p>Generating QR...</p>
              ) : (
                qrDataUrl && (
                  <img
                    src={qrDataUrl}
                    alt="QR Code"
                    style={{ width: 320, maxWidth: "100%", borderRadius: 8 }}
                  />
                )
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={handleCloseQrModal}>
                Close
              </button>

              {qrDataUrl && !qrError && (
                <button className="btn-save" onClick={handleDownloadPdf}>
                  Download PDF
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {showAddModal && (
        <>
          <div className="modal-overlay" onClick={handleCloseAddModal}></div>
          <div className="modal">
            <div className="modal-header">
              <h2>Add New Man Power</h2>
              <button className="modal-close" onClick={handleCloseAddModal}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Nama *</label>
                <input
                  type="text"
                  value={addForm.nama}
                  onChange={(e) => handleAddFormChange("nama", e.target.value)}
                  className="form-input"
                  placeholder="Masukkan nama lengkap"
                />
              </div>

              <div className="form-group">
                <label>NIK *</label>
                <input
                  type="text"
                  value={addForm.nik}
                  onChange={(e) => handleAddFormChange("nik", e.target.value)}
                  className="form-input"
                  placeholder="Masukkan NIK"
                />
              </div>

              <div className="form-group">
                <label>Department *</label>
                <select
                  value={addForm.department}
                  onChange={(e) => handleAddFormChange("department", e.target.value)}
                  className="form-input"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Operations">Operations</option>
                  <option value="Quality">Quality</option>
                </select>
              </div>

              <div className="form-group">
                <label>Position *</label>
                <input
                  type="text"
                  value={addForm.position}
                  onChange={(e) => handleAddFormChange("position", e.target.value)}
                  className="form-input"
                  placeholder="Masukkan posisi"
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  value={addForm.status}
                  onChange={(e) => handleAddFormChange("status", e.target.value)}
                  className="form-input"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={handleCloseAddModal}>
                Cancel
              </button>
              <button className="btn-save" onClick={handleSaveAdd}>
                Add Man Power
              </button>
            </div>
          </div>
        </>
      )}

      {showEditModal && editingPerson && (
        <>
          <div className="modal-overlay" onClick={handleCancelEdit}></div>
          <div className="modal">
            <div className="modal-header">
              <h2>Edit Man Power</h2>
              <button className="modal-close" onClick={handleCancelEdit}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Nama</label>
                <input
                  type="text"
                  value={editingPerson.nama}
                  onChange={(e) => setEditingPerson({ ...editingPerson, nama: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>NIK (Read Only)</label>
                <input
                  type="text"
                  value={editingPerson.nik}
                  disabled
                  className="form-input disabled"
                />
              </div>

              <div className="form-group">
                <label>Department</label>
                <select
                  value={editingPerson.department}
                  onChange={(e) => setEditingPerson({ ...editingPerson, department: e.target.value })}
                  className="form-input"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Operations">Operations</option>
                  <option value="Quality">Quality</option>
                </select>
              </div>

              <div className="form-group">
                <label>Position</label>
                <input
                  type="text"
                  value={editingPerson.position}
                  onChange={(e) => setEditingPerson({ ...editingPerson, position: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  value={editingPerson.status}
                  onChange={(e) => setEditingPerson({ ...editingPerson, status: e.target.value })}
                  className="form-input"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={handleCancelEdit}>
                Cancel
              </button>
              <button className="btn-save" onClick={handleSaveEdit}>
                Save Changes
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
