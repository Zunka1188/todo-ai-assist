
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { SecurityConfig, SecurityConfigSchema, runSecurityAudit } from '@/utils/security';
import { useToast } from '@/hooks/use-toast';
import { useAppState } from './useStore';

interface SecurityContextType {
  config: SecurityConfig;
  updateConfig: (newConfig: Partial<SecurityConfig>) => void;
  runAudit: () => { issues: string[], recommendations: string[], score: number };
  auditResults: { issues: string[], recommendations: string[], score: number } | null;
}

const SecurityContext = createContext<SecurityContextType | null>(null);

interface SecurityProviderProps {
  children: ReactNode;
  initialConfig?: Partial<SecurityConfig>;
}

export const SecurityProvider: React.FC<SecurityProviderProps> = ({ 
  children, 
  initialConfig = {} 
}) => {
  // Parse and validate initial config
  const parsedConfig = SecurityConfigSchema.parse({
    csrfEnabled: true,
    secureHeadersEnabled: true,
    contentValidationEnabled: true,
    ...initialConfig
  });
  
  const [config, setConfig] = useState<SecurityConfig>(parsedConfig);
  const [auditResults, setAuditResults] = useState<{ 
    issues: string[],
    recommendations: string[], 
    score: number 
  } | null>(null);
  const { toast } = useToast();
  const { debugMode } = useAppState();
  
  const updateConfig = (newConfig: Partial<SecurityConfig>) => {
    setConfig(prev => {
      const updated = { ...prev, ...newConfig };
      
      // Log config changes in debug mode
      if (debugMode) {
        console.log('[Security] Config updated:', updated);
      }
      
      return updated;
    });
  };
  
  const runAudit = () => {
    const results = runSecurityAudit();
    setAuditResults(results);
    
    // Show toast with audit score
    toast({
      title: `Security Audit: ${results.score}%`,
      description: `Found ${results.issues.length} potential issues.`,
      variant: results.score < 70 ? "destructive" : 
               results.score < 90 ? "default" : "success",
    });
    
    return results;
  };
  
  const value = {
    config,
    updateConfig,
    runAudit,
    auditResults
  };
  
  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = (): SecurityContextType => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};
