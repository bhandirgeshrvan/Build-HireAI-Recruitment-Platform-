import sys
sys.path.append('/home/ideabliss/Hiring-platform/Build-HireAI-Recruitment-Platform-/backend')

from database_config import SessionLocal
from models.models import Job

db = SessionLocal()
jobs = db.query(Job).filter(Job.title.like('%Full Stack Developer%')).all()

print('Jobs with title containing "Full Stack Developer":')
print(f'Total found: {len(jobs)}\n')

for job in jobs:
    print(f'ID: {job.id}')
    print(f'Title: {job.title}')
    print(f'Company: {job.company}')
    print(f'Created: {job.created_at}')
    print(f'Status: {job.status}')
    print(f'Recruiter ID: {job.recruiter_id}')
    print('-' * 50)

# Decision: Delete duplicates if they're from test runs
print('\nDuplicate Analysis:')
if len(jobs) > 1:
    print(f'Found {len(jobs)} jobs with same title - these appear to be test duplicates')
    print('Recommendation: Keep most recent, delete older ones')
    
    # Keep newest, mark older for deletion
    jobs_sorted = sorted(jobs, key=lambda x: x.created_at, reverse=True)
    print(f'\nKeep: Job ID {jobs_sorted[0].id} (created {jobs_sorted[0].created_at})')
    for old_job in jobs_sorted[1:]:
        print(f'Delete: Job ID {old_job.id} (created {old_job.created_at})')

db.close()
