const API_BASE = 'http://127.0.0.1:5000/api';

async function testConcurrency() {
  console.log('=== Starting FCFS Concurrency Stress Test ===\n');

  // 1. Login
  const loginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teacherId: 'Jonita_Madam', password: 'Jonita@104' })
  });
  const { token } = await loginRes.json();

  // 2. Create Presentation
  const presRes = await fetch(`${API_BASE}/presentations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      subjectCode: 'MCA-CONCURRENCY',
      subjectName: 'Concurrent Systems',
      presentationDate: '2026-08-30',
      numberOfTopics: 1
    })
  });
  const pres = await presRes.json();

  // 3. Save single topic
  await fetch(`${API_BASE}/presentations/${pres._id}/topics`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      topics: [{ topicNumber: 1, title: 'Distributed Consensus' }]
    })
  });

  // 4. Publish
  await fetch(`${API_BASE}/presentations/${pres._id}/publish`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` }
  });

  const details = await (await fetch(`${API_BASE}/student/presentations/${pres._id}`)).json();
  const targetTopicId = details.topics[0]._id;

  console.log(`Sending 10 simultaneous concurrent requests to claim the single topic (${targetTopicId})...`);

  // Launch 10 simultaneous students trying to grab the exact same single topic
  const requests = [];
  for (let i = 1; i <= 10; i++) {
    requests.push(
      fetch(`${API_BASE}/presentations/${pres._id}/select-topic`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: `Student ${i}`,
          studentId: `ROLL-${100 + i}`,
          topicId: targetTopicId
        })
      }).then(async (res) => ({
        status: res.status,
        data: await res.json(),
        student: `Student ${i}`
      }))
    );
  }

  const results = await Promise.all(requests);

  const successes = results.filter((r) => r.status === 201);
  const failures = results.filter((r) => r.status === 409 || r.status === 400);

  console.log(`\nResults: ${successes.length} SUCCESS, ${failures.length} REJECTED`);
  console.log(`Winner: ${successes[0]?.student} -> "${successes[0]?.data.selection?.topicTitle}"`);

  if (successes.length === 1 && failures.length === 9) {
    console.log('\n🎉 CONCURRENCY TEST PASSED: Exactly ONE student obtained the topic!');
  } else {
    throw new Error(`CONCURRENCY TEST FAILED! Successes: ${successes.length}, Failures: ${failures.length}`);
  }
}

testConcurrency().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
