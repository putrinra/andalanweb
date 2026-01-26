import { useState } from "react";
import { Edit, Trash2, X } from "lucide-react";
import searchIcon from "../assets/search.png";
import "../styles/device.css";

export default function Device() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [addForm, setAddForm] = useState({
    name: "",
    serialNumber: "",
    status: "Active"
  });
  const [editForm, setEditForm] = useState({
    name: "",
    serialNumber: "",
    status: "Active"
  });

  const [devices, setDevices] = useState([
    { no: 1, name: "Device 1", serialNumber: "SN-001", status: "Active" },
    { no: 2, name: "Device 2", serialNumber: "SN-002", status: "Active" },
    { no: 3, name: "Device 3", serialNumber: "SN-003", status: "Inactive" },
    { no: 4, name: "Device 4", serialNumber: "SN-004", status: "Active" },
    { no: 5, name: "Device 5", serialNumber: "SN-005", status: "Active" },
    { no: 6, name: "Device 6", serialNumber: "SN-006", status: "Inactive" },
  ]);

  const filteredDevices = devices.filter(device =>
    device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    device.serialNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddDevice = () => {
    setAddForm({
      name: "",
      serialNumber: "",
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
    // Validasi form
    if (!addForm.name || !addForm.serialNumber) {
      alert("Please fill in all required fields");
      return;
    }

    // Cek apakah Serial Number sudah ada
    const snExists = devices.some(device => device.serialNumber === addForm.serialNumber);
    if (snExists) {
      alert("Serial Number already exists. Please use a different Serial Number.");
      return;
    }

    // Generate nomor baru
    const newNo = devices.length > 0 ? Math.max(...devices.map(d => d.no)) + 1 : 1;

    // Tambah device baru
    const newDevice = {
      no: newNo,
      name: addForm.name,
      serialNumber: addForm.serialNumber,
      status: addForm.status
    };

    setDevices(prev => [...prev, newDevice]);
    handleCloseAddModal();
    alert("Device added successfully!");
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setAddForm({
      name: "",
      serialNumber: "",
      status: "Active"
    });
  };

  const handleEdit = (device) => {
    setEditingDevice(device);
    setEditForm({
      name: device.name,
      serialNumber: device.serialNumber,
      status: device.status
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
    if (!editingDevice) return;

    setDevices(prevData =>
      prevData.map(device =>
        device.no === editingDevice.no
          ? {
              ...device,
              name: editForm.name,
              status: editForm.status
            }
          : device
      )
    );

    handleCloseEditModal();
    alert("Device updated successfully!");
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingDevice(null);
    setEditForm({
      name: "",
      serialNumber: "",
      status: "Active"
    });
  };

  const handleDelete = (device) => {
    if (window.confirm(`Are you sure you want to delete ${device.name}?`)) {
      setDevices(prevData => prevData.filter(d => d.no !== device.no));
      alert("Device deleted successfully!");
    }
  };

  const handleStatusChange = (deviceNo, newStatus) => {
    setDevices(prevData =>
      prevData.map(device =>
        device.no === deviceNo ? { ...device, status: newStatus } : device
      )
    );
  };

  return (
    <div>
      <div className="device-top">
        <div className="search-wrapper">
          <img src={searchIcon} alt="Search" className="search-icon" />
          <input
            type="text"
            placeholder="Search Device"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <button className="add-device-btn" onClick={handleAddDevice}>
          Add Device
        </button>
      </div>

      <div className="table-container">
        <table className="device-table">
          <thead>
            <tr>
              <th>No.</th>
              <th>Device Name</th>
              <th>Serial Number</th>
              <th>Status</th>
              <th className="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredDevices.map((device) => (
              <tr key={device.no}>
                <td>{device.no}</td>
                <td>{device.name}</td>
                <td>{device.serialNumber}</td>
                <td>
                  <select 
                    className={`status-select ${device.status === "Active" ? "status-active" : "status-inactive"}`}
                    value={device.status}
                    onChange={(e) => handleStatusChange(device.no, e.target.value)}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </td>
                <td className="text-center">
                  <div className="action-buttons">
                    <button 
                      className="action-btn btn-edit" 
                      onClick={() => handleEdit(device)}
                      title="Edit"
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                    <button 
                      className="action-btn btn-delete" 
                      onClick={() => handleDelete(device)}
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
      
      {showAddModal && (
        <>
          <div className="modal-overlay" onClick={handleCloseAddModal}></div>
          <div className="modal">
            <div className="modal-header">
              <h2>Add New Device</h2>
              <button className="modal-close" onClick={handleCloseAddModal}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Device Name *</label>
                <input
                  type="text"
                  value={addForm.name}
                  onChange={(e) => handleAddFormChange("name", e.target.value)}
                  className="form-input"
                  placeholder="Enter device name"
                />
              </div>

              <div className="form-group">
                <label>Serial Number *</label>
                <input
                  type="text"
                  value={addForm.serialNumber}
                  onChange={(e) => handleAddFormChange("serialNumber", e.target.value)}
                  className="form-input"
                  placeholder="Enter serial number (e.g., SN-001)"
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
                Add Device
              </button>
            </div>
          </div>
        </>
      )}

      {showEditModal && editingDevice && (
        <>
          <div className="modal-overlay" onClick={handleCloseEditModal}></div>
          <div className="modal">
            <div className="modal-header">
              <h2>Edit Device</h2>
              <button className="modal-close" onClick={handleCloseEditModal}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Serial Number (Read Only)</label>
                <input
                  type="text"
                  value={editingDevice.serialNumber}
                  disabled
                  className="form-input disabled"
                />
              </div>

              <div className="form-group">
                <label>Device Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => handleEditFormChange("name", e.target.value)}
                  className="form-input"
                  placeholder="Enter device name"
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => handleEditFormChange("status", e.target.value)}
                  className="form-input"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
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
