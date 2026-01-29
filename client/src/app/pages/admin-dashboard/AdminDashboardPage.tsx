"use client";

import { useEffect, useState, ChangeEvent, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Users,
  Shield,
  BookOpen,
  TrendingUp,
  Clock,
  Edit,
  Trash2,
  Flag,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Lock,
  Plus,
  Upload,
  X,
  Pause,
  Play,
} from 'lucide-react';
import { toast } from 'sonner';
import { storage } from '../../lib/firebase';
import { ref as storageRef, uploadBytesResumable, getDownloadURL, UploadTask } from 'firebase/storage';
import {
  CreateUserModal,
  EditUserModal,
  DeleteUserModal,
  RoleChangeConfirmModal,
  ReportUserModal,
  CreateCourseModal,
} from '../../components/modals';

// Import API functions
import { 
  getUsers, 
  createUser, 
  updateUserDetails,
  deleteUserById,
  reportUser as reportUserApi 
} from '../../api/userApi';
import { 
  getAllCourses, 
  createCourse as createCourseApi 
} from '../../api/courseApi';

interface User {
  id: string;
  email: string;
  displayName: string | null;
  username: string | null;
  role: string;
  avatarUrl: string | null;
  signInCount: number;
  lastSignInAt: string | null;
  isActive: boolean;
}

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: number;
  difficulty: string;
  imageUrl: string | null;
  isPublished?: boolean;
}

interface CreateUserForm {
  email: string;
  displayName: string;
  username: string;
  role: string;
}

interface EditUserForm {
  displayName: string;
  username: string;
  email: string;
  role: string;
}

interface ReportForm {
  reason: string;
  details: string;
}

