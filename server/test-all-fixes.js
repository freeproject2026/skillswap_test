import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 5001; // Use 5001 to avoid potential collision
const BASE_URL = `http://127.0.0.1:${PORT}`;

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  console.log('--- Starting Integration Test Suite for SkillSwap Fixes ---');

  // Spawn backend server with PORT=5001
  const serverProcess = spawn('node', ['server.js'], {
    cwd: __dirname,
    env: { ...process.env, PORT: String(PORT) },
    stdio: 'pipe',
  });

  serverProcess.stdout.on('data', (d) => {
    // console.log(`[SERVER] ${d}`);
  });
  serverProcess.stderr.on('data', (d) => {
    console.error(`[SERVER ERR] ${d}`);
  });

  // Wait for server to come up
  let serverReady = false;
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`${BASE_URL}/api/health`);
      if (res.ok) {
        serverReady = true;
        break;
      }
    } catch (e) {
      await sleep(1000);
    }
  }

  if (!serverReady) {
    serverProcess.kill();
    throw new Error('Server failed to start within timeout');
  }

  console.log(`✓ Server ready at ${BASE_URL}`);

  try {
    const ts = Date.now();
    const userAEmail = `alice_${ts}@example.com`;
    const userBEmail = `bob_${ts}@example.com`;
    const userCEmail = `charlie_${ts}@example.com`;
    const passwordA = 'Passw0rdAlice!';
    const passwordB = 'Passw0rdBob!';
    const passwordC = 'Passw0rdCharlie!';

    // ==========================================
    // 1. TEST AUTHENTICATION & LOGIN/SIGNUP
    // ==========================================
    console.log('\n--- 1. Testing Auth: Registration, Login, Logout, Repeated Login ---');

    // 1.1 Register User A
    const regResA = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Alice Student',
        email: userAEmail,
        password: passwordA,
        phone: `+1555${ts % 10000000}`,
      }),
    });
    const regDataA = await regResA.json();
    if (regResA.status !== 201 || !regDataA.token) {
      throw new Error(`Failed to register User A: status ${regResA.status} ${JSON.stringify(regDataA)}`);
    }
    console.log(`✓ 1.1 Registered User A successfully (${userAEmail})`);

    // 1.2 Register User B
    const regResB = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Bob Tutor',
        email: userBEmail,
        password: passwordB,
      }),
    });
    const regDataB = await regResB.json();
    if (regResB.status !== 201 || !regDataB.token) {
      throw new Error(`Failed to register User B: status ${regResB.status}`);
    }
    console.log(`✓ 1.2 Registered User B successfully (${userBEmail})`);

    // 1.3 Attempt duplicate registration with same email (normalized check)
    const dupRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Alice Duplicate',
        email: `  ${userAEmail.toUpperCase()}  `, // Test casing and whitespace trimming
        password: 'AnotherPassword123!',
      }),
    });
    if (dupRes.status !== 409) {
      throw new Error(`Duplicate registration expected 409 Conflict, got ${dupRes.status}`);
    }
    const dupData = await dupRes.json();
    console.log(`✓ 1.3 Duplicate registration rejected properly with 409: "${dupData.error}"`);

    // 1.4 Attempt login with wrong password
    const wrongPassRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userAEmail,
        password: 'WrongPassword!',
      }),
    });
    if (wrongPassRes.status !== 401) {
      throw new Error(`Invalid password expected 401 Unauthorized, got ${wrongPassRes.status}`);
    }
    console.log('✓ 1.4 Wrong password rejected with 401');

    // 1.5 Login with User A
    const loginRes1 = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userAEmail,
        password: passwordA,
      }),
    });
    const loginData1 = await loginRes1.json();
    if (loginRes1.status !== 200 || !loginData1.token) {
      throw new Error(`User A login 1 failed: status ${loginRes1.status}`);
    }
    const tokenA = loginData1.token;
    console.log('✓ 1.5 User A logged in successfully (Login #1)');

    // 1.6 Verify session restoration via /api/auth/me
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const meData = await meRes.json();
    if (meRes.status !== 200 || meData.user?.email !== userAEmail.toLowerCase()) {
      throw new Error(`Auth me check failed: status ${meRes.status}`);
    }
    console.log('✓ 1.6 Session restoration via /api/auth/me verified successfully');

    // 1.7 Simulate Logout (client clears token) and Log in again with the same account (Login #2)
    // This was previously failing due to double-password-hashing!
    const loginRes2 = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userAEmail,
        password: passwordA,
      }),
    });
    const loginData2 = await loginRes2.json();
    if (loginRes2.status !== 200 || !loginData2.token) {
      throw new Error(`User A repeated login (Login #2) failed! status ${loginRes2.status}`);
    }
    console.log('✓ 1.7 Repeated login with the same account succeeded (Login #2 - bug solved!)');

    // Also login User B to get tokenB
    const loginResB = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userBEmail,
        password: passwordB,
      }),
    });
    const tokenB = (await loginResB.json()).token;

    // Register User C (third party)
    const regResC = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Charlie Thirdparty',
        email: userCEmail,
        password: passwordC,
      }),
    });
    const tokenC = (await regResC.json()).token;
    console.log('✓ 1.8 User B & User C accounts ready');

    // ==========================================
    // 2. TEST SESSION BOOKING & ACCEPT/REJECT
    // ==========================================
    console.log('\n--- 2. Testing Session Booking, Authorization, Accept & Reject ---');

    const userBProfile = (await (await fetch(`${BASE_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${tokenB}` } })).json()).user;
    const userAProfile = (await (await fetch(`${BASE_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${tokenA}` } })).json()).user;
    const userCProfile = (await (await fetch(`${BASE_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${tokenC}` } })).json()).user;

    // 2.1 Self-booking prevention: User A tries to book with User A
    const selfBookingRes = await fetch(`${BASE_URL}/api/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({
        tutorId: userAProfile.id,
        skill: 'React',
        date: '2026-11-01',
        time: '14:00',
        duration: 60,
      }),
    });
    if (selfBookingRes.status !== 400) {
      throw new Error(`Self-booking expected 400 Bad Request, got ${selfBookingRes.status}`);
    }
    console.log('✓ 2.1 Self-booking prevented with 400 Bad Request');

    // 2.2 User A books session with User B (teacher)
    const bookRes1 = await fetch(`${BASE_URL}/api/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({
        tutorId: userBProfile.id,
        skill: 'Machine Learning',
        date: '2026-11-05',
        time: '10:00',
        duration: 60,
        sessionType: 'Skill Swap',
        notes: 'Would love to learn about gradient descent',
      }),
    });
    const bookData1 = await bookRes1.json();
    if (bookRes1.status !== 201 || bookData1.session?.status !== 'Pending') {
      throw new Error(`Booking session 1 failed: status ${bookRes1.status}, data: ${JSON.stringify(bookData1)}`);
    }
    const session1Id = bookData1.session.id;
    console.log(`✓ 2.2 Session booked: id ${session1Id} with status 'Pending'`);

    // 2.3 Verify in-app notification for User B (tutor)
    const notifResB = await fetch(`${BASE_URL}/api/notifications`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    const notifDataB = await notifResB.json();
    const swapNotif = notifDataB.notifications?.find((n) => n.type === 'skill_swap_request' && n.data?.sessionId === session1Id);
    if (!swapNotif) {
      throw new Error('Notification for tutor was not generated!');
    }
    console.log(`✓ 2.3 Tutor User B received in-app notification: "${swapNotif.title}"`);

    // 2.4 Authorization test: User A (student) attempts to accept own session
    const selfAcceptRes = await fetch(`${BASE_URL}/api/sessions/${session1Id}/accept`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    if (selfAcceptRes.status !== 403) {
      throw new Error(`Requester self-accept should return 403, got ${selfAcceptRes.status}`);
    }
    console.log('✓ 2.4 Requester prevented from accepting own request (403)');

    // 2.5 Authorization test: User C (unrelated third party) attempts to accept
    const thirdPartyAcceptRes = await fetch(`${BASE_URL}/api/sessions/${session1Id}/accept`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenC}` },
    });
    if (thirdPartyAcceptRes.status !== 403) {
      throw new Error(`Third party accept should return 403, got ${thirdPartyAcceptRes.status}`);
    }
    console.log('✓ 2.5 Unrelated third-party prevented from accepting request (403)');

    // 2.6 User B (intended tutor) accepts the session
    const acceptRes = await fetch(`${BASE_URL}/api/sessions/${session1Id}/accept`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    const acceptData = await acceptRes.json();
    if (acceptRes.status !== 200 || acceptData.session?.status !== 'Accepted') {
      throw new Error(`Accept session failed: status ${acceptRes.status}, data: ${JSON.stringify(acceptData)}`);
    }
    console.log(`✓ 2.6 Tutor User B accepted session: status is now '${acceptData.session.status}'`);

    // 2.7 Verify User A sees updated status 'Accepted' and received acceptance notification
    const checkSessionRes = await fetch(`${BASE_URL}/api/sessions`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const userASessions = (await checkSessionRes.json()).sessions;
    const s1 = userASessions.find((s) => s.id === session1Id);
    if (s1.status !== 'Accepted') {
      throw new Error(`User A sees incorrect session status: ${s1.status}`);
    }

    const notifResA = await fetch(`${BASE_URL}/api/notifications`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const notifDataA = await notifResA.json();
    const acceptedNotif = notifDataA.notifications?.find((n) => n.type === 'session_accepted');
    if (!acceptedNotif) {
      throw new Error('Student did not receive session_accepted notification!');
    }
    console.log('✓ 2.7 Student User A sees status Accepted and received acceptance notification');

    // 2.8 Prevent accepting already processed session
    const reAcceptRes = await fetch(`${BASE_URL}/api/sessions/${session1Id}/accept`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    if (reAcceptRes.status !== 400) {
      throw new Error(`Re-accepting should return 400 Bad Request, got ${reAcceptRes.status}`);
    }
    console.log('✓ 2.8 Accepting already-accepted session rejected with 400 Bad Request');

    // 2.9 Test Rejection Flow:
    // User A books session 2 with User B
    const bookRes2 = await fetch(`${BASE_URL}/api/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({
        tutorId: userBProfile.id,
        skill: 'Docker',
        date: '2026-11-06',
        time: '15:00',
        duration: 45,
      }),
    });
    const session2Id = (await bookRes2.json()).session.id;

    // User B rejects session 2 with reason
    const rejectRes = await fetch(`${BASE_URL}/api/sessions/${session2Id}/reject`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenB}` },
      body: JSON.stringify({ reason: 'Unavailable at this hour' }),
    });
    const rejectData = await rejectRes.json();
    if (rejectRes.status !== 200 || rejectData.session?.status !== 'Rejected') {
      throw new Error(`Reject session failed: status ${rejectRes.status}`);
    }
    console.log(`✓ 2.9 Tutor User B rejected session 2: status is '${rejectData.session.status}', reason: "${rejectData.session.rejectReason}"`);

    // Verify User A receives rejection notification
    const notifResA2 = await fetch(`${BASE_URL}/api/notifications`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const rejectedNotif = (await notifResA2.json()).notifications?.find((n) => n.type === 'session_rejected');
    if (!rejectedNotif) {
      throw new Error('Student did not receive session_rejected notification!');
    }
    console.log('✓ 2.10 Student User A received session_rejected notification');

    // ==========================================
    // 3. TEST VIDEO PLAYBACK & STREAMING
    // ==========================================
    console.log('\n--- 3. Testing Video Playback, HTTP Byte-Range Streaming & Upload ---');

    // 3.1 Fetch Video List
    const videosRes = await fetch(`${BASE_URL}/api/videos`);
    const videosData = await videosRes.json();
    if (videosRes.status !== 200 || !Array.isArray(videosData.videos) || videosData.videos.length === 0) {
      throw new Error(`Video listing failed: status ${videosRes.status}, count: ${videosData.videos?.length}`);
    }
    console.log(`✓ 3.1 Retrieved ${videosData.videos.length} videos from MongoDB catalog`);

    // 3.2 Verify video url is valid and test HTTP Byte-Range Streaming
    const sampleVideo = videosData.videos[0];
    const videoUrl = sampleVideo.videoUrl;
    console.log(`Testing video stream for: ${videoUrl}`);

    // Request first 1024 bytes (HTTP Range request standard for HTML5 video seeking)
    const rangeRes = await fetch(`${BASE_URL}${videoUrl}`, {
      headers: { Range: 'bytes=0-1023' },
    });

    if (rangeRes.status !== 206) {
      throw new Error(`Expected HTTP 206 Partial Content for Range request, got ${rangeRes.status}`);
    }
    const contentRange = rangeRes.headers.get('content-range');
    const acceptRanges = rangeRes.headers.get('accept-ranges');
    const contentType = rangeRes.headers.get('content-type');
    const corsHeader = rangeRes.headers.get('access-control-allow-origin');

    if (!contentRange || !contentRange.startsWith('bytes 0-1023/')) {
      throw new Error(`Invalid Content-Range header: ${contentRange}`);
    }
    if (acceptRanges !== 'bytes') {
      throw new Error(`Expected Accept-Ranges: bytes, got: ${acceptRanges}`);
    }
    if (!contentType || !contentType.startsWith('video/')) {
      throw new Error(`Expected video/* content type, got: ${contentType}`);
    }
    if (corsHeader !== '*') {
      throw new Error(`Expected Access-Control-Allow-Origin: *, got: ${corsHeader}`);
    }

    const chunk = await rangeRes.arrayBuffer();
    if (chunk.byteLength !== 1024) {
      throw new Error(`Expected exactly 1024 bytes returned, got ${chunk.byteLength}`);
    }
    console.log(`✓ 3.2 HTTP 206 Partial Content verified! Content-Range: ${contentRange}, Content-Type: ${contentType}, CORS: ${corsHeader}`);

    // Full video request
    const fullRes = await fetch(`${BASE_URL}${videoUrl}`);
    if (fullRes.status !== 200) {
      throw new Error(`Full video fetch failed with status ${fullRes.status}`);
    }
    console.log(`✓ 3.3 Full video fetch HTTP 200 OK (Content-Length: ${fullRes.headers.get('content-length')} bytes)`);

    // 3.4 Test multipart video upload with metadata
    const testVideoBuffer = Buffer.from('ftypisom' + 'fake_video_stream_bytes_for_testing');
    const uploadForm = new FormData();
    uploadForm.append('video', new Blob([testVideoBuffer], { type: 'video/mp4' }), 'tutorial_test.mp4');
    uploadForm.append('title', 'Test Algorithmic Thinking');
    uploadForm.append('description', 'Comprehensive guide to dynamic programming');
    uploadForm.append('category', 'Computer Science');
    uploadForm.append('skills', 'Algorithms, Python');

    const uploadRes = await fetch(`${BASE_URL}/api/upload/video`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: uploadForm,
    });
    const uploadData = await uploadRes.json();
    if (uploadRes.status !== 201 || !uploadData.video?.id) {
      throw new Error(`Video upload failed: status ${uploadRes.status}, data: ${JSON.stringify(uploadData)}`);
    }
    console.log(`✓ 3.4 Multipart video upload succeeded: video id ${uploadData.video.id}, videoUrl ${uploadData.video.videoUrl}`);

    console.log('\n======================================================');
    console.log('🎉 ALL INTEGRATION TESTS PASSED SUCCESSFULLY! 🎉');
    console.log('======================================================\n');
  } finally {
    serverProcess.kill();
  }
}

run().catch((err) => {
  console.error('\n❌ TEST RUNNER FAILED WITH ERROR:');
  console.error(err);
  process.exit(1);
});
