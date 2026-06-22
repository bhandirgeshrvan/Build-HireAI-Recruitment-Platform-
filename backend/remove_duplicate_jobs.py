import sys
sys.path.append('/home/ideabliss/Hiring-platform/Build-HireAI-Recruitment-Platform-/backend')

from database_config import SessionLocal
from models.models import Job, Application

db = SessionLocal()

# Find duplicate Full Stack Developer jobs
jobs = db.query(Job).filter(Job.title.like('%Full Stack Developer%')).all()

if len(jobs) > 1:
    # Sort by created_at, keep newest
    jobs_sorted = sorted(jobs, key=lambda x: x.created_at, reverse=True)
    
    print(f'Keeping Job ID {jobs_sorted[0].id} (created {jobs_sorted[0].created_at})')
    
    # Delete older duplicates
    for old_job in jobs_sorted[1:]:
        print(f'Deleting Job ID {old_job.id} (created {old_job.created_at})...')
        
        # First delete any applications for this job
        applications = db.query(Application).filter(Application.job_id == old_job.id).all()
        for app in applications:
            db.delete(app)
        print(f'  - Deleted {len(applications)} associated applications')
        
        # Then delete the job
        db.delete(old_job)
        print(f'  - Deleted job')
    
    db.commit()
    print('\n✓ Cleanup complete!')
else:
    print('No duplicates found')

db.close()
