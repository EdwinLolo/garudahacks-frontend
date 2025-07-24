import * as React from "react";
import { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import {
  CircularProgress,
  Alert,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Snackbar,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { getAdminDashboardData, updateUser, deleteUser } from "../models/admin";
import Loading from "../components/Loading";

export default function AdminDashboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editDialog, setEditDialog] = useState({ open: false, user: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, user: null });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [schools, setSchools] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // Define columns with action buttons
  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "email", headerName: "Email", width: 200 },
    { field: "name", headerName: "Full Name", width: 180 },
    {
      field: "role",
      headerName: "Role",
      width: 120,
      editable: false,
    },
    {
      field: "grade",
      headerName: "Grade",
      width: 120,
      editable: false,
    },
    {
      field: "school_name",
      headerName: "School Name",
      width: 150,
      editable: false,
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box>
          <IconButton
            color="primary"
            size="small"
            onClick={() => handleEditClick(params.row)}
            title="Edit">
            <Edit />
          </IconButton>
          {/* <IconButton
            color="error"
            size="small"
            onClick={() => handleDeleteClick(params.row)}
            title="Delete">
            <Delete />
          </IconButton> */}
        </Box>
      ),
    },
  ];

  const paginationModel = { page: 0, pageSize: 10 };

  useEffect(() => {
    fetchData();
    fetchSchoolsAndSubjects();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAdminDashboardData();
      console.log("Admin dashboard data:", data);

      const transformedData = data.map((item, index) => ({
        id: item.user_id || index + 1,
        email: item.email || item.user?.email || "",
        name:
          item.name ||
          item.profile?.name ||
          `${item.first_name || ""} ${item.last_name || ""}`.trim(),
        role: item.role || item.profile?.role || "student",
        grade: item.grade || item.profile?.grade || 1,
        school_name: item.school_name || item.profile?.school_name || "",
        ...item,
      }));

      setRows(transformedData);
    } catch (err) {
      console.error("Error fetching admin dashboard data:", err);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const staticSchools = [
    { id: 1, name: "SD 1" },
    { id: 2, name: "SD 2" },
    { id: 3, name: "SD 3" },
  ];

  const fetchSchoolsAndSubjects = () => {
    setSchools(staticSchools);
  };

  // Handle edit button click
  const handleEditClick = (user) => {
    setEditDialog({ open: true, user: { ...user } });
  };

  // Handle delete button click
  const handleDeleteClick = (user) => {
    setDeleteDialog({ open: true, user });
  };

  // Handle edit form submission
  const handleEditSubmit = async (updatedUser) => {
    try {
      await updateUser(updatedUser.id, updatedUser);

      // Update the row in the local state
      setRows((prevRows) =>
        prevRows.map((row) =>
          row.id === updatedUser.id ? { ...row, ...updatedUser } : row
        )
      );

      setEditDialog({ open: false, user: null });
      setSnackbar({
        open: true,
        message: "User updated successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Error updating user:", error);
      setSnackbar({
        open: true,
        message: error.message || "Failed to update user",
        severity: "error",
      });
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    try {
      await deleteUser(deleteDialog.user.id);

      // Remove the row from local state
      setRows((prevRows) =>
        prevRows.filter((row) => row.id !== deleteDialog.user.id)
      );

      setDeleteDialog({ open: false, user: null });
      setSnackbar({
        open: true,
        message: "User deleted successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      setSnackbar({
        open: true,
        message: error.message || "Failed to delete user",
        severity: "error",
      });
    }
  };

  if (loading) {
    return (
      <Loading />
    );
  }

  if (error) {
    return (
      <div className="pt-24 px-24 flex flex-col items-center mx-auto">
        <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
          {error}
        </Alert>
      </div>
    );
  }

  return (
    <div className="pt-24 px-24 flex flex-col items-center mx-auto">
      <Paper sx={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{ pagination: { paginationModel } }}
          pageSizeOptions={[5, 10, 25]}
          checkboxSelection
          sx={{ border: 0 }}
          getRowId={(row) => row.id}
        />
      </Paper>

      {/* Edit Dialog */}
      <EditUserDialog
        open={editDialog.open}
        user={editDialog.user}
        schools={schools}
        onClose={() => setEditDialog({ open: false, user: null })}
        onSubmit={handleEditSubmit}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, user: null })}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete user "
          {deleteDialog.user?.name || deleteDialog.user?.email}"? This action
          cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, user: null })}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </div>
  );
}

// Enhanced Edit User Dialog Component
function EditUserDialog({ open, user, schools, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "student",
    grade: 1,
    school_name: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "student",
        grade: user.grade || 1,
        school_name: user.school_name || "",
      });
    }
  }, [user]);

  const handleChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = () => {
    onSubmit({
      ...user,
      ...formData,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit User</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField label="Full Name" value={formData.name} fullWidth />
          <TextField
            label="Email"
            value={formData.email}
            fullWidth
            type="email"
            InputProps={{
              readOnly: true,
            }}
          />
          <TextField
            label="Role"
            value={formData.role}
            onChange={handleChange("role")}
            select
            fullWidth>
            <MenuItem value="student">Student</MenuItem>
            <MenuItem value="teacher">Teacher</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </TextField>
          <TextField
            label="Grade"
            value={formData.grade}
            onChange={handleChange("grade")}
            type="number"
            fullWidth
            inputProps={{ min: 1, max: 12 }}
          />

          {/* School Selection */}
          <TextField
            label="School"
            value={formData.school_name}
            onChange={handleChange("school_name")}
            select
            fullWidth>
            <MenuItem value="">
              <em>Select School</em>
            </MenuItem>
            {schools.map((school) => (
              <MenuItem key={school.id} value={school.id}>
                {school.name || school.school_name || `School ${school.id}`}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}
