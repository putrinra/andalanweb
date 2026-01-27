import { useState } from "react";
import { X, Trash2, Edit, QrCode } from "lucide-react";
import QRCode from "qrcode";
import searchIcon from "../assets/search.png";
import "../styles/parts.css";
import jsPDF from "jspdf";

export default function Parts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showQrModal, setShowQrModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [qrPayload, setQrPayload] = useState(null);
  const [qrError, setQrError] = useState("");
  const [qrGenerating, setQrGenerating] = useState(false);
  const [editingPart, setEditingPart] = useState(null);
  const [editForm, setEditForm] = useState({
    nama: "",
    woNumber: "",
    startDate: "",
    endDate: "",
    status: "Working",
    isClosed: false
  });
  const [addForm, setAddForm] = useState({
    nama: "",
    woNumber: "",
    startDate: "",
    endDate: "",
    status: "Working",
    isClosed: false
  });

  const [partsData, setPartsData] = useState([
    { 
      no: 1, 
      nama: "Bearing", 
      woNumber: "WO-001",
      startDate: "2026-01-15",
      endDate: "2026-01-25",
      status: "Working",
      isClosed: false
    },
    { 
      no: 2, 
      nama: "Belt", 
      woNumber: "WO-002",
      startDate: "2026-01-18",
      endDate: "2026-01-28",
      status: "Working",
      isClosed: false
    },
    { 
      no: 3, 
      nama: "Oil Filter", 
      woNumber: "WO-003",
      startDate: "2026-01-10",
      endDate: "2026-01-20",
      status: "Not Working",
      isClosed: true
    },
    { 
      no: 4, 
      nama: "Gasket", 
      woNumber: "WO-004",
      startDate: "2026-01-12",
      endDate: "2026-01-22",
      status: "Working",
      isClosed: false
    },
    { 
      no: 5, 
      nama: "Bolt M10", 
      woNumber: "WO-005",
      startDate: "2026-01-20",
      endDate: "2026-01-30",
      status: "Not Working",
      isClosed: false
    },
  ]);

  const filteredParts = partsData.filter(
    (part) =>
      part.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      part.woNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddPart = () => {
    setAddForm({
      nama: "",
      woNumber: "",
      startDate: "",
      endDate: "",
      status: "Working",
      isClosed: false
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
    if (!addForm.nama || !addForm.woNumber || !addForm.startDate || !addForm.endDate) {
      alert("Please fill in all required fields");
      return;
    }

    const woExists = partsData.some(part => part.woNumber === addForm.woNumber);
    if (woExists) {
      alert("WO Number already exists. Please use a different WO Number.");
      return;
    }

    const newNo = partsData.length > 0 ? Math.max(...partsData.map(p => p.no)) + 1 : 1;

    const newPart = {
      no: newNo,
      nama: addForm.nama,
      woNumber: addForm.woNumber,
      startDate: addForm.startDate,
      endDate: addForm.endDate,
      status: addForm.status,
      isClosed: addForm.isClosed
    };

    setPartsData(prev => [...prev, newPart]);
    handleCloseAddModal();
    alert("Part added successfully!");
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setAddForm({
      nama: "",
      woNumber: "",
      startDate: "",
      endDate: "",
      status: "Working",
      isClosed: false
    });
  };

  const handleEdit = (part) => {
    setEditingPart(part);
    setEditForm({
      nama: part.nama,
      woNumber: part.woNumber,
      startDate: part.startDate,
      endDate: part.endDate,
      status: part.status,
      isClosed: part.isClosed
    });
    setShowEditModal(true);
  };

  const handleEditFormChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveEdit = () => {
    if (!editingPart) return;

    setPartsData(prevData =>
      prevData.map(part =>
        part.no === editingPart.no
          ? {
              ...part,
              nama: editForm.nama,
              woNumber: editForm.woNumber,
              startDate: editForm.startDate,
              endDate: editForm.endDate,
              status: editForm.status,
              isClosed: editForm.isClosed
            }
          : part
      )
    );

    handleCloseEditModal();
    alert("Part updated successfully!");
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingPart(null);
    setEditForm({
      nama: "",
      woNumber: "",
      startDate: "",
      endDate: "",
      status: "Working",
      isClosed: false
    });
  };

  const handleDelete = (part) => {
    if (window.confirm(`Are you sure you want to delete ${part.nama}?`)) {
      setPartsData(prevData => prevData.filter(p => p.no !== part.no));
    }
  };

  const handleStatusChange = (partNo, newStatus) => {
    setPartsData(prevData =>
      prevData.map(part =>
        part.no === partNo ? { ...part, status: newStatus } : part
      )
    );
  };

  const handleClosedToggle = (partNo) => {
    setPartsData(prevData =>
      prevData.map(part =>
        part.no === partNo ? { ...part, isClosed: !part.isClosed } : part
      )
    );
  };

  const sanitizeFilePart = (s) =>
    String(s || "")
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^\w\-]+/g, "_");

  const handleViewQR = async (part) => {
    try {
      setQrError("");
      setQrDataUrl("");
      setQrGenerating(true);

      const payload = {
        machine_name: String(part.woNumber),
        name_product: String(part.nama),
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

    const handleDownloadPdf = async () => {
      try {
        if (!qrPayload || !qrDataUrl) return;
  
        const woPart = sanitizeFilePart(qrPayload.woNumber);
        const namaPart = sanitizeFilePart(qrPayload.nama);
        const filename = `QR_PART_${woPart}_${namaPart}.pdf`;
  
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
          `machine_name : ${qrPayload.woNumber}`,
          `name_product      : ${qrPayload.nama}`,
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

  return (
    <div>
      <div className="parts-top">
        <div className="search-wrapper">
          <img src={searchIcon} alt="Search" className="search-icon" />
          <input
            type="text"
            placeholder="Search Parts"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <button className="add-parts-btn" onClick={handleAddPart}>
          Add Parts
        </button>
      </div>

      <div className="table-container">
        <table className="parts-table">
          <thead>
            <tr>
              <th>No.</th>
              <th>Nama Parts</th>
              <th>WO Number</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
              <th>Closed</th>
              <th className="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredParts.map((part) => (
              <tr key={part.no}>
                <td>{part.no}</td>
                <td>{part.nama}</td>
                <td>{part.woNumber}</td>
                <td>{part.startDate}</td>
                <td>{part.endDate}</td>
                <td>
                  <select 
                    className={`status-select ${part.status === "Working" ? "status-working" : "status-not-working"}`}
                    value={part.status}
                    onChange={(e) => handleStatusChange(part.no, e.target.value)}
                  >
                    <option value="Working">Working</option>
                    <option value="Not Working">Not Working</option>
                  </select>
                </td>
                <td>
                  <label className="checkbox-container">
                    <input
                      type="checkbox"
                      checked={part.isClosed}
                      onChange={() => handleClosedToggle(part.no)}
                    />
                    <span className="checkbox-label">{part.isClosed ? "Closed" : "Open"}</span>
                  </label>
                </td>
                <td className="text-center">
                  <div className="action-buttons">
                    <button 
                      className="action-btn" 
                      onClick={() => handleViewQR(part)}
                      title="View QR"
                    >
                      <QrCode size={16} />
                      View QR
                    </button>
                    <button 
                      className="action-btn" 
                      onClick={() => handleEdit(part)}
                      title="Edit"
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                    <button 
                      className="action-btn" 
                      onClick={() => handleDelete(part)}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* QR Modal */}
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
              <h2>Add New Part</h2>
              <button className="modal-close" onClick={handleCloseAddModal}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Nama Parts *</label>
                <input
                  type="text"
                  value={addForm.nama}
                  onChange={(e) => handleAddFormChange("nama", e.target.value)}
                  className="form-input"
                  placeholder="Masukkan nama parts"
                />
              </div>

              <div className="form-group">
                <label>WO Number *</label>
                <input
                  type="text"
                  value={addForm.woNumber}
                  onChange={(e) => handleAddFormChange("woNumber", e.target.value)}
                  className="form-input"
                  placeholder="Masukkan WO number (e.g., WO-001)"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    value={addForm.startDate}
                    onChange={(e) => handleAddFormChange("startDate", e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>End Date *</label>
                  <input
                    type="date"
                    value={addForm.endDate}
                    onChange={(e) => handleAddFormChange("endDate", e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  value={addForm.status}
                  onChange={(e) => handleAddFormChange("status", e.target.value)}
                  className={`form-input ${addForm.status === "Working" ? "status-working" : "status-not-working"}`}
                >
                  <option value="Working">Working</option>
                  <option value="Not Working">Not Working</option>
                </select>
              </div>

              <div className="form-group">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={addForm.isClosed}
                    onChange={(e) => handleAddFormChange("isClosed", e.target.checked)}
                  />
                  <span className="checkbox-label">
                    {addForm.isClosed ? "Closed" : "Open"}
                  </span>
                </label>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={handleCloseAddModal}>
                Cancel
              </button>
              <button className="btn-save" onClick={handleSaveAdd}>
                Add Part
              </button>
            </div>
          </div>
        </>
      )}
      
      {showEditModal && editingPart && (
        <>
          <div className="modal-overlay" onClick={handleCloseEditModal}></div>
          <div className="modal">
            <div className="modal-header">
              <h2>Edit Part</h2>
              <button className="modal-close" onClick={handleCloseEditModal}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>WO Number (Read Only)</label>
                <input
                  type="text"
                  value={editingPart.woNumber}
                  disabled
                  className="form-input disabled"
                />
              </div>

              <div className="form-group">
                <label>Nama Parts</label>
                <input
                  type="text"
                  value={editForm.nama}
                  onChange={(e) => handleEditFormChange("nama", e.target.value)}
                  className="form-input"
                  placeholder="Masukkan nama parts"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={editForm.startDate}
                    onChange={(e) => handleEditFormChange("startDate", e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={editForm.endDate}
                    onChange={(e) => handleEditFormChange("endDate", e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => handleEditFormChange("status", e.target.value)}
                  className={`form-input ${editForm.status === "Working" ? "status-working" : "status-not-working"}`}
                >
                  <option value="Working">Working</option>
                  <option value="Not Working">Not Working</option>
                </select>
              </div>

              <div className="form-group">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={editForm.isClosed}
                    onChange={(e) => handleEditFormChange("isClosed", e.target.checked)}
                  />
                  <span className="checkbox-label">
                    {editForm.isClosed ? "Closed" : "Open"}
                  </span>
                </label>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={handleCloseEditModal}>
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
