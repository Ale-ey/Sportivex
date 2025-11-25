import React, { useEffect, useState, useRef } from "react";
import { useGetProfile, useUpdateProfile, useChangePassword } from "../../../hooks/useAuth";
import { updateProfileWithFile } from "../../../services/authService";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "../../../components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { User, Mail, Phone, Calendar, MapPin, Edit2, Loader2, Lock, Upload, X, Users } from "lucide-react";
import toast from "react-hot-toast";
// profile route
const ProfileRoute: React.FC = () => {
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasInitialized = useRef(false);
  const isUpdatingRef = useRef(false);
  const { getProfile, user, isLoading: isLoadingProfile, error: profileError } = useGetProfile();
  const updateProfileHook = useUpdateProfile(() => {
    // After successful update, refresh profile to get updated data (including gender)
    getProfile();
    hasInitialized.current = false;
    isUpdatingRef.current = false;
  });

  const {
    register,
    handleSubmit: hookHandleSubmit,
    formState: { errors, isSubmitting },
    getValues,
    reset,
    error: updateError,
  } = updateProfileHook;

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors, isSubmitting: isChangingPassword },
    reset: resetPassword,
    error: changePasswordError,
  } = useChangePassword(() => {
    // Close dialog and reset form on success
    setIsChangePasswordOpen(false);
    resetPassword();
  });

  // Load profile data on mount
  useEffect(() => {
    getProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pre-populate form when user data is loaded (only once, and not during updates)
  useEffect(() => {
    if (user && !hasInitialized.current && !isUpdatingRef.current) {
      reset({
        name: user.name || "",
        phone: user.phone || "",
        dateOfBirth: user.dateOfBirth || "",
        address: user.address || "",
        profilePictureUrl: user.profilePictureUrl || "",
        bio: user.bio || "",
        gender: user.gender || "",
      }, {
        keepDefaultValues: false,
        keepValues: false,
        keepDirty: false,
        keepIsSubmitted: false,
        keepTouched: false,
        keepIsValid: false,
        keepSubmitCount: false,
      });
      hasInitialized.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // Only depend on user, not reset

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle file removal
  const handleFileRemove = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Custom submit handler for file uploads
  const handleFileUpload = React.useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // Prevent submission if already updating
    if (isUpdatingRef.current || isSubmitting) {
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('profilePicture', selectedFile!);
    
    // Get current form values
    const formValues = getValues();
    if (formValues.name) formDataToSend.append('name', formValues.name);
    if (formValues.phone) formDataToSend.append('phone', formValues.phone);
    if (formValues.dateOfBirth) formDataToSend.append('dateOfBirth', formValues.dateOfBirth);
    if (formValues.address) formDataToSend.append('address', formValues.address);
    if (formValues.bio) formDataToSend.append('bio', formValues.bio);
    if (formValues.gender) formDataToSend.append('gender', formValues.gender);

    isUpdatingRef.current = true;
    updateProfileWithFile(formDataToSend)
      .then((response) => {
        if (response.success) {
          toast.success('Profile updated successfully!', { id: 'updateProfileSuccess' });
          setSelectedFile(null);
          setPreviewUrl(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          hasInitialized.current = false;
          isUpdatingRef.current = false;
        } else {
          isUpdatingRef.current = false;
        }
      })
      .catch((error: any) => {
        isUpdatingRef.current = false;
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          'Profile update failed';
        toast.error(errorMessage, { id: 'updateProfileError' });
      });
  }, [selectedFile, isSubmitting, getValues]);

  // Use file upload handler if file is selected, otherwise use the hook's handleSubmit
  const onSubmit = selectedFile ? handleFileUpload : hookHandleSubmit;


  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (isLoadingProfile && !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#023E8A]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-[#023E8A]">Profile</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview Card */}
        <Card className="bg-white border border-[#E2F5FB]">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24">
                <AvatarImage 
                  src={user?.profilePictureUrl || ""} 
                  alt={user?.name || "Profile"} 
                />
                <AvatarFallback className="bg-[#023E8A] text-white text-2xl">
                  {user?.name ? getInitials(user.name) : "U"}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-xl text-[#023E8A]">
              {user?.name || "No Name"}
            </CardTitle>
            <CardDescription className="text-slate-600">
              {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "User"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-[#023E8A]" />
                <span className="text-slate-600">{user?.email || "N/A"}</span>
              </div>
              {user?.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-[#023E8A]" />
                  <span className="text-slate-600">{user.phone}</span>
                </div>
              )}
              {user?.cmsId && (
                <div className="flex items-center gap-3 text-sm">
                  <User className="h-4 w-4 text-[#023E8A]" />
                  <span className="text-slate-600">CMS ID: {user.cmsId}</span>
                </div>
              )}
              {user?.institution && (
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-[#023E8A]" />
                  <span className="text-slate-600">{user.institution}</span>
                </div>
              )}
              {user?.dateOfBirth && (
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-[#023E8A]" />
                  <span className="text-slate-600">
                    {new Date(user.dateOfBirth).toLocaleDateString()}
                  </span>
                </div>
              )}
              {user?.gender && (
                <div className="flex items-center gap-3 text-sm">
                  <Users className="h-4 w-4 text-[#023E8A]" />
                  <span className="text-slate-600 capitalize">
                    {user.gender}
                  </span>
                </div>
              )}
            </div>
            {user?.bio && (
              <div className="pt-4 border-t border-[#E2F5FB]">
                <p className="text-sm text-slate-600">{user.bio}</p>
              </div>
            )}
            <div className="pt-4 border-t border-[#E2F5FB]">
              <Button
                onClick={() => setIsChangePasswordOpen(true)}
                className="w-full bg-[#023E8A] hover:bg-[#023E8A]/90 text-white"
                variant="default"
              >
                <Lock className="h-4 w-4 mr-2" />
                Change Password
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile Form */}
        <Card className="lg:col-span-2 bg-white border border-[#E2F5FB]">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Edit2 className="h-5 w-5 text-[#023E8A]" />
              <CardTitle className="text-xl text-[#023E8A]">Edit Profile</CardTitle>
            </div>
            <CardDescription className="text-slate-600">
              Update your personal information and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form 
              onSubmit={onSubmit} 
              className="space-y-6"
            >
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-700">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  {...register("name")}
                  className="bg-white border-[#E2F5FB] focus:border-[#023E8A]"
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-slate-700">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  {...register("phone")}
                  className="bg-white border-[#E2F5FB] focus:border-[#023E8A]"
                />
                {errors.phone && (
                  <p className="text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth" className="text-slate-700">
                  Date of Birth
                </Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  {...register("dateOfBirth")}
                  className="bg-white border-[#E2F5FB] focus:border-[#023E8A]"
                />
                {errors.dateOfBirth && (
                  <p className="text-sm text-red-600">{errors.dateOfBirth.message}</p>
                )}
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address" className="text-slate-700">
                  Address
                </Label>
                <Input
                  id="address"
                  type="text"
                  placeholder="Enter your address"
                  {...register("address")}
                  className="bg-white border-[#E2F5FB] focus:border-[#023E8A]"
                />
                {errors.address && (
                  <p className="text-sm text-red-600">{errors.address.message}</p>
                )}
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label htmlFor="gender" className="text-slate-700">
                  Gender
                </Label>
                <select
                  id="gender"
                  {...register("gender")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-white border-[#E2F5FB] focus:border-[#023E8A]"
                >
                  <option value="">Select your gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && (
                  <p className="text-sm text-red-600">{errors.gender.message}</p>
                )}
                <p className="text-xs text-slate-500">
                  Required for swimming pool access. This determines which time slots you can see and reserve.
                </p>
              </div>

              {/* Profile Picture Upload */}
              <div className="space-y-2">
                <Label htmlFor="profilePicture" className="text-slate-700">
                  Profile Picture
                </Label>
                <div className="space-y-3">
                  {/* Preview */}
                  {(previewUrl || user?.profilePictureUrl) && (
                    <div className="relative inline-block">
                      <img
                        src={previewUrl || user?.profilePictureUrl || ''}
                        alt="Profile preview"
                        className="h-32 w-32 rounded-full object-cover border-2 border-[#E2F5FB]"
                      />
                      {previewUrl && (
                        <button
                          type="button"
                          onClick={handleFileRemove}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          aria-label="Remove image"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  )}

                  {/* File Input */}
                  <div className="flex items-center gap-3">
                    <input
                      ref={fileInputRef}
                      id="profilePicture"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="border-[#E2F5FB] text-slate-700 hover:bg-slate-50"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {selectedFile ? 'Change Picture' : 'Upload Picture'}
                    </Button>
                    {selectedFile && (
                      <span className="text-sm text-slate-600">
                        {selectedFile.name}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    Supported formats: JPEG, PNG, GIF, WebP (Max 5MB)
                  </p>
                  <p className="text-xs text-slate-400 italic">
                    Or enter a URL below if you prefer
                  </p>
                </div>
              </div>

              {/* Profile Picture URL (Alternative) */}
              <div className="space-y-2">
                <Label htmlFor="profilePictureUrl" className="text-slate-700">
                  Profile Picture URL (Alternative)
                </Label>
                <Input
                  id="profilePictureUrl"
                  type="url"
                  placeholder="https://example.com/your-photo.jpg"
                  {...register("profilePictureUrl")}
                  className="bg-white border-[#E2F5FB] focus:border-[#023E8A]"
                  disabled={!!selectedFile}
                />
                {errors.profilePictureUrl && (
                  <p className="text-sm text-red-600">{errors.profilePictureUrl.message}</p>
                )}
                {selectedFile && (
                  <p className="text-xs text-slate-500">
                    URL input is disabled when a file is selected. Remove the file to use URL instead.
                  </p>
                )}
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-slate-700">
                  Bio
                </Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself..."
                  rows={4}
                  {...register("bio")}
                  className="bg-white border-[#E2F5FB] focus:border-[#023E8A]"
                />
                {errors.bio && (
                  <p className="text-sm text-red-600">{errors.bio.message}</p>
                )}
              </div>

              {/* Error Messages */}
              {(profileError || updateError) && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">
                    {profileError || updateError}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => reset()}
                  disabled={isSubmitting}
                  className="border-[#E2F5FB] text-slate-700 hover:bg-slate-50"
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#023E8A] hover:bg-[#023E8A]/90 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-[#023E8A] flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Change Password
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Enter your current password and choose a new one. Make sure your new password is strong and secure.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitPassword} className="space-y-4">
            {/* Current Password */}
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-slate-700">
                Current Password
              </Label>
              <Input
                id="currentPassword"
                type="password"
                placeholder="Enter your current password"
                {...registerPassword("currentPassword")}
                className="bg-white border-[#E2F5FB] focus:border-[#023E8A]"
              />
              {passwordErrors.currentPassword && (
                <p className="text-sm text-red-600">
                  {passwordErrors.currentPassword.message}
                </p>
              )}
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-slate-700">
                New Password
              </Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Enter your new password"
                {...registerPassword("newPassword")}
                className="bg-white border-[#E2F5FB] focus:border-[#023E8A]"
              />
              {passwordErrors.newPassword && (
                <p className="text-sm text-red-600">
                  {passwordErrors.newPassword.message}
                </p>
              )}
            </div>

            {/* Error Message */}
            {changePasswordError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{changePasswordError}</p>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsChangePasswordOpen(false);
                  resetPassword();
                }}
                disabled={isChangingPassword}
                className="border-[#E2F5FB] text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isChangingPassword}
                className="bg-[#023E8A] hover:bg-[#023E8A]/90 text-white"
              >
                {isChangingPassword ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Changing...
                  </>
                ) : (
                  "Change Password"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileRoute;
