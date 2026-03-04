'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

const academicYearSchema = z.object({
  yearName: z.string().min(1, 'Academic year name is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
}).refine((data) => new Date(data.endDate) > new Date(data.startDate), {
  message: 'End date must be after start date',
  path: ['endDate'],
});

interface SchoolAdminStep3Props {
  onComplete: (nextStep: number) => void;
  userId?: string;
}

interface AcademicYear {
  id: string;
  name: string;
  isActive: boolean;
}

export default function SchoolAdminStep3({ onComplete, userId }: SchoolAdminStep3Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [existingYears, setExistingYears] = useState<AcademicYear[]>([]);
  const [hasActiveYear, setHasActiveYear] = useState(false);

  const form = useForm<z.infer<typeof academicYearSchema>>({
    resolver: zodResolver(academicYearSchema),
    defaultValues: {
      yearName: new Date().getFullYear() + '/' + (new Date().getFullYear() + 1),
      startDate: new Date().toISOString().split('T')[0], // Today's date
      endDate: new Date(new Date().getFullYear() + 1, 5, 30).toISOString().split('T')[0], // Next year June 30
    },
  });

  useEffect(() => {
    const fetchAcademicYears = async () => {
      if (!userId) return;

      try {
        const response = await fetch('/api/onboarding/academic-years', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId }),
        });

        if (response.ok) {
          const data = await response.json();
          setExistingYears(data.years || []);
          setHasActiveYear(data.hasActiveYear || false);
        }
      } catch (error) {
        console.error('Failed to fetch academic years:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAcademicYears();
  }, [userId]);

  const onSubmit = async (values: z.infer<typeof academicYearSchema>) => {
    if (!userId) {
      toast.error('User ID is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/onboarding/create-academic-year', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          yearName: values.yearName,
          startDate: values.startDate,
          endDate: values.endDate,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Academic year created successfully!');
        form.reset();
        onComplete(4); // Move to step 4
      } else {
        toast.error(result.error || 'Failed to create academic year');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create academic year');
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
            <span className="ml-2 text-gray-600">Loading academic years...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          <span>Create First Academic Year</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Create your first academic year. Only one academic year can be active at a time.
          </AlertDescription>
        </Alert>

        {/* Existing Academic Years */}
        {existingYears.length > 0 && (
          <div className="space-y-3">
            <Label>Existing Academic Years</Label>
            <div className="space-y-2">
              {existingYears.map((year) => (
                <div key={year.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{year.name}</span>
                    {year.isActive && (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  {year.isActive && <CheckCircle className="h-5 w-5 text-green-600" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {hasActiveYear ? (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              You already have an active academic year. You can proceed to create classes.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="yearName">Academic Year Name *</Label>
              <Input
                id="yearName"
                {...form.register('yearName')}
                placeholder="e.g., 2025/2026"
                disabled={isSubmitting}
              />
              {form.formState.errors.yearName && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.yearName.message}
                </p>
              )}
              <p className="text-xs text-gray-500">
                Example: 2025/2026, 2026/2027
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  {...form.register('startDate')}
                  disabled={isSubmitting}
                />
                {form.formState.errors.startDate && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.startDate.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  {...form.register('endDate')}
                  disabled={isSubmitting}
                />
                {form.formState.errors.endDate && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.endDate.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onComplete(2)}
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
                    <span>Creating...</span>
                  </div>
                ) : (
                  'Create Academic Year'
                )}
              </Button>
            </div>
          </form>
        )}

        {hasActiveYear && (
          <div className="flex space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onComplete(2)}
            >
              Back
            </Button>
            <Button
              onClick={() => onComplete(4)}
              className="flex-1"
            >
              Continue to Class Setup
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
