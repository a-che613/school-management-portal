'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Building2, AlertCircle, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createAuthenticatedHeaders, createAuthenticatedHeadersForFormData } from '@/lib/auth-utils';
import { toast } from 'sonner';

const schoolDetailsSchema = z.object({
  schoolName: z.string().min(1, 'School name is required'),
  address: z.string().min(1, 'Address is required'),
  contactPhone: z.string().min(1, 'Contact phone is required'),
  contactEmail: z.string().email('Valid email is required'),
});

interface SchoolAdminStep2Props {
  onComplete: (nextStep: number) => void;
  userId?: string;
}

interface SchoolData {
  schoolName: string;
  address: string;
  contactPhone: string;
  contactEmail: string;
  schoolId: string;
}

export default function SchoolAdminStep2({ onComplete, userId }: SchoolAdminStep2Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [schoolData, setSchoolData] = useState<SchoolData | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const form = useForm<z.infer<typeof schoolDetailsSchema>>({
    resolver: zodResolver(schoolDetailsSchema),
    defaultValues: {
      schoolName: '',
      address: '',
      contactPhone: '',
      contactEmail: '',
    },
  });

  useEffect(() => {
    const fetchSchoolData = async () => {
      if (!userId) return;

      try {
        const response = await fetch('/api/onboarding/school-details', {
          method: 'POST',
          headers: createAuthenticatedHeaders(),
          body: JSON.stringify({ userId }),
        });

        if (response.ok) {
          const data = await response.json();
          setSchoolData(data);
          
          // Pre-fill form with existing data
          form.reset({
            schoolName: data.schoolName || '',
            address: data.address || '',
            contactPhone: data.contactPhone || '',
            contactEmail: data.contactEmail || '',
          });
          
          // Set logo preview if exists
          if (data.logoUrl) {
            setLogoPreview(data.logoUrl);
          }
        }
      } catch (error) {
        console.error('Failed to fetch school data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchoolData();
  }, [userId, form]);

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be less than 2MB');
        return;
      }

      setLogoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (values: z.infer<typeof schoolDetailsSchema>) => {
    if (!userId || !schoolData?.schoolId) {
      toast.error('User or School ID is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('schoolId', schoolData.schoolId);
      formData.append('schoolName', values.schoolName);
      formData.append('address', values.address);
      formData.append('contactPhone', values.contactPhone);
      formData.append('contactEmail', values.contactEmail);
      
      if (logoFile) {
        formData.append('logo', logoFile);
      }

      const response = await fetch('/api/onboarding/update-school-details', {
        method: 'POST',
        headers: createAuthenticatedHeadersForFormData(),
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('School details updated successfully!');
        onComplete(3); // Move to step 3
      } else {
        toast.error(result.error || 'Failed to update school details');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update school details');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading school details...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Building2 className="h-5 w-5 text-blue-600" />
          <span>Confirm School Details</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please review and update your school information. These details will be displayed on reports and official documents.
          </AlertDescription>
        </Alert>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* School Logo Upload */}
          <div className="space-y-2">
            <Label>School Logo (Optional)</Label>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                {logoPreview ? (
                  <img 
                    src={logoPreview} 
                    alt="School Logo" 
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <Upload className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                  id="logo-upload"
                />
                <Label 
                  htmlFor="logo-upload"
                  className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Logo
                </Label>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG up to 2MB
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="schoolName">School Name *</Label>
              <Input
                id="schoolName"
                {...form.register('schoolName')}
                placeholder="Enter school name"
                disabled={isSubmitting}
              />
              {form.formState.errors.schoolName && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.schoolName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email *</Label>
              <Input
                id="contactEmail"
                type="email"
                {...form.register('contactEmail')}
                placeholder="contact@school.com"
                disabled={isSubmitting}
              />
              {form.formState.errors.contactEmail && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.contactEmail.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">School Address *</Label>
            <Input
              id="address"
              {...form.register('address')}
              placeholder="Enter school address"
              disabled={isSubmitting}
            />
            {form.formState.errors.address && (
              <p className="text-sm text-red-600">
                {form.formState.errors.address.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPhone">Contact Phone *</Label>
            <Input
              id="contactPhone"
              {...form.register('contactPhone')}
              placeholder="+237 XXX XXX XXX"
              disabled={isSubmitting}
            />
            {form.formState.errors.contactPhone && (
              <p className="text-sm text-red-600">
                {form.formState.errors.contactPhone.message}
              </p>
            )}
          </div>

          <div className="flex space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onComplete(1)}
              disabled={isSubmitting}
            >
              Back
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                'Continue to Academic Year Setup'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
