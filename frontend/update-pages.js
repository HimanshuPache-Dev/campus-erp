const fs = require('fs');
const path = require('path');

const pagesToUpdate = [
  'src/pages/admin/Dashboard.jsx',
  'src/pages/admin/Students.jsx',
  'src/pages/admin/Faculty.jsx',
  'src/pages/admin/Courses.jsx',
  'src/pages/admin/Alerts.jsx',
  'src/pages/admin/Attendance.jsx',
  'src/pages/admin/Results.jsx',
  'src/pages/admin/Fees.jsx',
  'src/pages/faculty/Dashboard.jsx',
  'src/pages/student/Dashboard.jsx'
];

pagesToUpdate.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Add import at top if not exists
    if (!content.includes('useDatabaseData')) {
      content = content.replace(
        /import React/,
        'import React, { useState, useEffect } from \'react\';\nimport { useDatabaseData } from \'../../hooks/useDatabaseData\';'
      );
    }
    
    // Replace static data arrays
    content = content.replace(
      /const \[(\w+), set\1\] = useState\(\[.*?\]\);/gs,
      '// Data loaded from database via useDatabaseData hook'
    );
    
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Updated: ${filePath}`);
  }
});