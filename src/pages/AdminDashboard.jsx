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
import { Plus, UserPlus, Users } from "lucide-react";
import { getAdminDashboardData, updateUser, deleteUser } from "../models/admin";
import { signup } from "../models/auth";
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

  const handleAddUser = () => {
    setEditDialog({
      open: true,
      user: {
        name: "",
        email: "",
        role: "student",
        grade: 1,
        school_name: "",
      },
    });
  };

  // Define columns with action buttons
  const columns = [
    { field: "id", headerName: "ID", width: 150 },
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

      const transformedData = data.map((item, index) => {
        // Extract the ID from various possible locations
        const id = item?.user_id || item.id || `temp-${index + 1}`; // fallback ID

        // Extract email from various possible locations
        const email =
          item.email || item.user?.email || item.profile?.email || "";

        // Extract name from various possible locations
        const name =
          item.name ||
          item.profile?.name ||
          item.user?.user_metadata?.name ||
          `${item.first_name || ""} ${item.last_name || ""}`.trim() ||
          "";

        // Extract role from various possible locations
        const role =
          item.role || item.profile?.role || item.user?.role || "student";

        // Extract grade from various possible locations
        const grade = item.grade || item.profile?.grade || 1;

        // Extract school_name from various possible locations
        const school_name = item.school_name || item.profile?.school_name || "";

        return {
          id, // This is the key fix - ensure id is at the top level
          email,
          name,
          role,
          grade,
          school_name,
          // Keep original data for reference if needed
          originalData: item,
        };
      });

      console.log("Transformed data:", transformedData);
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
      if (updatedUser.id) {
        // Editing existing user
        await updateUser(updatedUser.id, updatedUser);
        // Update the row in the local state
        setRows((prevRows) =>
          prevRows.map((row) =>
            row.id === updatedUser.id ? { ...row, ...updatedUser } : row
          )
        );
        setSnackbar({
          open: true,
          message: "User updated successfully!",
          severity: "success",
        });
      } else {
        // Adding new user - destructure updatedUser to match signup parameters
        const { email, name, role, grade, school_name } = updatedUser;

        // Generate a temporary password or prompt user for password
        const password = "TempPass123!";

        const newUser = await signup(
          email,
          password,
          name,
          role,
          grade,
          school_name
        );

        setRows((prevRows) => [...prevRows, newUser]);
        setSnackbar({
          open: true,
          message: "User added successfully!",
          severity: "success",
        });

        fetchData();
      }

      // Close dialog
      setEditDialog({ open: false, user: null });
    } catch (error) {
      console.error("Error saving user:", error);
      setSnackbar({
        open: true,
        message: error.message || "Failed to save user",
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
    return <Loading />;
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
    <div className="pt-24 px-2.5 sm:px-10 md:px-14 lg:px-20 flex flex-col items-center mx-auto">
      <div className="w-full flex flex-col items-end mb-4 mr-1.5">
        <button
          onClick={handleAddUser}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors duration-200 shadow-md hover:shadow-lg">
          <Plus size={20} />
          Add User
        </button>
      </div>
      <Paper sx={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{ pagination: { paginationModel } }}
          pageSizeOptions={[5, 10, 25]}
          checkboxSelection
          sx={{ border: 0 }}
          getRowId={(row) => {
            console.log("Row ID:", row);
            return (
              row.id ||
              row.user?.id ||
              row.profile?.user_id ||
              row.id ||
              `fallback-${Math.random()}`
            );
          }}
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

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "student",
        grade: user.grade || 1,
        school_name: user.school_name || "",
      });
      // Clear errors when user changes
      setErrors({});
    }
  }, [user]);

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.role) {
      newErrors.role = "Role is required";
    }

    if (!formData.grade || formData.grade < 1 || formData.grade > 12) {
      newErrors.grade = "Grade must be between 1 and 12";
    }

    if (!formData.school_name) {
      newErrors.school_name = "School is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    // Validate form first
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare the updated user data
      const updatedUser = {
        ...user, // Keep original user data (like id)
        ...formData, // Override with form data
        grade: parseInt(formData.grade), // Ensure grade is a number
      };

      // Call the onSubmit function passed from parent
      await onSubmit(updatedUser);

      // Close dialog on success (parent will handle this via onSubmit)
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      // You might want to show an error message here
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset form and errors when closing
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{user?.id ? "Edit User" : "Add New User"}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Full Name"
            value={formData.name}
            onChange={handleChange("name")}
            fullWidth
            error={!!errors.name}
            helperText={errors.name}
            disabled={isSubmitting}
          />

          <TextField
            label="Email"
            value={formData.email}
            onChange={handleChange("email")}
            fullWidth
            type="email"
            error={!!errors.email}
            helperText={errors.email}
            disabled={isSubmitting}
            InputProps={{
              readOnly: !!user?.id, // Only readonly when editing existing user
            }}
          />

          <TextField
            label="Role"
            value={formData.role}
            onChange={handleChange("role")}
            select
            fullWidth
            error={!!errors.role}
            helperText={errors.role}
            disabled={isSubmitting}>
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
            error={!!errors.grade}
            helperText={errors.grade}
            disabled={isSubmitting}
            inputProps={{ min: 1, max: 12 }}
          />

          <TextField
            label="School"
            value={formData.school_name}
            onChange={handleChange("school_name")}
            select
            fullWidth
            error={!!errors.school_name}
            helperText={errors.school_name}
            disabled={isSubmitting}>
            <MenuItem value="">
              <em>Select School</em>
            </MenuItem>
            {schools.map((school) => (
              <MenuItem
                key={school.id}
                value={school.name || school.school_name}>
                {school.name || school.school_name || `School ${school.id}`}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : null}>
          {isSubmitting ? "Saving..." : user?.id ? "Save Changes" : "Add User"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
