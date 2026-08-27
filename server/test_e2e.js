const API_BASE = 'http://127.0.0.1:5000/api';

async function runTests() {
  console.log('=== Starting E2E Verification Tests ===\n');

  // 1. Test Login
  console.log('1. Testing Faculty Login...');
  const loginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teacherId: 'MCA_Teacher', password: 'Kishan@104' })
  });
  const loginData = await loginRes.json();
  if (!loginRes.ok || !loginData.token) {
    throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
  }
  const token = loginData.token;
  console.log(`✓ Faculty login successful: Welcome ${loginData.teacher.name} (${loginData.teacher.teacherId})`);

  // 2. Test Make Presentation (Draft)
  console.log('\n2. Testing Make Presentation (Draft)...');
  const makePresRes = await fetch(`${API_BASE}/presentations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      subjectCode: 'MCA-302',
      subjectName: 'Web Technology',
      presentationDate: '2026-08-28',
      numberOfTopics: 5
    })
  });
  const presData = await makePresRes.json();
  if (!makePresRes.ok) throw new Error(`Make presentation failed: ${JSON.stringify(presData)}`);
  const presentationId = presData._id;
  console.log(`✓ Created presentation draft: ID=${presentationId}, Status=${presData.status}`);

  // 3. Verify Draft is NOT visible to students
  console.log('\n3. Verifying Draft is hidden from students...');
  const studentPresListRes = await fetch(`${API_BASE}/student/presentations`);
  const studentPresList = await studentPresListRes.json();
  const isDraftVisible = studentPresList.some((p) => p._id === presentationId);
  if (isDraftVisible) {
    throw new Error('Draft presentation is visible to students! It must be hidden.');
  }
  console.log('✓ Verified: Draft presentation is hidden from student list.');

  // 4. Populate Topic Titles
  console.log('\n4. Adding/Saving Topic Titles...');
  const topicsToSave = [
    { topicNumber: 1, title: 'React Hooks' },
    { topicNumber: 2, title: 'REST API Architecture' },
    { topicNumber: 3, title: 'JWT Authentication' },
    { topicNumber: 4, title: 'WebSockets' },
    { topicNumber: 5, title: 'Progressive Web Applications' }
  ];
  const saveTopicsRes = await fetch(`${API_BASE}/presentations/${presentationId}/topics`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ topics: topicsToSave })
  });
  const saveTopicsData = await saveTopicsRes.json();
  if (!saveTopicsRes.ok) throw new Error(`Save topics failed: ${JSON.stringify(saveTopicsData)}`);
  console.log(`✓ Saved ${saveTopicsData.topics.length} topics successfully.`);

  // 5. Publish Presentation
  console.log('\n5. Publishing Presentation...');
  const publishRes = await fetch(`${API_BASE}/presentations/${presentationId}/publish`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` }
  });
  const publishData = await publishRes.json();
  if (!publishRes.ok) throw new Error(`Publish failed: ${JSON.stringify(publishData)}`);
  console.log(`✓ Presentation published successfully: status=${publishData.presentation.status}`);

  // 6. Student opens presentation and sees available topics
  console.log('\n6. Student fetching published presentation details...');
  const studentDetailsRes = await fetch(`${API_BASE}/student/presentations/${presentationId}`);
  const studentDetails = await studentDetailsRes.json();
  if (!studentDetailsRes.ok || studentDetails.topics.length !== 5) {
    throw new Error(`Student view error: ${JSON.stringify(studentDetails)}`);
  }
  console.log(`✓ Student sees ${studentDetails.topics.length} available topics.`);
  const restApiTopic = studentDetails.topics.find((t) => t.title === 'REST API Architecture');
  const reactTopic = studentDetails.topics.find((t) => t.title === 'React Hooks');

  // 7. Student 1 claims 'REST API Architecture'
  console.log('\n7. Student 1 (Kishan Solanki, ID 101) claims "REST API Architecture"...');
  const claim1Res = await fetch(`${API_BASE}/presentations/${presentationId}/select-topic`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      studentName: 'Kishan Solanki',
      studentId: '101',
      topicId: restApiTopic._id
    })
  });
  const claim1Data = await claim1Res.json();
  if (!claim1Res.ok) throw new Error(`Claim 1 failed: ${JSON.stringify(claim1Data)}`);
  console.log(`✓ Student 1 claim successful: Topic=${claim1Data.selection.topicTitle}, Time=${claim1Data.selection.selectedAt}`);

  // 8. Student 2 tries to claim the SAME topic ('REST API Architecture') - FCFS Race safety test
  console.log('\n8. Student 2 (Krunal Patel, ID 102) attempts to claim SAME already-taken topic...');
  const claimDuplicateTopicRes = await fetch(`${API_BASE}/presentations/${presentationId}/select-topic`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      studentName: 'Krunal Patel',
      studentId: '102',
      topicId: restApiTopic._id
    })
  });
  const claimDuplicateData = await claimDuplicateTopicRes.json();
  if (claimDuplicateTopicRes.ok) {
    throw new Error('FCFS failure! Topic was claimed twice.');
  }
  console.log(`✓ Correctly rejected duplicate topic claim: "${claimDuplicateData.message}"`);

  // 9. Student 1 tries to claim ANOTHER topic in same presentation - Student duplicate test
  console.log('\n9. Student 1 attempts to claim a second topic ("React Hooks")...');
  const claim2ndTopicRes = await fetch(`${API_BASE}/presentations/${presentationId}/select-topic`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      studentName: 'Kishan Solanki',
      studentId: '101',
      topicId: reactTopic._id
    })
  });
  const claim2ndTopicData = await claim2ndTopicRes.json();
  if (claim2ndTopicRes.ok) {
    throw new Error('Student Duplicate failure! Student 101 claimed multiple topics.');
  }
  console.log(`✓ Correctly rejected student duplicate selection: "${claim2ndTopicData.message}"`);

  // 10. Student 2 claims 'React Hooks'
  console.log('\n10. Student 2 (Krunal Patel, ID 102) claims "React Hooks"...');
  const claim2Res = await fetch(`${API_BASE}/presentations/${presentationId}/select-topic`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      studentName: 'Krunal Patel',
      studentId: '102',
      topicId: reactTopic._id
    })
  });
  const claim2Data = await claim2Res.json();
  if (!claim2Res.ok) throw new Error(`Claim 2 failed: ${JSON.stringify(claim2Data)}`);
  console.log(`✓ Student 2 claim successful: Topic=${claim2Data.selection.topicTitle}`);

  // 11. Faculty views Results
  console.log('\n11. Faculty fetching presentation results...');
  const resultsRes = await fetch(`${API_BASE}/presentations/${presentationId}/selections`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const resultsData = await resultsRes.json();
  if (!resultsRes.ok || resultsData.selections.length !== 2) {
    throw new Error(`Results mismatch: ${JSON.stringify(resultsData)}`);
  }
  console.log(`✓ Faculty results verified: ${resultsData.selections.length} selections recorded.`);
  console.log(`   - Selected: ${resultsData.presentation.selectedTopics}, Remaining: ${resultsData.presentation.remainingTopics}`);

  // 12. Faculty Releases Student 1's topic
  console.log('\n12. Faculty releases Student 1 topic selection...');
  const selectionToRelease = resultsData.selections.find((s) => s.studentId === '101');
  const releaseRes = await fetch(`${API_BASE}/selections/${selectionToRelease._id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  const releaseData = await releaseRes.json();
  if (!releaseRes.ok) throw new Error(`Release failed: ${JSON.stringify(releaseData)}`);
  console.log(`✓ Topic released: "${releaseData.message}"`);

  // Verify topic is available again for students
  const studentDetailsAfterRelease = await (await fetch(`${API_BASE}/student/presentations/${presentationId}`)).json();
  const isRestApiAvailableAgain = studentDetailsAfterRelease.topics.some((t) => t.title === 'REST API Architecture');
  if (!isRestApiAvailableAgain) {
    throw new Error('Released topic did not become available again!');
  }
  console.log('✓ Verified: "REST API Architecture" is available for selection again.');

  // 13. Faculty Locks Presentation
  console.log('\n13. Faculty locks presentation...');
  const lockRes = await fetch(`${API_BASE}/presentations/${presentationId}/lock`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` }
  });
  const lockData = await lockRes.json();
  if (!lockRes.ok) throw new Error(`Lock failed: ${JSON.stringify(lockData)}`);
  console.log(`✓ Presentation locked: status=${lockData.presentation.status}`);

  // 14. Student attempts claim on locked presentation
  console.log('\n14. Student 3 attempts topic selection on locked presentation...');
  const claimOnLockedRes = await fetch(`${API_BASE}/presentations/${presentationId}/select-topic`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      studentName: 'Vansh Patel',
      studentId: '103',
      topicId: restApiTopic._id
    })
  });
  const claimOnLockedData = await claimOnLockedRes.json();
  if (claimOnLockedRes.ok) {
    throw new Error('Claim on locked presentation should have failed!');
  }
  console.log(`✓ Correctly rejected claim on locked presentation: "${claimOnLockedData.message}"`);

  // 15. Faculty Unlocks Presentation
  console.log('\n15. Faculty unlocks presentation...');
  const unlockRes = await fetch(`${API_BASE}/presentations/${presentationId}/unlock`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` }
  });
  const unlockData = await unlockRes.json();
  if (!unlockRes.ok) throw new Error(`Unlock failed: ${JSON.stringify(unlockData)}`);
  console.log(`✓ Presentation unlocked: status=${unlockData.presentation.status}`);

  // 16. Student 3 claims the released topic after unlock
  console.log('\n16. Student 3 (Vansh Patel, ID 103) claims "REST API Architecture" after unlock...');
  const claim3Res = await fetch(`${API_BASE}/presentations/${presentationId}/select-topic`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      studentName: 'Vansh Patel',
      studentId: '103',
      topicId: restApiTopic._id
    })
  });
  const claim3Data = await claim3Res.json();
  if (!claim3Res.ok) throw new Error(`Claim 3 failed: ${JSON.stringify(claim3Data)}`);
  console.log(`✓ Student 3 claim successful: Topic=${claim3Data.selection.topicTitle}`);

  console.log('\n=========================================');
  console.log('🎉 ALL 16 E2E VERIFICATION CHECKS PASSED!');
  console.log('=========================================');
}

runTests().catch((err) => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
