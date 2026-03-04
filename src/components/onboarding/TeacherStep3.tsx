'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BookOpen, Users, Calendar, CheckCircle, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

interface TeacherStep3Props {
  onComplete: () => void;
  userId?: string;
}

interface TeacherAssignment {
  subjects: string[];
  classes: string[];
  academicYear: string;
  schoolName: string;
}

export default function TeacherStep3({ onComplete, userId }: TeacherStep3Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [assignments, setAssignments] = useState<TeacherAssignment | null>(null);

  useEffect(() => {
    const fetchAssignments = async () => {
      if (!userId) return;

      try {
        const response = await fetch('/api/onboarding/teacher-assignments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId }),
        });

        if (response.ok) {
          const data = await response.json();
          setAssignments(data);
        }
      } catch (error) {
        console.error('Failed to fetch teacher assignments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignments();
  }, [userId]);

  const handleCompleteOnboarding = async () => {
    if (!userId) {
      toast.error('User ID is required');
      return;
    }

    setIsSubmitting(true);

    try {
      // Update user onboarding status
      const response = await fetch('/api/onboarding/complete-onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        toast.success('Onboarding completed successfully!');
        onComplete(); // Complete onboarding
      } else {
        toast.error('Failed to complete onboarding');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to complete onboarding');
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
            <span className="ml-2 text-gray-600">Loading assignments...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!assignments) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No assignments found. Please contact your school administrator.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BookOpen className="h-5 w-5 text-blue-600" />
          <span>Your Teaching Assignments</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Welcome! Here are your current teaching assignments for this academic year.
          </AlertDescription>
        </Alert>

        {/* School and Academic Year Info */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Academic Year: {assignments.academicYear}</h3>
          </div>
          <p className="text-blue-800">School: {assignments.schoolName}</p>
        </div>

        {/* Assigned Subjects */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Assigned Subjects</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {assignments.subjects.length > 0 ? (
              assignments.subjects.map((subject, index) => (
                <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-gray-800">{subject}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic">No subjects assigned</p>
            )}
          </div>
        </div>

        {/* Assigned Classes */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Assigned Classes</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {assignments.classes.length > 0 ? (
              assignments.classes.map((className, index) => (
                <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-gray-800">{className}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic">No classes assigned</p>
            )}
          </div>
        </div>

        {/* Welcome Message */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-900 mb-2">Welcome Message</h3>
          <p className="text-green-800">
            {assignments.subjects.length > 0 && assignments.classes.length > 0
              ? `You are assigned to teach ${assignments.subjects.join(' and ')} in ${assignments.classes.join(' and ')}.`
              : assignments.subjects.length > 0
                ? `You are assigned to teach ${assignments.subjects.join(' and ')}.`
                : assignments.classes.length > 0
                  ? `You are assigned to ${assignments.classes.join(' and ')}.`
                  : 'Your assignments will be updated by the school administrator.'
            }
          </p>
        </div>

        {/* Action Buttons */}
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
            onClick={handleCompleteOnboarding}
            className="flex-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Completing...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span>Go to Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
