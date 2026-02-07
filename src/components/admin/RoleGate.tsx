import React from 'react';

export interface RoleGateProps {
  role: string;
  allowed: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const RoleGate: React.FC<RoleGateProps> = ({ role, allowed, children, fallback = null }) => {
  if (!allowed.includes(role)) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
};

export default RoleGate;