interface CourseForm {
  title: string;
  description: string;
  category: string;
  duration: number;
  difficulty: string;
  imageUrl: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRoleChangeConfirmOpen, setIsRoleChangeConfirmOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isCreateCourseModalOpen, setIsCreateCourseModalOpen] = useState(false);

  // Selected user for actions
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form states
  const [createForm, setCreateForm] = useState<CreateUserForm>({
    email: '',
    displayName: '',
    username: '',
    role: 'user',
  });

  const [editForm, setEditForm] = useState<EditUserForm>({
    displayName: '',
    username: '',
    email: '',
    role: 'user',
  });

  const [reportForm, setReportForm] = useState<ReportForm>({
    reason: '',
    details: '',
  });

  const [courseForm, setCourseForm] = useState<CourseForm>({
    title: '',
    description: '',
    category: 'Programming',
    duration: 0,
    difficulty: 'beginner',
    imageUrl: '',
  });

  const [pendingRoleChange, setPendingRoleChange] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // File upload states
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadTask, setUploadTask] = useState<UploadTask | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
  });

  useEffect(() => {
    const initDashboard = async () => {
      try {
        // Check if user is authenticated
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
          router.push('/login');
          return;
        }

        // Get current user role
        const userRole = localStorage.getItem('userRole');
        if (userRole !== 'admin' && userRole !== 'owner') {
          toast.error('Access denied. Admin privileges required.');
          router.push('/');
          return;
        }

        setCurrentUserRole(userRole);

        // Load users and courses
        await Promise.all([loadUsers(), loadCourses()]);
      } catch (error) {
        console.error('Error initializing dashboard:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    initDashboard();
  }, [router]);

  const loadUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data.users);
      setStats(prev => ({
        ...prev,
        totalUsers: data.users.length,
        activeUsers: data.users.filter((u: User) => u.isActive).length,
      }));
    } catch (error: any) {
      console.error('Error loading users:', error);
      toast.error(error.message || 'Failed to load users');
    }
  };

  const loadCourses = async () => {
    try {
      const data = await getAllCourses();
      setCourses(data.courses);
      setStats(prev => ({
        ...prev,
        totalCourses: data.courses.length,
        totalEnrollments: data.courses.reduce((sum: number, c: any) => sum + (c.enrollmentCount || 0), 0),
      }));
    } catch (error: any) {
      console.error('Error loading courses:', error);
      toast.error(error.message || 'Failed to load courses');
    }
  };

  const handleCreateUser = async () => {
    if (!createForm.email || !createForm.displayName) {
      toast.error('Email and display name are required');
      return;
    }

    setIsSaving(true);
    try {
      await createUser(createForm);
      toast.success('User created successfully');
      setIsCreateModalOpen(false);
      setCreateForm({ email: '', displayName: '', username: '', role: 'user' });
      await loadUsers();
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error(error.message || 'Failed to create user');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;

    setIsSaving(true);
    try {
      await updateUserDetails(selectedUser.id, editForm);
      toast.success('User updated successfully');
      setIsEditModalOpen(false);
      setSelectedUser(null);
      await loadUsers();
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast.error(error.message || 'Failed to update user');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    setIsSaving(true);
    try {
      await deleteUserById(selectedUser.id);
      toast.success('User deleted successfully');
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
      await loadUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(error.message || 'Failed to delete user');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReportUser = async () => {
    if (!selectedUser || !reportForm.reason) {
      toast.error('Reason is required');
      return;
    }

    setIsSaving(true);
    try {
      await reportUserApi(selectedUser.id, reportForm);
      toast.success('User reported successfully');
      setIsReportModalOpen(false);
      setSelectedUser(null);
      setReportForm({ reason: '', details: '' });
    } catch (error: any) {
      console.error('Error reporting user:', error);
      toast.error(error.message || 'Failed to report user');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateCourse = async () => {
    if (!courseForm.title || !courseForm.description || !courseForm.category) {
      toast.error('Title, description, and category are required');
      return;
    }

    setIsSaving(true);
    try {
      await createCourseApi({
        title: courseForm.title,
        description: courseForm.description,
        category: courseForm.category,
        duration: courseForm.duration || 0,
        difficulty: courseForm.difficulty,
        imageUrl: courseForm.imageUrl || undefined,
      });
      toast.success('Course created successfully');
      setIsCreateCourseModalOpen(false);
      setCourseForm({
        title: '',
        description: '',
        category: 'Programming',
        duration: 0,
        difficulty: 'beginner',
        imageUrl: '',
      });
      await loadCourses();
    } catch (error: any) {
      console.error('Error creating course:', error);
      toast.error(error.message || 'Failed to create course');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileSelected = (file: File) => {
    if (!file) return;

    // show local preview
    try {
      const url = URL.createObjectURL(file);
      setLocalPreview(url);
    } catch {}

    const filename = `${Date.now()}_${file.name}`;
    const storageReference = storageRef(storage, `courses/${filename}`);
    const task = uploadBytesResumable(storageReference, file);

    setUploadTask(task as UploadTask);
    setIsUploading(true);
    setUploadProgress(0);

    task.on(
      'state_changed',
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setUploadProgress(progress);
      },
      (error) => {
        console.error('Upload error:', error);
        toast.error('Image upload failed');
        setIsUploading(false);
        setUploadProgress(null);
        setUploadTask(null);
      },
      async () => {
        try {
          const url = await getDownloadURL(task.snapshot.ref);
          setCourseForm((prev) => ({ ...prev, imageUrl: url }));
          setLocalPreview(url);
          toast.success('Image uploaded');
        } catch (err) {
          console.error('Failed to get download URL:', err);
          toast.error('Failed to retrieve image URL');
        } finally {
          setIsUploading(false);
          setUploadProgress(null);
          setUploadTask(null);
        }
      }
    );
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleFileSelected(file);
  };

  const cancelUpload = () => {
    if (!uploadTask) return;
    try {
      uploadTask.cancel();
    } catch (e) {
      try { uploadTask.cancel(); } catch {}
    }
    setIsUploading(false);
    setUploadProgress(null);
    setUploadTask(null);
    // revoke local preview if present
    if (localPreview && localPreview.startsWith('blob:')) {
      URL.revokeObjectURL(localPreview);
    }
    setLocalPreview(null);
    setCourseForm((prev) => ({ ...prev, imageUrl: '' }));
    toast.info('Upload canceled');
  };

  const pauseUpload = () => {
    if (!uploadTask) return;
    try {
      uploadTask.pause();
    } catch (e) {}
  };

  const resumeUpload = () => {
    if (!uploadTask) return;
    try {
      uploadTask.resume();
    } catch (e) {}
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      displayName: user.displayName || '',
      username: user.username || '',
      email: user.email,
      role: user.role || 'user',
    });
    setIsEditModalOpen(true);
  };

  // Prevent the Edit modal from auto-focusing the first input when opened
  useEffect(() => {
    if (!isEditModalOpen) return;
    const t = setTimeout(() => {
      try {
        const active = document.activeElement as HTMLElement | null;
        if (active && typeof active.blur === 'function') active.blur();
      } catch (e) {
        // ignore
      }
    }, 0);
    return () => clearTimeout(t);
  }, [isEditModalOpen]);

  useEffect(() => {
    return () => {
      if (localPreview && localPreview.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(localPreview);
        } catch {}
      }
    };
  }, [localPreview]);

  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const openReportModal = (user: User) => {
    setSelectedUser(user);
    setReportForm({ reason: '', details: '' });
    setIsReportModalOpen(true);
  };

  const getRoleBadgeColor = (role: string) => {
    if (role === 'owner') return 'bg-gradient-to-r from-amber-500 to-orange-500';
    if (role === 'admin') return 'bg-gradient-to-r from-blue-500 to-purple-500';
    return 'bg-muted';
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAllowedRoles = (userRole: string): string[] => {
    if (currentUserRole === 'owner') {
      return userRole === 'owner' ? [] : ['user', 'admin'];
    }
    if (currentUserRole === 'admin') {
      return userRole === 'owner' ? [] : ['user', 'admin'];
    }
    return [];
  };

  // Pagination
  const totalUsers = users.length;
  const totalPages = Math.ceil(totalUsers / usersPerPage);
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Shield className="h-10 w-10 text-primary" />
          <div>
            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight gradient-text">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground text-lg font-sans mt-1">
              Manage users, courses, and platform settings
            </p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="gradient-card border-gradient backdrop-blur-sm hover:shadow-gradient-md transition-all duration-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-display font-medium">Total Users</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold gradient-text">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats.activeUsers} active users
            </p>
          </CardContent>
        </Card>

        <Card className="gradient-card border-gradient backdrop-blur-sm hover:shadow-gradient-md transition-all duration-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-display font-medium">Total Courses</CardTitle>
            <BookOpen className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold gradient-text">{stats.totalCourses}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {courses.filter(c => c.isPublished).length} published
            </p>
          </CardContent>
        </Card>

        <Card className="gradient-card border-gradient backdrop-blur-sm hover:shadow-gradient-md transition-all duration-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-display font-medium">Total Enrollments</CardTitle>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold gradient-text">{stats.totalEnrollments}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Across all courses
            </p>
          </CardContent>
        </Card>

        <Card className="gradient-card border-gradient backdrop-blur-sm hover:shadow-gradient-md transition-all duration-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-display font-medium">Avg. Duration</CardTitle>
            <Clock className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold gradient-text">
              {courses.length > 0 ? Math.round(courses.reduce((sum, c) => sum + c.duration, 0) / courses.length) : 0}h
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Per course
            </p>
          </CardContent>
        </Card>
      </div>

      {/* User Management Card */}
      <Card className="gradient-card border-gradient backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-display text-2xl">User Management</CardTitle>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="gradient-bg-primary"
              disabled={currentUserRole !== 'owner'}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="font-display px-4 py-3 border-r border-zinc-700/20">User</TableHead>
                  <TableHead className="font-display px-4 py-3 border-r border-zinc-700/20">Role</TableHead>
                  <TableHead className="font-display px-4 py-3 border-r border-zinc-700/20">Sign-ins</TableHead>
                  <TableHead className="font-display px-4 py-3 border-r border-zinc-700/20">Last Sign In</TableHead>
                  <TableHead className="font-display text-right px-4 py-3">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-muted/10 transition-colors">
                    <TableCell className="px-4 py-3 border-r border-zinc-700/20">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatarUrl || undefined} />
                          <AvatarFallback className="gradient-bg-primary text-primary-foreground">
                            {getInitials(user.displayName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.displayName || 'No name'}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 border-r border-zinc-700/20">
                      {user.role === 'owner' ? (
                        <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-md text-sm w-fit">
                          <Lock className="h-4 w-4 text-amber-400" />
                          <span className="font-medium">Owner</span>
                        </div>
                      ) : (
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium w-fit ${
                          user.role === 'admin'
                            ? 'bg-zinc-900 border border-blue-500/30 text-blue-400'
                            : 'bg-zinc-900 border border-emerald-500/30 text-emerald-400'
                        }`}>
                          <span className="capitalize">{user.role}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3 border-r border-zinc-700/20">{user.signInCount}</TableCell>
                    <TableCell className="text-muted-foreground px-4 py-3 border-r border-zinc-700/20">
                      {user.lastSignInAt
                        ? (() => {
                            try {
                              const d = new Date(user.lastSignInAt);
                              const dd = String(d.getDate()).padStart(2, '0');
                              const mm = String(d.getMonth() + 1).padStart(2, '0');
                              const yyyy = d.getFullYear();
                              return `${dd}/${mm}/${yyyy}`;
                            } catch {
                              return 'Invalid date';
                            }
                          })()
                        : 'Never'
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(user)}
                          className={`h-8 w-8 p-0 ${currentUserRole !== 'owner' ? 'opacity-50 cursor-not-allowed' : ''}`}
                          aria-label="Edit user"
                          disabled={currentUserRole !== 'owner'}
                          aria-disabled={currentUserRole !== 'owner'}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteModal(user)}
                          className={`h-8 w-8 p-0 ${currentUserRole !== 'owner' ? 'opacity-50 cursor-not-allowed text-red-400' : 'text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20'}`}
                          aria-label="Delete user"
                          disabled={currentUserRole !== 'owner'}
                          aria-disabled={currentUserRole !== 'owner'}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openReportModal(user)}
                          className={`h-8 w-8 p-0 ${currentUserRole !== 'owner' ? 'opacity-50 cursor-not-allowed' : ''}`}
                          aria-label="Report user"
                          disabled={currentUserRole !== 'owner'}
                          aria-disabled={currentUserRole !== 'owner'}
                        >
                          <Flag className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * usersPerPage) + 1} to {Math.min(currentPage * usersPerPage, totalUsers)} of {totalUsers} users
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={page === currentPage ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className={page === currentPage ? 'gradient-bg-primary' : ''}
                    aria-label={`Go to page ${page}`}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Course Management Card */}
      <Card className="gradient-card border-gradient backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-display text-2xl">Course Management</CardTitle>
            <Button
              onClick={() => setIsCreateCourseModalOpen(true)}
              className="gradient-bg-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Course
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Card key={course.id} className="overflow-hidden">
                {course.imageUrl && (
                  <div className="aspect-video w-full overflow-hidden">
                    <img
                      src={course.imageUrl}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardContent className="p-4">
                  <h3 className="font-display font-semibold text-lg mb-2">{course.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{course.description}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary">{course.category}</Badge>
                    <Badge variant="outline">{course.difficulty}</Badge>
                    <Badge variant="outline">{course.duration}h</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <CreateUserModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        createForm={createForm}
        setCreateForm={setCreateForm}
        isSaving={isSaving}
        onCreate={handleCreateUser}
      />

      <EditUserModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        editForm={editForm}
        setEditForm={setEditForm}
        selectedUser={selectedUser}
        currentUserRole={currentUserRole}
        pendingRoleChange={pendingRoleChange}
        setPendingRoleChange={setPendingRoleChange}
        setIsRoleChangeConfirmOpen={setIsRoleChangeConfirmOpen}
        onSave={handleEditUser}
        isSaving={isSaving}
      />

      <DeleteUserModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        selectedUser={selectedUser}
        onDelete={handleDeleteUser}
        isSaving={isSaving}
        getInitials={getInitials}
      />

      <RoleChangeConfirmModal
        open={isRoleChangeConfirmOpen}
        onOpenChange={setIsRoleChangeConfirmOpen}
        pendingRoleChange={pendingRoleChange}
        setPendingRoleChange={setPendingRoleChange}
        selectedUser={selectedUser}
        setEditForm={setEditForm}
        editForm={editForm}
      />

      <ReportUserModal
        open={isReportModalOpen}
        onOpenChange={setIsReportModalOpen}
        selectedUser={selectedUser}
        reportForm={reportForm}
        setReportForm={setReportForm}
        onSubmit={handleReportUser}
        isSaving={isSaving}
        getInitials={getInitials}
      />

      <CreateCourseModal
        open={isCreateCourseModalOpen}
        onOpenChange={setIsCreateCourseModalOpen}
        courseForm={courseForm}
        setCourseForm={setCourseForm}
        fileInputRef={fileInputRef}
        localPreview={localPreview}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
        handleFileUpload={handleFileUpload}
        handleFileSelected={handleFileSelected}
        cancelUpload={cancelUpload}
        pauseUpload={pauseUpload}
        resumeUpload={resumeUpload}
        handleCreateCourse={handleCreateCourse}
        isSaving={isSaving}
      />
    </div>
  );
}
