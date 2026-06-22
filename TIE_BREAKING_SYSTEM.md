# Candidate Ranking Tie-Breaking System

## Overview

When multiple candidates have the **same ATS score**, the system now uses a sophisticated tie-breaking algorithm to rank them more accurately. This ensures fair and consistent ranking based on multiple factors beyond just skill matching.

## How It Works

### Primary Ranking: ATS Score
Candidates are first sorted by their **ATS (Applicant Tracking System) score**, which is calculated based on skill matching:

```
ATS Score = (Matched Skills / Required Skills) × 100
```

### Secondary Ranking: Tie-Breaker Score
When two or more candidates have the same ATS score, the system calculates a **tie-breaker score (0-100)** using 6 weighted factors:

---

## Tie-Breaking Factors

### 1. Experience Relevance (30% weight)
- **Why it matters**: More experienced candidates often bring deeper expertise
- **How it's scored**: 
  - 0-10 years experience maps to 0-30 points (linear scale)
  - Capped at 10 years (diminishing returns after that)
- **Example**: 
  - 5 years experience = 15 points
  - 10+ years experience = 30 points

### 2. Number of Matched Skills (25% weight)
- **Why it matters**: More matched skills = better overall fit
- **How it's scored**: 
  - Based on the ratio of matched skills to total required skills
  - `(Matched Skills / Total Job Skills) × 25`
- **Example**: 
  - 8 out of 10 skills matched = 20 points
  - 10 out of 10 skills matched = 25 points

### 3. Education Level (15% weight)
- **Why it matters**: Education indicates formal training and knowledge depth
- **How it's scored**:
  - PhD/Doctorate: 15 points
  - Master's/MBA: 12 points
  - Bachelor's: 9 points
  - Associate/Diploma: 4-6 points
  - Some education mentioned: 3 points
- **Example**: 
  - "Master's in Computer Science" = 12 points
  - "BS in Engineering" = 9 points

### 4. Salary Alignment (15% weight)
- **Why it matters**: Candidates within budget are more likely to accept offers
- **How it's scored**:
  - Perfect alignment (expectation at job's midpoint): 15 points
  - Scales down based on deviation from midpoint
  - Within range but far from midpoint: 5-10 points
  - Outside range: 0 points
- **Example**: 
  - Job: $100K-$140K (midpoint: $120K)
  - Candidate expects $120K = 15 points
  - Candidate expects $130K = 11 points
  - Candidate expects $150K = 0 points

### 5. Location Match (10% weight)
- **Why it matters**: Location fit reduces relocation complexity
- **How it's scored**:
  - Exact location match: 10 points
  - Remote match: 8 points
  - Same city/state (partial match): 5 points
  - No match: 0 points
- **Example**: 
  - Job in "San Francisco, CA", Candidate in "San Francisco, CA" = 10 points
  - Job in "San Francisco, CA", Candidate "Remote" = 8 points
  - Job in "San Francisco, CA", Candidate in "New York, NY" = 0 points

### 6. Comprehensive Match Bonus (5% weight)
- **Why it matters**: Leverages advanced AI matching when available
- **How it's scored**:
  - If comprehensive match score exists, contributes up to 5 points
  - `(Comprehensive Score / 100) × 5`
- **Example**: 
  - Comprehensive match of 90% = 4.5 points
  - No comprehensive match = 0 points (not penalized)

---

## Example Scenario

### Situation: Three candidates all have **80% ATS score**

**Candidate A:**
- Experience: 7 years → 21 points
- Matched Skills: 8/10 → 20 points
- Education: Master's → 12 points
- Salary: $120K (job range: $100-140K, perfect match) → 15 points
- Location: Exact match → 10 points
- Comprehensive: 85% → 4.25 points
- **Tie-Breaker Total: 82.25 points**

**Candidate B:**
- Experience: 3 years → 9 points
- Matched Skills: 8/10 → 20 points
- Education: Bachelor's → 9 points
- Salary: $110K (job range: $100-140K) → 12 points
- Location: Remote → 8 points
- Comprehensive: 90% → 4.5 points
- **Tie-Breaker Total: 62.5 points**

**Candidate C:**
- Experience: 5 years → 15 points
- Matched Skills: 8/10 → 20 points
- Education: PhD → 15 points
- Salary: $150K (outside range) → 0 points
- Location: Different city → 0 points
- Comprehensive: 88% → 4.4 points
- **Tie-Breaker Total: 54.4 points**

### Final Ranking:
1. **Candidate A** (80% ATS, 82.25 tie-breaker)
2. **Candidate B** (80% ATS, 62.5 tie-breaker)
3. **Candidate C** (80% ATS, 54.4 tie-breaker)

---

## API Response

The tie-breaker score is now included in API responses for transparency:

```json
{
  "rank": 1,
  "name": "John Doe",
  "ats_score": 80.0,
  "tie_breaker_score": 82.25,
  "matched_skills": ["Python", "React", "AWS"],
  "experience": 7,
  "education": "Master's in Computer Science",
  "location": "San Francisco, CA",
  "salary_exp": 120000
}
```

---

## Where It's Applied

The tie-breaking system is automatically used in:

1. **`/applications/ranking`** - Candidate ranking by job
2. **`/candidates/ranking/{job_id}`** - Ranking candidates for a specific job
3. **Frontend Candidate Ranking page** - Visual display of ranked candidates

---

## Benefits

✅ **Fair**: Multiple factors ensure no single attribute dominates  
✅ **Transparent**: Tie-breaker score is visible in API responses  
✅ **Consistent**: Same candidates always rank the same way  
✅ **Realistic**: Weights reflect real hiring priorities  
✅ **Flexible**: Can be adjusted if business priorities change  

---

## Implementation Details

### Files Modified:
- `backend/controller/application_controller.py` - Added `_calculate_tie_breaker_score()` and updated `get_ranking_by_job()`
- `backend/controller/candidate_controller.py` - Added `_calculate_tie_breaker_score()` and updated `rank_candidates()`

### Sorting Algorithm:
```python
sorted(candidates, key=lambda x: (x["ats_score"], x["tie_breaker_score"]), reverse=True)
```

This ensures:
1. Primary sort by ATS score (highest first)
2. Secondary sort by tie-breaker score when ATS scores are equal
3. Stable, predictable ordering

---

## Future Enhancements

Potential improvements to consider:

1. **Configurable weights** - Allow recruiters to adjust factor importance
2. **Custom factors** - Add company-specific criteria (e.g., culture fit scores)
3. **Time-based decay** - Favor more recent applications for active roles
4. **Interview performance** - Incorporate interview scores into ranking
5. **Reference checks** - Add reference verification status as a factor

---

**Status**: ✅ Implemented and Active  
**Version**: 1.0  
**Last Updated**: 2026-06-21
