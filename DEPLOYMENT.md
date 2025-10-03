# 🚀 Deployment Guide for BSU Bokod DMS

## Pre-Deployment Checklist

### ✅ Critical Tasks (Must Complete)
- [ ] **Fix failing test**: `ApplicationApprovalTest > applications index shows processed applications correctly`
- [ ] **Generate APP_KEY** for production in Render dashboard
- [ ] **Verify database connection** with actual PostgreSQL credentials
- [ ] **Test all user roles** (Admin, Manager, Cashier, Student) in staging
- [ ] **Verify file upload functionality** works in production environment
- [ ] **Check email functionality** (if using actual mail service instead of log)

### ✅ Environment Configuration
- [x] `render.yaml` configured with proper environment variables
- [x] Database auto-connection configured
- [x] Docker configuration ready
- [x] Frontend build process configured
- [ ] **Set APP_KEY** in Render environment variables

### ✅ Security Verification
- [x] Debug mode disabled in production (`APP_DEBUG=false`)
- [x] HTTPS enforced (handled by Render)
- [x] Database credentials secured
- [x] Role-based access control implemented
- [x] CSRF protection enabled
- [x] Input validation implemented

### ✅ Performance Optimization
- [x] Route caching enabled
- [x] Config caching enabled  
- [x] View caching enabled
- [x] Frontend assets optimized
- [x] Database queries optimized
- [x] Proper indexes on database tables

## Deployment Steps

### Step 1: Prepare Repository
1. Commit all changes and push to GitHub
2. Ensure all tests pass except the known failing one
3. Verify `render.yaml` configuration

### Step 2: Render.com Setup
1. **Create Web Service**:
   - Repository: Your GitHub repo
   - Runtime: Docker
   - Build Command: (Auto-detected)
   - Start Command: (Defined in Dockerfile)

2. **Create PostgreSQL Database**:
   - Plan: Free (for testing) or paid (for production)
   - Database Name: `dms_production`
   - User: `dms_user`

3. **Environment Variables** (Auto-configured from render.yaml):
   - `APP_KEY` - **GENERATE THIS MANUALLY** in Render dashboard
   - Database credentials - Auto-populated
   - Other settings - From render.yaml

### Step 3: First Deployment
1. Click "Deploy Latest Commit" in Render dashboard
2. Monitor deployment logs for errors
3. Check database connection in logs
4. Verify migrations run successfully

### Step 4: Post-Deployment Verification
1. **Access the application**: Visit your Render URL
2. **Test user registration**: Create admin/manager accounts
3. **Test all major workflows**:
   - Admin: Create dormitory, assign manager
   - Manager: Create rooms, process applications
   - Cashier: Update payment status
   - Student: Apply for accommodation

### Step 5: Data Population
1. **Create initial admin user** via database or registration
2. **Create dormitories** for your campus
3. **Set up initial room configurations**
4. **Test the complete application workflow**

## Troubleshooting Common Issues

### Issue: APP_KEY not set
**Solution**: Generate key manually in Render dashboard:
```bash
# Generate locally and copy to Render
php artisan key:generate --show
```

### Issue: Database connection failed
**Solution**: Verify database credentials in Render dashboard match the database service

### Issue: 500 Internal Server Error
**Solution**: Check logs in Render dashboard, usually configuration or permissions

### Issue: Assets not loading
**Solution**: Verify Vite build completed successfully, check nginx configuration

### Issue: Student login not working
**Solution**: Ensure student authentication guard is properly configured

## Monitoring & Maintenance

### Application Health
- Monitor Render dashboard for uptime
- Check application logs regularly
- Set up log monitoring for errors

### Database Maintenance
- Monitor database storage usage
- Implement backup strategy
- Regular maintenance queries for archived data

### Performance Monitoring
- Monitor response times
- Check memory usage
- Monitor database query performance

## Backup Strategy

### Database Backups
```bash
# Create backup (run on server or locally)
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore backup
psql $DATABASE_URL < backup-file.sql
```

### Application Backups
- Code: Stored in GitHub repository
- Uploaded files: Consider cloud storage (S3, etc.)
- Configuration: Environment variables backed up

## Security Checklist

- [ ] SSL certificate active (auto-handled by Render)
- [ ] Database connections encrypted
- [ ] Environment variables secured
- [ ] No sensitive data in logs
- [ ] Regular security updates applied
- [ ] User access controls verified

## Support & Maintenance

### Regular Tasks
- **Weekly**: Check application logs for errors
- **Monthly**: Review user access and permissions
- **Quarterly**: Update dependencies and security patches
- **As needed**: Monitor and optimize database performance

### Emergency Procedures
1. **Application down**: Check Render status and logs
2. **Database issues**: Contact Render support, restore from backup
3. **Security incident**: Change passwords, review access logs
4. **Data corruption**: Restore from most recent backup

---

## Quick Deploy Commands

```bash
# For emergency fixes
git add .
git commit -m "Production hotfix: [description]"
git push origin main
# Then redeploy in Render dashboard
```

**🚨 Remember**: Always test critical fixes in staging before production deployment!