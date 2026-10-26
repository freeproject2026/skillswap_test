import { userService } from './userService';

export const skillMatchingService = {
  getRankedMatches: async (user, candidateUsers = null) => {
    let candidates = candidateUsers;
    if (!candidates) {
      candidates = await userService.getAllUsers();
    }

    if (!user) {
      return candidates.map(c => ({
        ...c,
        matchScore: 50,
        rationale: 'Active campus student on SkillSwap.',
        isMutualMatch: false
      }));
    }

    const currentUserId = user.id || user._id;
    // Exclude current user from candidate list
    const eligibleCandidates = candidates.filter(c => (c.id || c._id) !== currentUserId);

    const wantedSkills = (user.skillsWanted || []).map(s => ({
      name: s.name.toLowerCase(),
      targetLevel: s.targetLevel || 'Intermediate',
      priority: s.priority || 'Medium'
    }));

    const offeredSkills = (user.skillsOffered || []).map(s => s.name.toLowerCase());
    const userDays = new Set(user.availableDays || []);
    const userLanguages = (user.languages || []).map(l => l.split(' ')[0].toLowerCase());

    const scoredCandidates = eligibleCandidates.map(candidate => {
      let score = 0;
      const reasons = [];

      // 1. Complementary teaching: Can candidate teach what user wants?
      const matchingOffered = (candidate.skillsOffered || []).filter(cSkill =>
        wantedSkills.some(w => cSkill.name.toLowerCase().includes(w.name) || w.name.includes(cSkill.name.toLowerCase()))
      );

      if (matchingOffered.length > 0) {
        score += 45;
        const topMatched = matchingOffered[0];
        reasons.push(`Teaches ${topMatched.name} (${topMatched.level || 'Expert'})`);

        if (topMatched.evidenceStatus === 'Demonstrated Across Projects') {
          score += 15;
          reasons.push('has multi-project verified evidence');
        } else if (topMatched.evidenceStatus === 'Peer-Reviewed') {
          score += 10;
          reasons.push('holds peer-reviewed campus verification');
        }
      }

      // 2. Complementary learning: Does candidate want what user teaches? (Mutual barter bonus)
      const matchingWanted = (candidate.skillsWanted || []).filter(cSkill =>
        offeredSkills.some(o => cSkill.name.toLowerCase().includes(o) || o.includes(cSkill.name.toLowerCase()))
      );

      if (matchingWanted.length > 0) {
        score += 25;
        reasons.push(`wants to learn ${matchingWanted[0].name} from you (0-credit mutual swap eligible)`);
      }

      // 3. Schedule Overlap
      const candidateDays = candidate.availableDays || [];
      const commonDays = candidateDays.filter(d => userDays.has(d));
      if (commonDays.length > 0) {
        score += 10;
        reasons.push(`shares availability on ${commonDays.join(', ')}`);
      }

      // 4. Language Compatibility
      const candidateLanguages = (candidate.languages || []).map(l => l.split(' ')[0].toLowerCase());
      const commonLangs = candidateLanguages.filter(l => userLanguages.includes(l));
      if (commonLangs.length > 0) {
        score += 10;
        reasons.push(`fluent in ${candidate.languages[0].split(' ')[0]}`);
      }

      // 5. Teaching Rating
      if (candidate.teachingRating >= 4.8) {
        score += 10;
        reasons.push(`stellar ${candidate.teachingRating}★ teaching feedback`);
      }

      // Construct transparent human explanation sentence
      let rationale = '';
      if (reasons.length > 0) {
        rationale = `Recommended because they ${reasons.join(', and ')}.`;
      } else {
        rationale = 'Recommended peer based on active campus community participation.';
      }

      return {
        ...candidate,
        matchScore: score,
        rationale,
        isMutualMatch: matchingOffered.length > 0 && matchingWanted.length > 0
      };
    });

    // Sort by computed match score descending
    return scoredCandidates.sort((a, b) => b.matchScore - a.matchScore);
  }
};

export default skillMatchingService;
