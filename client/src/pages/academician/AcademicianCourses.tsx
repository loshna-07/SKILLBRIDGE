import React from 'react';
import { CourseProviderHub } from '../provider/CourseProviderHub';

export const AcademicianCourses: React.FC = () => {
  return (
    <CourseProviderHub
      providerRoleTitle="Academician Faculty"
      providerRole="ACADEMICIAN"
    />
  );
};