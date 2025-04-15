
import React from 'react';

const TestComponent = () => {
  console.log('TestComponent rendering');
  return (
    <div className="p-10 flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Test Component</h1>
      <p>If you see this, the React application is rendering correctly.</p>
    </div>
  );
};

export default TestComponent;
