import React from 'react';
import { CourseProviderHub } from '../provider/CourseProviderHub';

export const InstitutionCourses: React.FC = () => {
  return (
    <CourseProviderHub
      providerRoleTitle="Institution / University"
      providerRole="INSTITUTION"
    />
  );
};