'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle } from 'lucide-react';

interface OnboardingLayoutProps {
  children: React.ReactNode;
}

export default function OnboardingLayout({ children }: OnboardingLayoutProps) {
  const pathname = usePathname();
  const [role, setRole] = useState<string>('school_admin');
  const [currentStep, setCurrentStep] = useState<number>(1);

  useEffect(() => {
    // Get full URL and parse search params
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const roleParam = searchParams.get('role') || 'school_admin';
      const stepParam = parseInt(searchParams.get('step') || '1');
      
      setRole(roleParam);
      setCurrentStep(stepParam);
    }
  }, []);
  
  const totalSteps = role === 'school_admin' ? 4 : 3;
  
  const getStepTitle = (step: number) => {
    if (role === 'school_admin') {
      switch (step) {
        case 1: return 'Change Password';
        case 2: return 'School Details';
        case 3: return 'Academic Year';
        case 4: return 'Create Classes';
        default: return '';
      }
    } else {
      switch (step) {
        case 1: return 'Change Password';
        case 2: return 'Profile Confirmation';
        case 3: return 'View Assignments';
        default: return '';
      }
    }
  };

  const getStepDescription = (step: number) => {
    if (role === 'school_admin') {
      switch (step) {
        case 1: return 'Set your new password';
        case 2: return 'Confirm and update school information';
        case 3: return 'Create your first academic year';
        case 4: return 'Add your first classes';
        default: return '';
      }
    } else {
      switch (step) {
        case 1: return 'Set your new password';
        case 2: return 'Complete your profile information';
        case 3: return 'Review your teaching assignments';
        default: return '';
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Progress */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to EduManage
            </h1>
            <p className="text-lg text-gray-600">
              Let's get you set up in just a few steps
            </p>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-900">
                Step {currentStep} of {totalSteps}
              </span>
              <span className="text-sm text-gray-500">
                {Math.round((currentStep / totalSteps) * 100)}% Complete
              </span>
            </div>
            <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
          </div>
          
          {/* Step Indicators */}
          <div className="flex justify-between mb-8">
            {Array.from({ length: totalSteps }, (_, index) => {
              const stepNumber = index + 1;
              const isCompleted = stepNumber < currentStep;
              const isCurrent = stepNumber === currentStep;
              
              return (
                <div key={stepNumber} className="flex flex-col items-center text-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    isCompleted 
                      ? 'bg-green-600 text-white' 
                      : isCurrent 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-500'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </div>
                  <div className="max-w-[100px]">
                    <p className={`text-xs font-medium ${
                      isCurrent ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {getStepTitle(stepNumber)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 hidden sm:block">
                      {getStepDescription(stepNumber)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
}
