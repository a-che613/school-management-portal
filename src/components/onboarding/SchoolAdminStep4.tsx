'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GraduationCap, Plus, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

const classSchema = z.object({
  gradeLevel: z.string().min(1, 'Grade level is required'),
  stream: z.string().optional(),
});

const classesFormSchema = z.object({
  classes: z.array(classSchema).min(1, 'At least one class is required'),
});

interface SchoolAdminStep4Props {
  onComplete: () => void;
  userId?: string;
}

interface AcademicYear {
  id: string;
  name: string;
  isActive: boolean;
}

export default function SchoolAdminStep4({ onComplete, userId }: SchoolAdminStep4Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeYear, setActiveYear] = useState<AcademicYear | null>(null);

  const form = useForm<z.infer<typeof classesFormSchema>>({
    resolver: zodResolver(classesFormSchema),
    defaultValues: {
      classes: [{ gradeLevel: '', stream: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'classes',
  });

  useEffect(() => {
    const fetchActiveYear = async () => {
      if (!userId) return;

      try {
        const response = await fetch('/api/onboarding/active-academic-year', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId }),
        });

        if (response.ok) {
          const data = await response.json();
          setActiveYear(data.year);
        }
      } catch (error) {
        console.error('Failed to fetch active academic year:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActiveYear();
  }, [userId]);

  const addClass = () => {
    append({ gradeLevel: '', stream: '' });
  };

  const removeClass = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const onSubmit = async (values: z.infer<typeof classesFormSchema>) => {
    if (!userId || !activeYear?.id) {
      toast.error('User or Academic Year ID is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/onboarding/create-classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          academicYearId: activeYear.id,
          classes: values.classes.map(c => ({
            gradeLevel: c.gradeLevel.trim(),
            stream: c.stream?.trim() || '',
            displayName: c.stream?.trim() 
              ? `${c.gradeLevel.trim()}${c.stream.trim()}`
              : c.gradeLevel.trim(),
          })),
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(`${result.count} classes created successfully!`);
        
        // Update user onboarding status
        await fetch('/api/onboarding/complete-onboarding', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId }),
        });
        
        onComplete(); // Complete onboarding
      } else {
        toast.error(result.error || 'Failed to create classes');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create classes');
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
            <span className="ml-2 text-gray-600">Loading academic year...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!activeYear) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No active academic year found. Please create an academic year first.
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button onClick={() => window.history.back()}>
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <GraduationCap className="h-5 w-5 text-blue-600" />
          <span>Create First Classes</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Add classes for the academic year <strong>{activeYear.name}</strong>. You can add more classes later from the dashboard.
          </AlertDescription>
        </Alert>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Classes *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addClass}
                className="flex items-center space-x-1"
              >
                <Plus className="h-4 w-4" />
                <span>Add Class</span>
              </Button>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Class {index + 1}</span>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeClass(index)}
                      disabled={isSubmitting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor={`gradeLevel-${index}`}>Grade Level *</Label>
                    <Input
                      id={`gradeLevel-${index}`}
                      {...form.register(`classes.${index}.gradeLevel`)}
                      placeholder="e.g., Form 1, Grade 7, S1"
                      disabled={isSubmitting}
                    />
                    {form.formState.errors.classes?.[index]?.gradeLevel && (
                      <p className="text-sm text-red-600">
                        {form.formState.errors.classes[index]?.gradeLevel?.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`stream-${index}`}>Stream/Section (Optional)</Label>
                    <Input
                      id={`stream-${index}`}
                      {...form.register(`classes.${index}.stream`)}
                      placeholder="e.g., A, B, Blue, Arts"
                      disabled={isSubmitting}
                    />
                    {form.formState.errors.classes?.[index]?.stream && (
                      <p className="text-sm text-red-600">
                        {form.formState.errors.classes[index]?.stream?.message}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-xs text-gray-600">
                    <strong>Display Name:</strong> {form.watch(`classes.${index}.stream`) 
                      ? `${form.watch(`classes.${index}.gradeLevel`)}${form.watch(`classes.${index}.stream`)}`
                      : form.watch(`classes.${index}.gradeLevel`)
                    }
                  </p>
                </div>
              </div>
            ))}

            {form.formState.errors.classes && (
              <p className="text-sm text-red-600">
                {form.formState.errors.classes.message}
              </p>
            )}
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Class Naming Examples:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
              <div>• Form 1, Form 2, Form 3</div>
              <div>• Grade 7, Grade 8, Grade 9</div>
              <div>• Class A, Class B, Class C</div>
              <div>• Year 10, Year 11, Year 12</div>
            </div>
          </div>

          <div className="flex space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
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
                  <span>Creating Classes...</span>
                </div>
              ) : (
                'Complete Setup & Go to Dashboard'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
