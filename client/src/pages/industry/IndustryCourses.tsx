import React from 'react';
import { CourseProviderHub } from '../provider/CourseProviderHub';

export const IndustryCourses: React.FC = () => {
  return (
    <CourseProviderHub
      providerRoleTitle="Industry Partner"
      providerRole="INDUSTRY"
    />
  );
};