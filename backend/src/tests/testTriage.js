const sequelize = require('../config/db');
const { User, SymptomEpisode, SymptomLog, TriageRule, TriageResult, Notification } = require('../models');
const { evaluateTriage } = require('../services/triageEngine');

const runIntegrationTest = async () => {
  console.log('--- Starting Triage Engine Integration Test ---');
  let testUser = null;

  try {
    // 1. Authenticate Database
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // Sync models
    await sequelize.sync({ force: false });

    // 2. Clean up any stale test user
    await User.destroy({ where: { email: 'triage.test@aegis.com' } });

    // 3. Create Test User
    testUser = await User.create({
      email: 'triage.test@aegis.com',
      passwordHash: 'dummyhash123',
      firstName: 'TriageTest',
      lastName: 'User',
      dob: '1995-05-15',
      gender: 'female'
    });
    console.log(`Created test user: ${testUser.firstName} ${testUser.lastName}`);

    // 4. Ensure rules are seeded (e.g. Fever High for 3 days -> High Risk)
    // Find or create the 3-day Fever High rule
    const [feverRule, created] = await TriageRule.findOrCreate({
      where: {
        symptomName: 'Fever',
        severity: 'High',
        durationMinDays: 3
      },
      defaults: {
        riskLevel: 'High',
        recommendation: 'Seek immediate emergency attention.',
        explanation: 'High fever persisting for 3 or more days requires urgent diagnosis.',
        isActive: true
      }
    });
    console.log(`Verified Triage Rule exists (ID: ${feverRule.id}, Min Days: 3)`);

    // Ensure early 0-day Fever Low/Medium rules exist for comparison
    await TriageRule.findOrCreate({
      where: { symptomName: 'Fever', severity: 'High', durationMinDays: 0 },
      defaults: {
        riskLevel: 'Medium',
        recommendation: 'High body temperature. Monitor closely and consult a doctor.',
        explanation: 'High fever recorded. Active medical consultation is recommended.',
        isActive: true
      }
    });

    // 5. Simulate Day 1: Log High Fever
    console.log('\n--- Simulating Day 1: High Fever ---');
    const day1Date = new Date();
    day1Date.setDate(day1Date.getDate() - 3); // 3 days ago

    const day1Result = await evaluateTriage(testUser.id, {
      symptomName: 'Fever',
      severity: 'High',
      generalFeeling: 3,
      loggedAt: day1Date,
      notes: 'Feeling hot and shivers.'
    });

    console.log('Log Day 1 evaluation results:');
    console.log(`- Resolved Episode ID: ${day1Result.symptomLog.episodeId}`);
    console.log(`- Calculated Duration: ${day1Result.symptomLog.durationDays} day(s)`);
    console.log(`- Evaluated Risk: ${day1Result.triageResult.riskLevel} (Expected: Medium)`);
    console.log(`- Recommendation: ${day1Result.triageResult.recommendation}`);

    if (day1Result.triageResult.riskLevel !== 'Medium') {
      throw new Error(`Day 1 risk level was ${day1Result.triageResult.riskLevel}, expected Medium.`);
    }

    // 6. Simulate Day 4: Log High Fever (Same episode, should trigger the 3-day rule)
    console.log('\n--- Simulating Day 4: High Fever (Expect Escalation) ---');
    const day4Date = new Date(); // today

    const day4Result = await evaluateTriage(testUser.id, {
      symptomName: 'Fever',
      severity: 'High',
      generalFeeling: 2,
      loggedAt: day4Date,
      notes: 'Fever not dropping, feeling very weak.'
    });

    console.log('Log Day 4 evaluation results:');
    console.log(`- Episode ID: ${day4Result.symptomLog.episodeId}`);
    console.log(`- Calculated Duration: ${day4Result.symptomLog.durationDays} day(s)`);
    console.log(`- Evaluated Risk: ${day4Result.triageResult.riskLevel} (Expected: High)`);
    console.log(`- Recommendation: ${day4Result.triageResult.recommendation}`);
    console.log(`- Reason matched: "${day4Result.triageResult.explanation}"`);

    if (day4Result.triageResult.riskLevel !== 'High') {
      throw new Error(`Day 4 risk level was ${day4Result.triageResult.riskLevel}, expected High.`);
    }

    // 7. Verify notifications were generated
    const notifications = await Notification.findAll({ where: { userId: testUser.id } });
    console.log(`\nVerified notifications created for test user: ${notifications.length} alerts.`);
    notifications.forEach(n => {
      console.log(`- [${n.type.toUpperCase()}] ${n.title} -> ${n.message}`);
    });

    if (notifications.length < 2) {
      throw new Error(`Expected at least 2 notifications, found ${notifications.length}.`);
    }

    console.log('\n✅ Integration test completed successfully! Triage Engine functions correctly.');

  } catch (error) {
    console.error('\n❌ Integration test FAILED:', error);
  } finally {
    // Cleanup Test User and associated logs
    if (testUser) {
      console.log('\nCleaning up integration test user data...');
      await User.destroy({ where: { id: testUser.id } });
      console.log('Cleanup completed.');
    }
    sequelize.close();
    process.exit(0);
  }
};

runIntegrationTest();
