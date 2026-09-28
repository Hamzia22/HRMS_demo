// scripts/test-system.js — End-to-End API verification script
const http = require('http');

let port = process.env.PORT || 5001;

function apiRequest(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        hostname: 'localhost',
        port: port,
        path: path,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          try {
            const parsed = raw ? JSON.parse(raw) : null;
            resolve({ status: res.statusCode, data: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, raw });
          }
        });
      }
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting HRM System End-to-End Tests on port', port, '...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Health Check
    const health = await apiRequest('GET', '/api/health');
    assert(health.status === 200 && health.data.status === 'ok', 'Health check endpoint returns ok');

    // 2. Authentication - Test all four accounts
    console.log('\n🔑 Testing Authentication for all 4 roles:');
    const roles = [
      { role: 'admin', email: 'admin@hrm.com', pass: 'admin123' },
      { role: 'hr', email: 'hr@hrm.com', pass: 'hr123' },
      { role: 'manager', email: 'manager@hrm.com', pass: 'manager123' },
      { role: 'employee', email: 'employee@hrm.com', pass: 'employee123' },
    ];

    const tokens = {};
    for (const r of roles) {
      const res = await apiRequest('POST', '/api/auth/login', { email: r.email, password: r.pass });
      assert(res.status === 200 && res.data.token && res.data.user.role === r.role, `Login succeeded for role: ${r.role} (${r.email})`);
      tokens[r.role] = res.data.token;
    }

    // Invalid login check
    const badLogin = await apiRequest('POST', '/api/auth/login', { email: 'admin@hrm.com', password: 'wrong' });
    assert(badLogin.status === 401, 'Invalid password rejected with 401');

    // 3. Role Authorization & Scoping
    console.log('\n👥 Testing Employee Access & Scoping:');
    const adminEmps = await apiRequest('GET', '/api/employees', null, tokens.admin);
    assert(adminEmps.status === 200 && adminEmps.data.length >= 10, `Admin retrieves all employees (count: ${adminEmps.data.length})`);

    const managerEmps = await apiRequest('GET', '/api/employees', null, tokens.manager);
    assert(managerEmps.status === 200 && managerEmps.data.length < adminEmps.data.length, `Manager retrieves team employees only (count: ${managerEmps.data.length})`);

    const employeeEmps = await apiRequest('GET', '/api/employees', null, tokens.employee);
    assert(employeeEmps.status === 200 && employeeEmps.data.length === 1, `Employee retrieves only self (count: ${employeeEmps.data.length})`);

    // 4. Employee CRUD (Admin)
    console.log('\n📝 Testing Employee CRUD:');
    const newEmpPayload = {
      name: 'Test Candidate',
      email: 'candidate.test@hrm.com',
      phone: '+1 555-999-8888',
      department: 'Development',
      departmentId: 'dept-1',
      position: 'QA Engineer',
      joiningDate: '2024-03-01',
      employmentType: 'Full-time',
      status: 'Active',
    };
    const created = await apiRequest('POST', '/api/employees', newEmpPayload, tokens.admin);
    assert(created.status === 201 && created.data.name === 'Test Candidate', 'Admin successfully created new employee');
    const createdId = created.data.id;

    // Update employee
    const updated = await apiRequest('PUT', `/api/employees/${createdId}`, { position: 'Lead QA Engineer' }, tokens.admin);
    assert(updated.status === 200 && updated.data.position === 'Lead QA Engineer', 'Admin successfully updated employee');

    // Patch status
    const statusPatched = await apiRequest('PATCH', `/api/employees/${createdId}/status`, { status: 'Inactive' }, tokens.admin);
    assert(statusPatched.status === 200 && statusPatched.data.status === 'Inactive', 'Admin successfully patched employee status to Inactive');

    // Employee cannot create employee
    const forbiddenCreate = await apiRequest('POST', '/api/employees', newEmpPayload, tokens.employee);
    assert(forbiddenCreate.status === 403, 'Employee is forbidden (403) from creating employee');

    // 5. Departments Management
    console.log('\n🏢 Testing Departments:');
    const depts = await apiRequest('GET', '/api/departments', null, tokens.admin);
    assert(depts.status === 200 && depts.data.length >= 6, `Retrieved departments with headcounts (count: ${depts.data.length})`);

    const newDept = await apiRequest('POST', '/api/departments', { name: 'DevOps & Cloud', description: 'Infrastructure engineering' }, tokens.admin);
    assert(newDept.status === 201 && newDept.data.name === 'DevOps & Cloud', 'Admin successfully created new department');

    // Delete empty department
    const deleteEmpty = await apiRequest('DELETE', `/api/departments/${newDept.data.id}`, null, tokens.admin);
    assert(deleteEmpty.status === 200, 'Admin successfully deleted empty department');

    // Delete department with active employees should fail
    const populatedDept = depts.data.find(d => d.headCount > 0);
    if (populatedDept) {
      const deletePopulated = await apiRequest('DELETE', `/api/departments/${populatedDept.id}`, null, tokens.admin);
      assert(deletePopulated.status === 409, 'Deleting populated department correctly rejected with 409');
    }

    // 6. Attendance
    console.log('\n📅 Testing Attendance:');
    const attAll = await apiRequest('GET', '/api/attendance', null, tokens.admin);
    assert(attAll.status === 200 && attAll.data.length > 0, `Admin retrieved attendance records (count: ${attAll.data.length})`);

    const attSummary = await apiRequest('GET', '/api/attendance/today/summary', null, tokens.admin);
    assert(attSummary.status === 200 && typeof attSummary.data.present === 'number', 'Today attendance summary calculated properly');

    const attEmployee = await apiRequest('GET', '/api/attendance', null, tokens.employee);
    assert(attEmployee.status === 200, `Employee retrieved own attendance logs (count: ${attEmployee.data.length})`);

    // 7. Leaves Workflow
    console.log('\n🏖️ Testing Leave Requests & Approval:');
    const leaveApp = await apiRequest('POST', '/api/leaves', {
      leaveType: 'Casual Leave',
      startDate: '2026-10-01',
      endDate: '2026-10-03',
      reason: 'Attending family celebration',
    }, tokens.employee);
    assert(leaveApp.status === 201 && leaveApp.data.status === 'Pending', 'Employee submitted leave application (Pending)');

    // Approve leave as Admin
    const approved = await apiRequest('PUT', `/api/leaves/${leaveApp.data.id}/status`, { status: 'Approved' }, tokens.admin);
    assert(approved.status === 200 && approved.data.status === 'Approved', 'Admin approved the pending leave request');

    // Leave stats
    const leaveStats = await apiRequest('GET', '/api/leaves/stats', null, tokens.admin);
    assert(leaveStats.status === 200 && leaveStats.data.approved > 0, 'Leave statistics reflect approved counts');

    // 8. Dashboard stats for all roles
    console.log('\n📊 Testing Dashboard Stats:');
    for (const role of ['admin', 'hr', 'manager', 'employee']) {
      const dStats = await apiRequest('GET', '/api/dashboard/stats', null, tokens[role]);
      assert(dStats.status === 200 && typeof dStats.data === 'object', `Dashboard stats endpoint returned metrics for ${role}`);
    }

    console.log(`\n========================================`);
    console.log(`🎉 TEST SUMMARY: ${passed} passed, ${failed} failed`);
    console.log(`========================================\n`);

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
